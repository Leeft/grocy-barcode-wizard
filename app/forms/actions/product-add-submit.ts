"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod/v4";
import { ProductAddSchema } from "@/forms/actions/product-add-schema";
import { grocyClient } from "@/lib/grocy";
import { DueDateType, StockLabelType } from "@/generated/prisma/enums";
import { labelTypeToGrocy } from "@/interfaces/grocy";

function dueOrNoExpiryDate(dueDateType: DueDateType, dueDate: Date) {
  if (dueDateType === DueDateType.NO_EXPIRY) return new Date("2999-12-31");
  return dueDate;
}

export async function productAddSubmit(prevstate: unknown, formData: FormData) {
  const submission = parseWithZod(formData, { schema: ProductAddSchema });

  if (submission.status !== "success") {
    const err = submission.error;
    console.log("submission errors:", err);
    return submission.reply();
  }

  const data = submission.value;

  // submit data is {
  //   barcode: '5701018050906',
  //   amount: 1,
  //   bestBeforeDate: 2026-05-08T00:00:00.000Z,
  //   price: undefined,
  //   locationId: undefined,
  //   shoppingLocationId: undefined,
  //   stockLabelType: 'NO_LABEL',
  //   note: undefined
  // }

  await grocyClient.POST("/stock/products/{productId}/add", {
    params: { path: { productId: data.productId } },
    body: {
      amount: data.amount,
      best_before_date: dueOrNoExpiryDate(
        data.dueDateType! as DueDateType,
        data.bestBeforeDate!,
      ).toISOString(),
      price: data.price,
      shopping_location_id: data.shoppingLocationId,
      location_id: data.locationId,
      stock_label_type: labelTypeToGrocy(data.stockLabelType! as StockLabelType),
      note: data.note,
      transaction_type: "purchase",
    },
  });

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath(`/scan/${data.barcode}`);
  redirect(`/scan/${data.barcode}`);
}
