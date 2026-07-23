import { globalEvents } from "@/lib/events";
import { NextRequest } from "next/server";
import { findProductInGrocy } from "@/lib/grocy";
import Barcode from "@/lib/barcode";
import * as JsonDecoder from "ts.data.json";
import { ReceivedBarcode, ReceivedApiKey } from "@/interfaces/json-objects";
import { findProductInOpenFoodFacts } from "@/lib/open-food-facts";
import { NotFoundError } from "@/lib/errors";
import { ensureBarcodeExists } from "@/lib/barcode-db";
import { Product } from "@/interfaces/grocy";
import { getApiKey } from "@/lib/user-db";

/************************** endpoints ****************************/

export async function POST(req: Request) {
  const userId = await isAuthorized(req);
  if (userId === undefined) {
    return bbuddyErrorResponse(401, `Unauthorized`);
  }

  if (req.headers.get("content-type") === "application/x-www-form-urlencoded") {
    const formData = await req.formData();
    const code = formData.get("barcode")?.toString();
    if (code !== undefined && code !== null) {
      return processReceivedBarcode(code);
    }
  }

  if (req.headers.get("content-type") === "application/json") {
    const apiRequestDecoder = JsonDecoder.object<ReceivedBarcode>({
      barcode: JsonDecoder.string(),
    });

    const decoded = apiRequestDecoder.decode(await req.json());
    if (decoded.isOk()) {
      return processReceivedBarcode(decoded.value.barcode);
    }
  }

  return processReceivedBarcode("");
}

export async function GET(req: NextRequest) {
  const userId = await isAuthorized(req);
  if (userId === undefined) {
    return bbuddyErrorResponse(401, `Unauthorized`);
  }

  if (req.nextUrl.searchParams.get("barcode")) {
    const code = decodeURIComponent(req.nextUrl.searchParams.get("barcode")!);
    if (code !== undefined && code !== null) return processReceivedBarcode(code);
  }

  if (req.nextUrl.searchParams.get("add")) {
    const code = decodeURIComponent(req.nextUrl.searchParams.get("add")!);
    if (code !== undefined && code !== null) return processReceivedBarcode(code);
  }

  if (req.nextUrl.searchParams.get("text")) {
    const code = decodeURIComponent(req.nextUrl.searchParams.get("text")!);
    if (code !== undefined && code !== null) return processReceivedBarcode(code);
  }

  return processReceivedBarcode("");
}

/************************* supporting code ****************************/

/* Fuzzy logic request matching, may get the apikey as a header, an
 * url parameter, or as a form submit or a JSON encoded payload.
 */
async function isAuthorized(req: Request | NextRequest): Promise<number | undefined> {
  let apiKey;

  if (req.headers.get("bbuddy-api-key")) {
    apiKey = req.headers.get("bbuddy-api-key");
  } else if (req.headers.get("content-type") === "application/x-www-form-urlencoded") {
    const formData = await req.formData();
    apiKey = formData.get("apikey")?.toString();
  }

  if (apiKey === undefined && (req as NextRequest).nextUrl !== undefined) {
    const nReq = req as NextRequest;
    if (nReq.nextUrl.searchParams.get("apikey")) {
      apiKey = nReq.nextUrl.searchParams.get("apikey");
    }
  }

  if (
    apiKey === undefined &&
    req.method !== "GET" &&
    req.headers.get("content-type") === "application/json"
  ) {
    const reqDecoder = JsonDecoder.object<ReceivedApiKey>({
      apikey: JsonDecoder.string(),
    });
    const decoded = reqDecoder.decode(await req.json());
    if (decoded.isOk()) {
      apiKey = decoded.value.apikey;
    }
  }

  if (apiKey !== undefined && apiKey !== null) {
    const res = await getApiKey(apiKey);
    if (res !== undefined && res !== null && res.userId !== undefined) {
      return res.userId;
    }
  }

  return;
}

async function processReceivedBarcode(code: string) {
  let barcode: Barcode;

  try {
    barcode = new Barcode({ barcode: decodeURIComponent(code), scannedAt: new Date() });
  } catch (err) {
    return bbuddyErrorResponse(400, `No valid barcode supplied: ${err}`);
  }

  // Special non-product barcodes are intercepted first. When so identified
  // they are sent to a different stream (special-barcode-stream rather than
  // product-barcode-stream) which means they don't need to be always ignored
  // at the UI side of things where doing so is much more complicated.

  if (barcode.isSpecialBarcode()) {
    const quantity: number | null = barcode.bbuddyQuantity();
    if (quantity !== null) {
      barcode.quantity = quantity;
    }

    if (barcode.isBatteryBarcode() || barcode.isRecipeBarcode()) {
      // Exception: some special barcodes can be processed through the scanner app
      globalEvents.emit("product-barcode-stream", barcode);
      return bbuddySuccessResponse(`Battery/recipe barcode processed. Barcode: ${barcode.code}`);
    } else {
      globalEvents.emit("special-barcode-stream", barcode);
      return bbuddySuccessResponse(`Special barcode processed. Barcode: ${barcode.code}`);
    }
  }

  // It might already exist in the database as a queued product, find that.
  try {
    const model = await ensureBarcodeExists(barcode.code);
    if (model.productId !== undefined && model.productId !== null) {
      barcode.queuedProductId = model.productId;
    }
  } catch (err) {
    if (!(err instanceof NotFoundError)) {
      console.error("Could not fetch barcode from database:", err);
    }
  }

  // It's not a special barcode, so it must be a product barcode.
  // See if grocy knows about it, and if it doesn't, do a final
  // pass at openfoodfacts. (This might change, may just end up
  // doing this async in the UI).

  try {
    findProductInGrocy(barcode)
      .then((product: Product) => {
        globalEvents.emit(
          "product-barcode-stream",
          new Barcode({
            barcode: barcode.code,
            name: product.name,
            quantity: barcode.quantity,
            grocyProductId: product.id,
            queuedProductId: barcode.queuedProductId,
            scannedAt: new Date(),
          }),
        );
      })
      .catch((/*notFoundInfo*/) => {
        // Not found, but might end up sending another emit if found in OpenFoodFacts
        globalEvents.emit(
          "product-barcode-stream",
          new Barcode({
            barcode: barcode.code,
            name: `Unkown product with barcode ${barcode.code}`,
            scannedAt: new Date(),
          }),
        );

        // See if it can be identified after the fact (async)
        findProductInOpenFoodFacts(barcode);
      });

    return bbuddySuccessResponse(`Product barcode processed. Barcode: ${barcode.code}`);
  } catch (err) {
    console.error("Couldn't fetch information from grocy:", err);
  }

  return bbuddyErrorResponse(400, "Invalid request");
}

function bbuddySuccessResponse(message: string): Response {
  return Response.json(
    {
      data: {
        result: message,
      },
      result: {
        result: "OK",
        http_code: 200,
      },
    },
    { status: 200, statusText: "OK" },
  );
}

function bbuddyErrorResponse(code: number, message: string): Response {
  return Response.json(
    {
      data: null,
      result: {
        result: message,
        http_code: code,
      },
    },
    { status: code, statusText: message },
  );
}

// EOF
