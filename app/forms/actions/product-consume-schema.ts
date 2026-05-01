import { Product, QuantityUnitConversion, StockEntry } from "@/interfaces/grocy";
import { amountToStockUnit, sumStock } from "@/lib/utils";
import { z } from "zod/v4";

export function createProductConsumeSchema(
  product: Product,
  stock: StockEntry[],
  conversions: QuantityUnitConversion[],
  //options?: { isEmailUnique: (email: string) => Promise<boolean> },
) {
  return z
    .object({
      barcode: z.string().trim(),

      productId: z.number().gt(0, "Must be a valid productId"),

      amount: z.coerce.number(),

      // Shadow value to capture the actual amount to transfer, rather than amount for the chosen unit
      // which is for user convenience.
      amountShadow: z.coerce.number(),

      amountQuantityUnitId: z.number().gt(0, "Must be a valid quantity unit"),

      locationId: z
        .number("Product location choice is invalid")
        .gt(0, { message: "Product location choice is invalid" }),

      recipeId: z
        .number("Product recipe choice is invalid")
        .gt(0, { message: "Product recipe choice is invalid" })
        .optional(),

      exactAmount: z.boolean().optional(),
      allowSubproductSubstitution: z.boolean().optional(),
      spoiled: z.boolean().optional(),

      stockEntryId: z.string().optional(),
    })
    .superRefine(({ amount, amountQuantityUnitId, locationId }, ctx) => {
      const filteredStock = stock.filter((se) => se.location_id === locationId);
      const availableStock = sumStock({ stock: filteredStock });
      const availableStockSelectedUnit = amountToStockUnit({
        conversions: conversions,
        amount: availableStock,
        unit: Number(product.qu_id_stock),
        targetUnit: Number(amountQuantityUnitId),
      });
      if (amount < 0.0001 || amount > availableStockSelectedUnit) {
        ctx.addIssue({
          code: "custom",
          message: `Amount must be greater than or equal to 0.0001 and less than or equal to ${availableStockSelectedUnit}`,
          input: "amount",
          path: ["amount"],
        });
      }
      return;
    });
}
