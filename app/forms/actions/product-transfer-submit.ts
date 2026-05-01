"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { grocyClient } from "@/lib/grocy";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ProductTransferSchema } from "@/forms/actions/product-transfer-schema";

export async function productTransferSubmit(prevstate: unknown, formData: FormData) {
  const submission = parseWithZod(formData, { schema: ProductTransferSchema });

  if (submission.status !== "success") {
    const err = submission.error;
    console.log("submission errors:", err);
    return submission.reply();
  }

  const data = submission.value;

  const res = await grocyClient.POST("/stock/products/{productId}/transfer", {
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
