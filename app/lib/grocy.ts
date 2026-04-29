import createClient, { Middleware } from "openapi-fetch";
import type { paths } from "@/interfaces/grocy.d";
import {
  Product,
  ProductBarcode,
  ProductDetailsResponse,
  ProductGroup,
  ProductLocation,
  QuantityUnit,
  QuantityUnitConversion,
  ShoppingLocation,
  StockEntry,
} from "@/interfaces/grocy";
import { cache } from "react";
import Barcode from "@/lib/barcode";

export const baseUrl = process.env.GROCY_API_URL ?? process.env.NEXT_PUBLIC_GROCY_API_URL;

if (baseUrl === undefined) {
  throw new Error("GROCY_API_URL is not configured");
}

export const apiKey = process.env.GROCY_API_KEY ?? process.env.NEXT_PUBLIC_GROCY_API_KEY;

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

export const fetchConfig = cache(async () => {
  try {
    const res = await grocyClient.GET("/system/config", {});
    return res.data as Record<string, never>;
  } catch (error) {
    console.error("Error loading grocy config:", error);
    throw new Error("Could not fetch grocy config.");
  }
});

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

export const fetchProductDetails = cache(async (productId: number) => {
  try {
    const res = await grocyClient.GET("/stock/products/{productId}", {
      params: {
        path: { productId: productId },
      },
    });
    return res.data as ProductDetailsResponse;
  } catch (error) {
    console.error("Error loading product details:", error);
    throw new Error("Could not fetch product details.");
  }
});

export const fetchProductStock = cache(async (productId: number) => {
  if ( productId === undefined || productId <= 0 ) return [];
  try {
    const res = await grocyClient.GET("/stock/products/{productId}/entries", {
      params: {
        path: { productId: productId },
      },
    });
    return res.data as StockEntry[];
  } catch (error) {
    console.error("Error loading product stock entries:", error);
    throw new Error("Could not fetch product stock entries.");
  }
});

export async function findProductInGrocy(barcode: Barcode): Promise<Product> {
  // GRCY:P:* codes contain a product number and potentially other data
  // but for most purposes they'll be treated as a "regular" product
  // barcode, sent to the products data stream. They just need a
  // different API call for the lookup.
  let grocyProductId: number | null = barcode.grocyProductId ?? barcode.grocyProductNumber();

  if (grocyProductId === undefined || grocyProductId === null || grocyProductId < 1) {
    // There is no productnumber, but there may be a barcode for it
    const { data, error } = await grocyClient.GET("/objects/{entity}", {
      params: {
        path: { entity: "product_barcodes" },
        query: { order: "product_id:desc", "query[]": [`barcode=${barcode.code}`] },
      },
    });
    if (error !== undefined) {
      console.error("Could not fetch barcodes from grocy:", error);
    }

    // Technically it's a list of barcodes, but it should always be just a
    // single barcode. The search goes for newest products first either way.
    const barcodes = data as ProductBarcode[];
    if (barcodes.length > 0 && barcodes[0]?.product_id !== undefined) {
      grocyProductId = barcodes[0]?.product_id;
    }

    //console.log( "found by barcode for grocyProductId", barcode.code, data, error)
  }

  if (grocyProductId !== null && grocyProductId > 0) {
    const {
      data, // only present if 2XX response
      error, // only present if 4XX or 5XX response
    } = await grocyClient.GET("/objects/{entity}/{objectId}", {
      params: { path: { entity: "products", objectId: grocyProductId } },
    });

    const product = data as Product;

    if (product !== undefined && product.id !== undefined) {
      return Promise.resolve(product);
    }

    console.log(
      "Grocy returned no product data for productId, rejecting promise for",
      grocyProductId,
      product,
      error,
    );
    return Promise.reject(error);
  }

  return Promise.reject({ error_message: "Could not find product in grocy by id or barcode" });
}
