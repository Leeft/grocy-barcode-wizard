"use server";

import { revalidatePath } from "next/cache";
import { parseWithZod } from "@conform-to/zod/v4";
import { grocyClient } from "@/lib/grocy";
import { ProductShopSchema } from "../action-form-schemas";
import { toActionState } from "@/lib/utils";
import { Error400, Error500 } from "@/interfaces/grocy";

export async function productShopSubmit(prevstate: unknown, formData: FormData) {
  const productId = Number(formData.get("base.productId")?.valueOf());
  const barcode = formData.get("base.barcode")?.valueOf() as string;

  if (productId === null || productId === undefined || !productId) {
    console.error("no productId from form?", productId, formData);
  }

  const submission = parseWithZod(formData, { schema: ProductShopSchema });

  if (submission.status !== "success") {
    console.log("Submission errors for shoplist add:", submission.error);
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

  const res = await grocyClient.POST("/stock/shoppinglist/add-product", {
    body: {
      product_id: data.base.productId,
      qu_id: data.amount.amountQuantityUnitId,
      list_id: data.listId,
      product_amount: data.amount.amountShadow,
      note: data.note,
    },
  });

  const result = res as Error400 | Error500;

  if ("error_message" in result) {
    console.log("Got an error during submit:", result.error_message);
    return toActionState("Grocy returned an error: " + result.error_message, "error");
  } else {
    // Revalidate the cache for the invoices page and redirect the user.
    revalidatePath(`/scan/${encodeURIComponent(barcode)}`);
    return toActionState(`Added to shopping list`, "success");
  }
}
