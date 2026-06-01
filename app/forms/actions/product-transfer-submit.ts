"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod/v4";
import { grocyClient } from "@/lib/grocy";
import { ProductTransferSchema } from "../action-form-schemas";

export async function productTransferSubmit(prevstate: unknown, formData: FormData) {
  console.log("submit", formData);
  const productId = Number(formData.get("base.productId")?.valueOf());
  const barcode = formData.get("base.barcode")?.valueOf();

  if (productId === null || productId === undefined || !productId) {
    console.error("no productId from form?", productId, formData);
  }

  const submission = parseWithZod(formData, { schema: ProductTransferSchema });

  if (submission.status !== "success") {
    const err = submission.error;
    console.log("submission errors:", err);
    return submission.reply();
  }

  const data = submission.value;

  await grocyClient.POST("/stock/products/{productId}/transfer", {
    params: { path: { productId: data.base.productId } },
    body: {
      amount: data.amount.amountShadow,
      location_id_from: data.locationIdFrom,
      location_id_to: data.locationIdTo,
      stock_entry_id: data.stockEntryId,
    },
  });

  revalidatePath(`/scan/${barcode}`);
  redirect(`/scan/${barcode}`);
}
