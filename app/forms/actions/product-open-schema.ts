import { Product, QuantityUnitConversion, StockEntry } from "@/interfaces/grocy";
import { amountToStockUnit, sumStock } from "@/lib/utils";
import z from "zod/v4";

export function createProductOpenSchema(
  product: Product,
  stock: StockEntry[],
  conversions: QuantityUnitConversion[],
  //options?: { isEmailUnique: (email: string) => Promise<boolean> },
) {
  return z
    .object({
      barcode: z.string().trim(),

      productId: z.number().gt(0, "Must be a valid productId"),

      amount: z
        .number(`The amount must be greater than 0`)
        .gt(0, { message: `The amount must be greater than 0` })
        .lte(10000, { message: `The amount must be 10000 or less` }),

      // Shadow value to capture the actual amount to transfer, rather than amount for the chosen unit
      // which is for user convenience.
      amountShadow: z.coerce.number(),

      amountQuantityUnitId: z.number().gt(0, "Must be a valid quantity unit"),

      allowSubproductSubstitution: z.boolean().optional(),

      stockEntryId: z.string().optional(),
    })
    .superRefine(({ amount, amountQuantityUnitId }, ctx) => {
      const availableStock = sumStock({ stock: stock });
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
