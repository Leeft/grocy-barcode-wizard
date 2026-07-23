"use server";

import { revalidatePath } from "next/cache";
import { parseWithZod } from "@conform-to/zod/v4";
import { grocyClient } from "@/lib/grocy";
import { ProductOpenSchema } from "../action-form-schemas";
import { toActionState } from "@/lib/utils";

export async function productOpenSubmit(prevstate: unknown, formData: FormData) {
  const productId = Number(formData.get("base.productId")?.valueOf());
  const barcode = formData.get("base.barcode")?.valueOf() as string;

  if (productId === null || productId === undefined || !productId) {
    console.error("no productId from form?", productId, formData);
  }

  const submission = parseWithZod(formData, { schema: ProductOpenSchema });

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

  // const { data: res } = 
  await grocyClient.POST("/stock/products/{productId}/open", {
    params: { path: { productId: productId } },
    body: {
      amount: data.amount.amount,
      stock_entry_id: data.stockEntryId,
      allow_subproduct_substitution: data.allowSubproductSubstitution,
    },
  });

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath(`/scan/${encodeURIComponent(barcode)}`);
  return toActionState(`${data.amount.amount} of product opened`, "success");
}
