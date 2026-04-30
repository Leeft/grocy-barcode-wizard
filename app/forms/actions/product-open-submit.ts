"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { grocyClient } from "@/lib/grocy";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ProductOpenSchema } from "@/forms/actions/product-open-schema";

export async function productOpenSubmit(prevstate: unknown, formData: FormData) {
  const submission = parseWithZod(formData, { schema: ProductOpenSchema });

  if (submission.status !== "success") {
    const err = submission.error;
    console.log("submission errors:", err);
    return submission.reply();
  }

  const data = submission.value;

  await grocyClient.POST("/stock/products/{productId}/open", {
    params: { path: { productId: data.productId } },
    body: {
      amount: data.amount,
      stock_entry_id: data.stockEntryId,
      allow_subproduct_substitution: data.allowSubproductSubstitution,
    },
  });

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath(`/scan/${data.barcode}`);
  redirect(`/scan/${data.barcode}`);
}
