"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod/v4";
import {
  fetchProduct,
  fetchProductStock,
  fetchQuantityUnitConversionsResolved,
  grocyClient,
} from "@/lib/grocy";
import { createProductTransferSchema } from "@/forms/actions/product-transfer-schema";

export async function productTransferSubmit(prevstate: unknown, formData: FormData) {
  const productId = Number(formData.get("productId")?.valueOf());
  if (productId === null || productId === undefined || !productId) {
    console.error("no productId from form?", productId, formData);
  }

  const product = await fetchProduct(productId);
  const stock = await fetchProductStock(productId);
  const conversions = await fetchQuantityUnitConversionsResolved(productId);
  const schema = createProductTransferSchema(product, stock, conversions);

  const submission = parseWithZod(formData, { schema: schema });

  if (submission.status !== "success") {
    const err = submission.error;
    console.log("submission errors:", err);
    return submission.reply();
  }

  const data = submission.value;

  await grocyClient.POST("/stock/products/{productId}/transfer", {
    params: { path: { productId: data.productId } },
    body: {
      amount: data.amountShadow,
      location_id_from: data.locationIdFrom,
      location_id_to: data.locationIdTo,
      stock_entry_id: data.stockEntryId,
    },
  });

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath(`/scan/${data.barcode}`);
  redirect(`/scan/${data.barcode}`);
}
