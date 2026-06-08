"use server";

import { revalidatePath } from "next/cache";
import { parseWithZod } from "@conform-to/zod/v4";
import { fetchProduct, grocyClient } from "@/lib/grocy";
import { labelTypeToGrocy } from "@/interfaces/grocy";
import { StockLabelType } from "@/generated/prisma/browser";
import { ProductInventorySchema } from "../action-form-schemas";
import { dateToISODate, toActionState } from "@/lib/utils";

export async function productInventorySubmit(prevstate: unknown, formData: FormData) {
  const productId = Number(formData.get("base.productId")?.valueOf());
  const barcode = formData.get("base.barcode")?.valueOf() as string;

  if (productId === null || productId === undefined || !productId) {
    console.error("no productId from form?", productId, formData);
  }

  const product = await fetchProduct(productId);

  const submission = parseWithZod(formData, { schema: ProductInventorySchema });

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

  // console.log("data is", data);

  const { data: inventoried, error } = await grocyClient.POST("/stock/products/{productId}/inventory", {
    params: { path: { productId: data.base.productId } },
    body: {
      new_amount: data.amount.amountShadow,
      best_before_date: dateToISODate(data.bestBeforeDate!),
      price: product.default_purchase_price_type === 3 ? data.price! / data.amount.amountShadow : data.price,
      shopping_location_id: data.shoppingLocationId,
      location_id: data.locationId,
      stock_label_type: labelTypeToGrocy(data.stockLabelType! as StockLabelType),
      note: data.note,
      transaction_type: "inventory",
    },
  });

  // @ts-expect-error Shut up already
  if (error || inventoried.error_message!) {
    console.log("Error updating inventory:", error);
    return toActionState("Grocy returned an error", "error");
  } else {
    revalidatePath(`/scan/${encodeURIComponent(barcode)}`);
    return toActionState(`${data.amount.amountShadow} of product inventoried`, "success");
  }
}
