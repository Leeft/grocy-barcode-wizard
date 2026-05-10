"use server";

import { revalidatePath } from "next/cache";
import { parseWithZod } from "@conform-to/zod/v4";
import { grocyClient } from "@/lib/grocy";
import { Error400, Error500, StockLogEntry } from "@/interfaces/grocy";
import { AddBarcodeToProductSchema } from "@/forms/action-form-schemas";
import { toActionState } from "@/lib/utils";

export async function addBarcodeToProductSubmit(prevstate: unknown, formData: FormData) {
  const productId = Number(formData.get("base.productId")?.valueOf());
  const barcode = formData.get("base.barcode")?.valueOf();

  if (productId === null || productId === undefined || !productId) {
    console.error("no productId from form?", productId, formData);
  }

  const submission = parseWithZod(formData, { schema: AddBarcodeToProductSchema });

  if (submission.status !== "success") {
    console.log("Submission errors for barcode add add:", submission.error);
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

  const { data: res } = await grocyClient.POST("/objects/{entity}", {
    params: { path: { entity: 'product_barcodes' } },
    body: {
      product_id: data.base.productId,
      barcode: data.base.barcode,
      qu_id: data.amount.amountQuantityUnitId,
      shopping_location_id: data.shoppingLocationId,
      amount: data.amount.amount,
      note: data.note,
    },
  });

  const result = res as StockLogEntry[] | Error500 | Error400;

  if ("error_message" in result) {
    console.log("Got an error during submit:", result.error_message);
    return toActionState("Grocy returned an error: " + result.error_message, "error");
  } else {
    revalidatePath(`/scan/${barcode}`);
    toActionState("Product barcode added", "success");
  }
}
