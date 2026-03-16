import { globalEvents } from "@/app/lib/events";
import { NextRequest } from "next/server";
import ProductLookup from "@/app/lib/lookup";
import { grocyClient } from "@/app/lib/grocy";
import Barcode from "@/app/lib/barcode";

// TODO FIXME: Access control

/************************** endpoints ****************************/

export async function POST(req: Request) {
  if (req.headers.get("content-type") === "application/x-www-form-urlencoded") {
    const formData = await req.formData();
    const code = formData.get("barcode")?.toString();
    if (code !== undefined && code !== null) return processReceivedBarcode(code);
  }

  if (req.headers.get("content-type") === "application/json") {
    const json: any = await req.json();
    if (json.barcode !== undefined && json.barcode !== null) return processReceivedBarcode(json.barcode);
  }

  return processReceivedBarcode("");
}

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("barcode")) {
    const code = req.nextUrl.searchParams.get("barcode");
    if (code !== undefined && code !== null) return processReceivedBarcode(code);
  }

  if (req.nextUrl.searchParams.get("add")) {
    const code = req.nextUrl.searchParams.get("add");
    if (code !== undefined && code !== null) return processReceivedBarcode(code);
  }

  if (req.nextUrl.searchParams.get("text")) {
    const code = req.nextUrl.searchParams.get("text");
    if (code !== undefined && code !== null) return processReceivedBarcode(code);
  }

  return processReceivedBarcode("");
}

/************************* supporting code ****************************/

async function processReceivedBarcode(code: string) {
  let barcode: Barcode;

  try {
    barcode = new Barcode({ barcode: code });
  } catch (err) {
    return bbuddyErrorResponse(400, "No valid barcode supplied");
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
    return bbuddySuccessResponse(`Special barcode processed. Barcode: ${barcode.barcode}`);
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
        globalEvents.emit("product-barcode-stream", new Barcode({
          barcode: notFoundBarcode.barcode,
          name: `Unkown product with barcode ${notFoundBarcode.barcode}`
        }));
        // See if it can be identified after the fact (async)
        findProductInOpenFoodFacts(barcode);
      });

    return bbuddySuccessResponse(`Product barcode processed. Barcode: ${barcode.barcode}`);
  } catch (err: any) {
    console.error("Couldn't fetch information from grocy:", err);
  }

  return bbuddyErrorResponse(400, "Invalid request");
}

async function findProductInGrocy(barcode: Barcode): Promise<Barcode> {
  // GRCY:P:* codes contain a product number and potentially other data
  // but for most purposes they'll be treated as a "regular" product
  // barcode, sent to the products data stream. They just need a
  // different API call for the lookup.
  const productNumber: number | null = barcode.grocyProductNumber();

  if (productNumber !== null && productNumber > 0) {
    console.log(`Looking up by GRCY ID in grocy at ${process.env.GROCY_API_URL}`);

    const {
      data, // only present if 2XX response
      error, // only present if 4XX or 5XX response
    } = await grocyClient.GET("/stock/products/{productId}", {
      params: { path: { productId: productNumber } },
    });

    // Might get an inactive code, which isn't "wrong" for us (still
    // need to use it) but it needs special handling. Just return the
    // barcode we have already and use that, pretend all is well.
    if (
      data === undefined &&
      error !== undefined &&
      error?.error_message !== undefined &&
      /does not exist or is inactive/.test(error.error_message)
    ) {
      return Promise.reject(barcode);
    }

    if (data !== undefined) {
      return Promise.resolve(
        new Barcode({
          barcode: barcode.barcode,
          name: data.product?.name,
          product: data.product,
          // @ts-ignore : not in OpenAPI spec, no typescript here
          quantity: data.stock_amount_aggregated,
        }),
      );
    }
  }

  // There is no productnumber, but there may be a barcode for it

  const {
    data, // only present if 2XX response
    error, // only present if 4XX or 5XX response
  } = await grocyClient.GET("/stock/products/by-barcode/{barcode}", {
    params: { path: { barcode: barcode.barcode } },
  });

  if (data !== undefined) {
    return Promise.resolve(
      new Barcode({
        barcode: barcode.barcode,
        name: data.product?.name,
        product: data.product,
        // @ts-ignore : not in OpenAPI spec, no typescript here
        quantity: data.stock_amount_aggregated,
      }),
    );
  } else {
    return Promise.reject(barcode);
  }
}

function findProductInOpenFoodFacts(barcode: Barcode): void {
  new ProductLookup().lookupOpenFoodFacts(barcode).then((json: any) => {
    if (json.status) {
      const foundBarcode: Barcode = new Barcode({
        barcode: barcode.barcode,
        name: json.product.product_name_en,
      });
      console.log(`Found openfoodfacts product as ${foundBarcode.name}`);
      globalEvents.emit("product-barcode-stream", foundBarcode);
    } else {
      console.log(`Barcode ${barcode.barcode} was not found at openfoodfacts API`);
    }
  });
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
