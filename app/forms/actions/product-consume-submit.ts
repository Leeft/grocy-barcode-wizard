"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod/v4";
import { grocyClient } from "@/lib/grocy";
import { ProductConsumeSchema } from "../action-form-schemas";

export async function productConsumeSubmit(prevstate: unknown, formData: FormData) {
  const productId = Number(formData.get("base.productId")?.valueOf());
  const barcode = formData.get("base.barcode")?.valueOf();

  if (productId === null || productId === undefined || !productId) {
    console.error("no productId from form?", productId, formData);
  }

  const submission = parseWithZod(formData, { schema: ProductConsumeSchema });

  if (submission.status !== "success") {
    const err = submission.error;
    console.log("submission errors:", err);
    return submission.reply();
  }

  const data = submission.value;

  await grocyClient.POST("/stock/products/{productId}/consume", {
    params: { path: { productId: data.base.productId } },
    body: {
      amount: data.amount.amountShadow,
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
  revalidatePath(`/scan/${barcode}`);
  redirect(`/scan/${barcode}`);
}
