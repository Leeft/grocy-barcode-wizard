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
import { createProductConsumeSchema } from "./product-consume-schema";

export async function productConsumeSubmit(prevstate: unknown, formData: FormData) {
  const productId = Number(formData.get("productId")?.valueOf());
  if (productId === null || productId === undefined || !productId) {
    console.error("no productId from form?", productId, formData);
  }

  const product = await fetchProduct(productId);
  const stock = await fetchProductStock(productId);
  const conversions = await fetchQuantityUnitConversionsResolved(productId);
  const schema = createProductConsumeSchema(product, stock, conversions);

  const submission = parseWithZod(formData, { schema: schema });

  if (submission.status !== "success") {
    const err = submission.error;
    console.log("submission errors:", err);
    return submission.reply();
  }

  const data = submission.value;

  await grocyClient.POST("/stock/products/{productId}/consume", {
    params: { path: { productId: data.productId } },
    body: {
      amount: data.amountShadow,
      transaction_type: "consume",
      spoiled: data.spoiled ? true : false,
      //stock_entry_id: ...,
      //recipe_id: ...,
      location_id: data.locationId,
      exact_amount: true,
      allow_subproduct_substitution: true,
    },
  });

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath(`/scan/${data.barcode}`);
  redirect(`/scan/${data.barcode}`);
}
