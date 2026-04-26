"use server";

import { grocyClient } from "./grocy";

export async function fetchQuantityUnitConversionsForUnit(unitId: number) {
  try {
    return grocyClient.GET("/objects/{entity}", {
      params: {
        path: { entity: "quantity_unit_conversions" },
        query: { "query[]": ["product_id=null", `from_qu_id=${unitId}`] },
      },
    });
  } catch (error) {
    console.error("Error loading quantity unit conversions:", error);
    throw new Error("Could not fetch quantity unit conversions.");
  }
}

export async function fetchQuantityUnitConversionsForProduct(productId: number) {
  try {
    return grocyClient.GET("/objects/{entity}", {
      params: {
        path: { entity: "quantity_unit_conversions" },
        query: { "query[]": [`product_id=${productId}`] },
      },
    });
  } catch (error) {
    console.error("Error loading quantity unit conversions:", error);
    throw new Error("Could not fetch quantity unit conversions.");
  }
}

export async function updateQuantityUnitConversion(id: number, factor: number) {
  try {
    return grocyClient.PUT("/objects/{entity}/{objectId}", {
      params: { path: { entity: "quantity_unit_conversions", objectId: id } },
      body: {
        factor: factor,
      },
    });
  } catch (error) {
    console.error("Error updating quantity unit conversion:", error);
    throw new Error("Could not update quantity unit conversion.");
  }
}
