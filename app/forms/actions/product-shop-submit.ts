"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod/v4";
import { createProductShopSchema } from "@/forms/actions/product-shop-schema";
import { grocyClient } from "@/lib/grocy";

export async function productShopSubmit(prevstate: unknown, formData: FormData) {
  const productId = Number(formData.get("productId")?.valueOf());
  if (productId === null || productId === undefined || !productId) {
    console.error("no productId from form?", productId, formData);
  }

  const schema = createProductShopSchema();

  const submission = parseWithZod(formData, { schema: schema });

  if (submission.status !== "success") {
    const err = submission.error;
    console.log("submission errors:", err);
    return submission.reply();
  }

  const data = submission.value;

  await grocyClient.POST("/stock/shoppinglist/add-product", {
    body: {
      product_id: data.productId,
      qu_id: data.amountQuantityUnitId,
      list_id: data.listId,
      product_amount: data.amountShadow,
      note: data.note,
    },
  });

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath(`/scan/${data.barcode}`);
  redirect(`/scan/${data.barcode}`);
}
