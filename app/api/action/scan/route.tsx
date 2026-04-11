import { globalEvents } from "@/lib/events";
import { NextRequest } from "next/server";
import { findProductInGrocy } from "@/lib/grocy";
import Barcode from "@/lib/barcode";
import * as JsonDecoder from "ts.data.json";
import { ReceivedBarcode } from "@/interfaces/json-objects";
import { findProductInOpenFoodFacts } from "@/lib/open-food-facts";
import { getBarcode, writeBarcode } from "@/lib/barcode-db";
import { NotFoundError } from "@/lib/errors";

// TODO FIXME: Access control

/************************** endpoints ****************************/

export async function POST(req: Request) {
  if (req.headers.get("content-type") === "application/x-www-form-urlencoded") {
    const formData = await req.formData();
    const code = formData.get("barcode")?.toString();
    if (code !== undefined && code !== null)
      return processReceivedBarcode(code);
  }

  if (req.headers.get("content-type") === "application/json") {
    const apiRequestDecoder = JsonDecoder.object<ReceivedBarcode>(
      {
        barcode: JsonDecoder.string(),
      },
      "ReceivedBarcode",
    );

    const decoded = apiRequestDecoder.decode(await req.json());
    if (decoded.isOk()) {
      return processReceivedBarcode(decoded.value.barcode);
    }
  }

  return processReceivedBarcode("");
}

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("barcode")) {
    const code = req.nextUrl.searchParams.get("barcode");
    if (code !== undefined && code !== null)
      return processReceivedBarcode(code);
  }

  if (req.nextUrl.searchParams.get("add")) {
    const code = req.nextUrl.searchParams.get("add");
    if (code !== undefined && code !== null)
      return processReceivedBarcode(code);
  }

  if (req.nextUrl.searchParams.get("text")) {
    const code = req.nextUrl.searchParams.get("text");
    if (code !== undefined && code !== null)
      return processReceivedBarcode(code);
  }

  return processReceivedBarcode("");
}

/************************* supporting code ****************************/

async function processReceivedBarcode(code: string) {
  let barcode: Barcode;

  try {
    barcode = new Barcode({ barcode: code });
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

    globalEvents.emit("special-barcode-stream", barcode);
    return bbuddySuccessResponse(
      `Special barcode processed. Barcode: ${barcode.barcode}`,
    );
  }

  // Make sure the barcode is known in the database, so state can
  // be stored for it.
  try {
    writeBarcode(barcode.toBasic());
  } catch (e) {
    console.error("Could not store/update barcode in database:", e);
  }

  // TODO: Combine the calls above and below for efficiency

  // It might already exist in the database as a queued product, find that.
  try {
    const model = await getBarcode(barcode.toBasic());
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
      .then((productBarcode) => {
        globalEvents.emit("product-barcode-stream", productBarcode);
      })
      .catch((notFoundBarcode) => {
        // Not found, but might end up sending another emit if found in OpenFoodFacts
        globalEvents.emit(
          "product-barcode-stream",
          new Barcode({
            barcode: notFoundBarcode.barcode,
            name: `Unkown product with barcode ${notFoundBarcode.barcode}`,
            queuedProductId: notFoundBarcode.queuedProductId,
          }),
        );
        // See if it can be identified after the fact (async)
        findProductInOpenFoodFacts(barcode);
      });

    return bbuddySuccessResponse(
      `Product barcode processed. Barcode: ${barcode.barcode}`,
    );
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
