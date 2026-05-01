"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod/v4";
import { createProductAddSchema } from "@/forms/actions/product-add-schema";
import {
  fetchProduct,
  fetchProductStock,
  fetchQuantityUnitConversionsResolved,
  grocyClient,
} from "@/lib/grocy";
import { DueDateType, PurchasePriceType, StockLabelType } from "@/generated/prisma/enums";
import { labelTypeToGrocy } from "@/interfaces/grocy";

function dueOrNoExpiryDate(dueDateType: DueDateType, dueDate: Date) {
  if (dueDateType === DueDateType.NO_EXPIRY) return new Date("2999-12-31");
  return dueDate;
}

export async function productAddSubmit(prevstate: unknown, formData: FormData) {
  const productId = Number(formData.get("productId")?.valueOf());
  if (productId === null || productId === undefined || !productId) {
    console.error("no productId from form?", productId, formData);
  }

  const product = await fetchProduct(productId);
  const stock = await fetchProductStock(productId);
  const conversions = await fetchQuantityUnitConversionsResolved(productId);
  const schema = createProductAddSchema(product, stock, conversions);

  const submission = parseWithZod(formData, { schema: schema });

  if (submission.status !== "success") {
    const err = submission.error;
    console.log("submission errors:", err);
    return submission.reply();
  }

  const data = submission.value;

  await grocyClient.POST("/stock/products/{productId}/add", {
    params: { path: { productId: data.productId } },
    body: {
      amount: data.amount,
      best_before_date: dueOrNoExpiryDate(
        data.dueDateType! as DueDateType,
        data.bestBeforeDate!,
      ).toISOString(),
      price:
        data.purchasePriceType === PurchasePriceType.TOTAL_PRICE ? data.price! / data.amount : data.price,
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
