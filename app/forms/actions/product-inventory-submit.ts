"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod/v4";
import { createProductInventorySchema } from "@/forms/actions/product-inventory-schema";
import { fetchProduct, fetchQuantityUnitConversionsResolved, grocyClient } from "@/lib/grocy";
import { labelTypeToGrocy } from "@/interfaces/grocy";
import { StockLabelType } from "@/generated/prisma/browser";

export async function productInventorySubmit(prevstate: unknown, formData: FormData) {
  const productId = Number(formData.get("productId")?.valueOf());
  if (productId === null || productId === undefined || !productId) {
    console.error("no productId from form?", productId, formData);
  }

  const product = await fetchProduct(productId);
  const conversions = await fetchQuantityUnitConversionsResolved(productId);
  const schema = createProductInventorySchema(product, conversions);

  const submission = parseWithZod(formData, { schema: schema });

  if (submission.status !== "success") {
    const err = submission.error;
    console.log("submission errors:", err);
    return submission.reply();
  }

  const data = submission.value;

  // console.log("data is", data);

  const { data: inventoried, error } = await grocyClient.POST("/stock/products/{productId}/inventory", {
    params: { path: { productId: data.productId } },
    body: {
      new_amount: data.amountShadow,
      best_before_date: data.bestBeforeDate!.toISOString(),
      price: product.default_purchase_price_type === 3 ? data.price! / data.amountShadow : data.price,
      shopping_location_id: data.shoppingLocationId,
      location_id: data.locationId,
      stock_label_type: labelTypeToGrocy(data.stockLabelType! as StockLabelType),
      note: data.note,
      transaction_type: "inventory",
    },
  });

  // @ts-expect-error TS doesn't handle these responses too well
  if (error || data.error_message! ) {
    console.log("Error updating inventory:", error);
  } else {
    console.log("Updated inventory:", inventoried);

    // Revalidate the cache for the invoices page and redirect the user.
    revalidatePath(`/scan/${data.barcode}`);
    redirect(`/scan/${data.barcode}`);
  }
}
