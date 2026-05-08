"use server";

import { revalidatePath } from "next/cache";
import { parseWithZod } from "@conform-to/zod/v4";
import { grocyClient } from "@/lib/grocy";
import { DueDateType, PurchasePriceType, StockLabelType } from "@/generated/prisma/enums";
import { Error400, Error500, labelTypeToGrocy, StockLogEntry } from "@/interfaces/grocy";
import { ProductAddSchema } from "../action-form-schemas";
import { toActionState } from "@/lib/utils";

function dueOrNoExpiryDate(dueDateType: DueDateType, dueDate: Date) {
  if (dueDateType === DueDateType.NO_EXPIRY) return new Date("2999-12-31");
  return dueDate;
}

export async function productAddSubmit(prevstate: unknown, formData: FormData) {
  const productId = Number(formData.get("base.productId")?.valueOf());
  const barcode = formData.get("base.barcode")?.valueOf();

  if (productId === null || productId === undefined || !productId) {
    console.error("no productId from form?", productId, formData);
  }

  const submission = parseWithZod(formData, { schema: ProductAddSchema });

  if (submission.status !== "success") {
    console.log("Submission errors for product add:", submission.error);
    const submissionErrors = submission.error;
    if (submissionErrors !== undefined && submissionErrors !== null) {
      const keys = Object.keys(submissionErrors);
      const errors: string[] = [];
      keys.forEach((key) => {
        if (submissionErrors[key]) errors.push(`${key}: ` + submissionErrors[key].join("; ") + "\n");
      });
      return toActionState("Form validation errors: " + errors.join("\n"), "error");
    }
    return toActionState("Submission error", "error");
  }

  const data = submission.value;

  const { data: res } = await grocyClient.POST("/stock/products/{productId}/add", {
    params: { path: { productId: data.base.productId } },
    body: {
      amount: data.amount.amount,
      best_before_date: dueOrNoExpiryDate(
        data.dueDateType! as DueDateType,
        data.bestBeforeDate!,
      ).toISOString(),
      price:
        data.purchasePriceType === PurchasePriceType.TOTAL_PRICE
          ? data.price! / data.amount.amount
          : data.price,
      shopping_location_id: data.shoppingLocationId,
      location_id: data.locationId,
      stock_label_type: labelTypeToGrocy(data.stockLabelType as StockLabelType),
      note: data.note,
      transaction_type: "purchase",
    },
  });

  const result = res as StockLogEntry[] | Error500 | Error400;

  if ("error_message" in result) {
    console.log("Got an error during submit:", result.error_message);
    return toActionState("Grocy returned an error: " + result.error_message, "error");
  } else {
    revalidatePath(`/scan/${barcode}`);
    toActionState("Product created", "success");
  }
}
