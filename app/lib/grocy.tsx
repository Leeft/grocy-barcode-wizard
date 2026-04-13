import createClient, { Middleware } from "openapi-fetch";
import type { paths } from "@/interfaces/grocy.d";
import {
  Product,
  ProductGroup,
  ProductLocation,
  QuantityUnit,
  QuantityUnitConversion,
  ShoppingLocation,
} from "@/interfaces/grocy";
import { cache } from "react";
import Barcode from "@/lib/barcode";

let baseUrl = process.env.GROCY_API_URL;
if (baseUrl === undefined) {
  baseUrl = process.env.NEXT_PUBLIC_GROCY_API_URL;
}
if (baseUrl === undefined) {
  throw new Error("GROCY_API_URL is not configured");
}

let apiKey = process.env.GROCY_API_KEY;
if (apiKey === undefined) {
  apiKey = process.env.NEXT_PUBLIC_GROCY_API_KEY;
}
if (apiKey === undefined) {
  throw new Error("GROCY_API_KEY is not configured");
}

const myMiddleware: Middleware = {
  async onRequest({ request /*options*/ }) {
    request.headers.set("GROCY-API-KEY", apiKey);
    request.headers.set("Accept", "application/json");
    return request;
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async onResponse({ request, response /*options*/ }) {
    const { body, ...resOptions } = response;
    // change status of response
    return new Response(body, { ...resOptions, status: 200 });
  },
  async onError({ error }) {
    // wrap errors thrown by fetch
    return new Error("Oh noes, fetch failed", { cause: error });
  },
};

export const grocyClient = createClient<paths>({ baseUrl: baseUrl });
grocyClient.use(myMiddleware);

export const fetchQuantityUnits = cache(async () => {
  try {
    const res = await grocyClient.GET("/objects/{entity}", {
      params: {
        path: { entity: "quantity_units" },
        query: { order: "id:asc", "query[]": ["active=1"] },
      },
    });
    return res.data as QuantityUnit[];
  } catch (error) {
    console.error("Error loading quantity units:", error);
    throw new Error("Could not fetch quantity units.");
  }
});

export const fetchQuantityUnitConversions = cache(async () => {
  try {
    const res = await grocyClient.GET("/objects/{entity}", {
      params: {
        path: { entity: "quantity_unit_conversions" },
        query: { "query[]": ["product_id=null"] },
      },
    });
    return res.data as QuantityUnitConversion[];
  } catch (error) {
    console.error("Error loading quantity unit conversions:", error);
    throw new Error("Could not fetch quantity unit conversions.");
  }
});

export const fetchLocations = cache(async () => {
  try {
    const res = await grocyClient.GET("/objects/{entity}", {
      params: {
        path: { entity: "locations" },
        query: { order: "name:asc", "query[]": ["active=1"] },
      },
    });
    return res.data as ProductLocation[];
  } catch (error) {
    console.error("Error loading locations:", error);
    throw new Error("Could not fetch locations.");
  }
});

export const fetchShoppingLocations = cache(async () => {
  try {
    const res = await grocyClient.GET("/objects/{entity}", {
      params: {
        path: { entity: "shopping_locations" },
        query: { order: "name:asc", "query[]": ["active=1"] },
      },
    });
    return res.data as ShoppingLocation[];
  } catch (error) {
    console.error("Error loading locations:", error);
    throw new Error("Could not fetch locations.");
  }
});

export const fetchProductGroups = cache(async () => {
  try {
    const res = await grocyClient.GET("/objects/{entity}", {
      params: {
        path: { entity: "product_groups" },
        query: { order: "name:asc", "query[]": ["active=1"] },
      },
    });
    return res.data as ProductGroup[];
  } catch (error) {
    console.error("Error loading product groups:", error);
    throw new Error("Could not fetch product groups.");
  }
});

export const fetchProducts = cache(async () => {
  try {
    const res = await grocyClient.GET("/objects/{entity}", {
      params: {
        path: { entity: "products" },
        query: { order: "name:asc", "query[]": ["active=1"] },
      },
    });
    return res.data as Product[];
  } catch (error) {
    console.error("Error loading products:", error);
    throw new Error("Could not fetch products.");
  }
});

export async function findProductInGrocy(barcode: Barcode): Promise<Barcode> {
  // GRCY:P:* codes contain a product number and potentially other data
  // but for most purposes they'll be treated as a "regular" product
  // barcode, sent to the products data stream. They just need a
  // different API call for the lookup.
  const productNumber: number | null = barcode.grocyProductNumber();

  if (productNumber !== null && productNumber > 0) {
    console.log(
      `Looking up by GRCY ID in grocy at ${process.env.GROCY_API_URL}`,
    );

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
          // @ts-expect-error : not in OpenAPI spec, no typescript here
          quantity: data.stock_amount_aggregated,
        }),
      );
    }
  }

  // There is no productnumber, but there may be a barcode for it

  const { data, error } = await grocyClient.GET(
    "/stock/products/by-barcode/{barcode}",
    {
      params: { path: { barcode: barcode.code } },
    },
  );

  if (error) {
    console.error("Could not retrieve by barcode from grocy:", error);
  }

  if (data === undefined || !data.product) {
    return Promise.reject(barcode);
  }

  return Promise.resolve(
    new Barcode({
      barcode: barcode.code,
      name: data.product.name,
      product: data.product,
      queuedProductId: barcode.queuedProductId,
      // @ts-expect-error : not in OpenAPI spec, no typescript here
      quantity: data.stock_amount_aggregated,
    }),
  );
}
