"use server";

import { refresh, revalidatePath } from "next/cache";
import { grocyClient } from "./grocy";
import { StockEntry } from "@/interfaces/grocy";

export const consumeSpecificStockEntry = async (formData: FormData) => {
  const productId = formData.get("productId");
  const stockId = formData.get("stockId");
  const barcode = formData.get("barcode");
  const amount = formData.get("stockAmount");
  await grocyClient
    .POST("/stock/products/{productId}/consume", {
      params: { path: { productId: Number(productId?.toString()) } },
      body: {
        amount: Number(amount?.toString()),
        transaction_type: "consume",
        spoiled: false,
        stock_entry_id: stockId?.toString(),
        allow_subproduct_substitution: false,
      },
    })
    .then(() => {
      refresh();
      revalidatePath(`/scan/${barcode}`);
    });
};

export const consumeOneOfSpecificStockEntry = async (formData: FormData) => {
  const productId = formData.get("productId");
  const stockId = formData.get("stockId");
  const barcode = formData.get("barcode");
  await grocyClient
    .POST("/stock/products/{productId}/consume", {
      params: { path: { productId: Number(productId?.toString()) } },
      body: {
        amount: 1,
        transaction_type: "consume",
        spoiled: false,
        stock_entry_id: stockId?.toString(),
        allow_subproduct_substitution: false,
      },
    })
    .then(() => {
      refresh();
      revalidatePath(`/scan/${barcode}`);
    });
};

export const consumeSpoiledSpecificStockEntry = async (formData: FormData) => {
  const productId = formData.get("productId");
  const stockId = formData.get("stockId");
  const barcode = formData.get("barcode");
  const amount = formData.get("stockAmount");
  await grocyClient
    .POST("/stock/products/{productId}/consume", {
      params: { path: { productId: Number(productId?.toString()) } },
      body: {
        amount: Number(amount?.toString()),
        transaction_type: "inventory-correction",
        spoiled: true,
        stock_entry_id: stockId?.toString(),
        allow_subproduct_substitution: false,
      },
    })
    .then(() => {
      refresh();
      revalidatePath(`/scan/${barcode}`);
    });
};

export const transferSpecificStockEntry = async (formData: FormData) => {
  const productId = formData.get("productId");
  const stockId = formData.get("stockId");
  const barcode = formData.get("barcode");
  const fromLocationId = formData.get("fromLocationId");
  const toLocationId = formData.get("toLocationId");
  if (!fromLocationId || !toLocationId) return;
  //const transferAmount = formData.get("transferAmount");

  const res = await grocyClient.GET("/stock/products/{productId}/entries", {
    params: {
      path: { productId: Number(productId?.toString()) },
      query: { "query[]": [`stock_id=${stockId?.toString()}`] },
    },
  });

  const stock = res.data as StockEntry[];
  const amount = stock[0]?.amount;

  console.log(
    `Transfering all of stock entry ${stockId} with amount ${amount} from location ${fromLocationId} to location ${toLocationId}`,
  );

  return grocyClient
    .POST("/stock/products/{productId}/transfer", {
      params: { path: { productId: Number(productId?.toString()) } },
      body: {
        amount: amount,
        stock_entry_id: stockId?.toString(),
        location_id_from: Number(fromLocationId?.toString()),
        location_id_to: Number(toLocationId?.toString()),
      },
    })
    .then(() => {
      console.log(
        `Transfered stock entry ${stockId} from location ${fromLocationId} to location ${toLocationId}`,
      );
      refresh();
      revalidatePath(`/scan/${barcode}`);
    })
    .catch((err) => {
      console.error("Could not transfer:", err);
    });
};

export const openSpecificStockEntry = async (formData: FormData) => {
  const productId = formData.get("productId");
  const stockId = formData.get("stockId");
  const barcode = formData.get("barcode");
  await grocyClient
    .POST("/stock/products/{productId}/open", {
      params: { path: { productId: Number(productId?.toString()) } },
      body: {
        amount: 1.0,
        stock_entry_id: stockId?.toString(),
        allow_subproduct_substitution: false,
      },
    })
    .then(() => {
      refresh();
      revalidatePath(`/scan/${barcode}`);
    });
};

export const printStockLabel = async (formData: FormData) => {
  const stockEntryId = formData.get("id");
  await grocyClient
    .GET("/stock/entry/{entryId}/printlabel", {
      params: { path: { entryId: Number(stockEntryId) } },
    })
};


export const printProductLabel = async (productId: number) => {
  await grocyClient
    .GET("/stock/products/{productId}/printlabel", {
      params: { path: { productId: productId } },
    })
};
