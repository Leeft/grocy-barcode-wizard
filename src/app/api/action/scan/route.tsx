import { globalEvents } from "@/app/lib/events";
import { Barcode } from "@/interfaces";
import { grocyClient } from "@/app/lib/grocy";
import { NextRequest } from "next/server";
import ProductLookup from "@/app/lib/lookup";
import { bbuddyQuantity, grocyProductNumber, isAnyBarcode, isSpecialBarcode, barcodeToType } from "@/app/lib/barcodes";

// TODO FIXME: Access control

/************************** endpoints ****************************/

export async function POST(req: Request) {
  const barcode: Barcode = { barcode: "" };

  if (req.headers.get("content-type") === "application/x-www-form-urlencoded") {
    const formData = await req.formData();
    const code = formData.get("barcode")?.toString();
    if (code !== undefined && code !== null) {
      barcode.barcode = code;
    }
  } else {
    const json: any = await req.json();
    barcode.barcode = json.barcode;
  }

  return FetchFromGrocy(barcode);
}

export async function GET(req: NextRequest) {
  const barcode: Barcode = { barcode: "" };

  if (req.nextUrl.searchParams.get("barcode")) {
    const code = req.nextUrl.searchParams.get("barcode");
    if (code !== undefined && code !== null) {
      barcode.barcode = code;
    }
  } else if (req.nextUrl.searchParams.get("add")) {
    const code = req.nextUrl.searchParams.get("add");
    if (code !== undefined && code !== null) {
      barcode.barcode = code;
    }
  } else if (req.nextUrl.searchParams.get("text")) {
    const code = req.nextUrl.searchParams.get("text");
    if (code !== undefined && code !== null) {
      barcode.barcode = code;
    }
  }

  return FetchFromGrocy(barcode);
}

/************************* supporting code ****************************/

async function FetchFromGrocy(barcode: Barcode) {
  //
  if (!isAnyBarcode(barcode.barcode)) {
    return Response.json(
      {
        data: null,
        result: {
          result: "No barcode supplied",
          http_code: 400,
        },
      },
      { status: 400, statusText: "No barcode supplied" },
    );
  }

  const productNumber = grocyProductNumber(barcode.barcode);

  try {
      barcode.type = barcodeToType( barcode.barcode );
    } catch (err) {
      console.error( err );
    };

  // Special non-product number barcodes are intercepted first before
  // proceeding; they are sent to a different stream so it is easier to
  // ignore them where they should be.
  //
  // (This code here is a bit messy already anyway, want to keep the
  // presentation side of things much more readable though).

  if (productNumber === 0 && isSpecialBarcode(barcode.barcode)) {
    const quantity: number | null = bbuddyQuantity(barcode.barcode);
  
    if (quantity !== null) {
      barcode.quantity = quantity;
    }

    console.log( "emitting", barcode );
  
    globalEvents.emit("special-match", barcode); // Notify all connected SSE clients

    return Response.json(
      {
        data: {
          result: `Special barcode scanned. Barcode: ${barcode.barcode}`,
        },
        result: {
          result: "OK",
          http_code: 200,
        },
      },
      { status: 200, statusText: "OK" },
    );
  }
  
  // It's not a special barcode, but it might have a product number which
  // needs looking up. And if it's not a product number, it might be a
  // product we've not seen before yet.

  if (productNumber > 0) {
    console.log("looking up by GRCY in grocy");

    try {
      let {
        data, // only present if 2XX response
        error, // only present if 4XX or 5XX response
      } = await grocyClient.GET("/stock/products/{productId}", {
        params: { path: { productId: productNumber } },
      });

      if ( data === undefined && error !== undefined && error.error_message !== undefined && /does not exist or is inactive/.test( error.error_message ) ) {
        globalEvents.emit("product-match", barcode); // Notify all connected SSE clients

        return Response.json(
          {
            data: {
              result: `Inactive barcode scanned. Barcode: ${barcode.barcode}`,
            },
            result: {
              result: "OK",
              http_code: 200,
            },
          },
          { status: 200, statusText: "OK" },
        );
      }

      if (data !== undefined) {
        var raw: any = data; // allow for values not in the spec
        barcode.name = data.product?.name;
        barcode.quantity = raw.stock_amount_aggregated; // not in OpenAPI spec
        barcode.product = data.product;
        if (barcode.quantity !== undefined && barcode.quantity > 0) {
          barcode.location = data.location;
        }

        globalEvents.emit("product-match", barcode); // Notify all connected SSE clients

        return Response.json(
          {
            data: {
              result: `Unknown barcode scanned. Barcode: ${barcode.barcode}`,
            },
            result: {
              result: "OK",
              http_code: 200,
            },
          },
          { status: 200, statusText: "OK" },
        );
      } else if (
        error !== undefined &&
        error.error_message !== undefined &&
        error.error_message.match(/^No product with barcode .* found$/)
      ) {
        // Give it another chance; failure to fetch the product isn't fatal.
        var raw: any = data; // allow for values not in the spec
        // barcode.name = data.product?.name;
        // barcode.quantity = raw.stock_amount_aggregated; // not in OpenAPI spec
        // barcode.product = data.product;
        // if (barcode.quantity !== undefined && barcode.quantity > 0) {
        //   barcode.location = data.location;
        // }

        globalEvents.emit("product-match", barcode); // Notify all connected SSE clients
        return Response.json(
          {
            data: {
              result: `Unknown barcode scanned. Barcode: ${barcode.barcode}`,
            },
            result: {
              result: "OK",
              http_code: 200,
            },
          },
          { status: 200, statusText: "OK" },
        );
      }
    } catch (error) {
      console.error("Couldn't fetch information from grocy by grcy id:", error);
    }
  }

  try {
    let {
      data, // only present if 2XX response
      error, // only present if 4XX or 5XX response
    } = await grocyClient.GET("/stock/products/by-barcode/{barcode}", {
      params: { path: { barcode: barcode.barcode } },
    });

    // Give it another chance; failure to fetch the product isn't fatal.
    if (
      error !== undefined &&
      error.error_message !== undefined &&
      error.error_message.match(/^No product with barcode .* found$/)
    ) {
      globalEvents.emit("product-match", barcode); // Notify all connected SSE clients

      const scanners = new ProductLookup();
      scanners.lookupOpenFoodFacts(barcode);

      return Response.json(
        {
          data: {
            result: `Unknown barcode scanned. Barcode: ${barcode.barcode}`,
          },
          result: {
            result: "OK",
            http_code: 200,
          },
        },
        { status: 200, statusText: "OK" },
      );
    }

    if (data !== undefined) {
      var raw: any = data; // allow for values not in the spec
      barcode.name = data.product?.name;
      barcode.quantity = raw.stock_amount_aggregated; // not in OpenAPI spec
      barcode.product = data.product;
      if (barcode.quantity !== undefined && barcode.quantity > 0) {
        barcode.location = data.location;
      }

      globalEvents.emit("product-match", barcode); // Notify all connected SSE clients

      return Response.json(
        {
          data: {
            result: `Unknown barcode looked up, found name: ${barcode.name}. Barcode: ${barcode.barcode}`,
          },
          result: {
            result: "OK",
            http_code: 200,
          },
        },
        { status: 200, statusText: "OK" },
      );
    } else {
      console.error(`Couldn't retrieve barcode ${barcode} from grocy:`, error);
    }
  } catch (error) {
    console.error("Couldn't fetch information from grocy:", error);
  }

  return Response.json(
    {
      data: null,
      result: {
        result: "Invalid request",
        http_code: 400,
      },
    },
    { status: 400, statusText: "Invalid request" },
  );
}
