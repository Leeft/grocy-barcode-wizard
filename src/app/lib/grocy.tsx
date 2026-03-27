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
