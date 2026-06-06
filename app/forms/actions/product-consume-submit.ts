"use server";

import { revalidatePath } from "next/cache";
import { parseWithZod } from "@conform-to/zod/v4";
import { grocyClient } from "@/lib/grocy";
import { ProductConsumeSchema } from "../action-form-schemas";
import { toActionState } from "@/lib/utils";

export async function productConsumeSubmit(prevstate: unknown, formData: FormData) {
  const productId = Number(formData.get("base.productId")?.valueOf());
  const barcode = formData.get("base.barcode")?.valueOf() as string;

  if (productId === null || productId === undefined || !productId || barcode === undefined) {
    console.error("no productId from form?", productId, formData);
  }

  const submission = parseWithZod(formData, { schema: ProductConsumeSchema });

  if (submission.status !== "success") {
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

  const { data: stockEntry, error } = await grocyClient.POST("/stock/products/{productId}/consume", {
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

  // @ts-expect-error Shut up already
  if (error || stockEntry.error_message!) {
    console.log("Error updating stock:", error);
    return toActionState("Grocy returned an error", "error");
  } else {
    revalidatePath(`/scan/${encodeURIComponent(barcode)}`);
    if (data.spoiled) {
      return toActionState(`${data.amount.amountShadow} of product spoiled`, "success");
    } else {
      return toActionState(`${data.amount.amountShadow} of product consumed`, "success");
    }
  }
}
