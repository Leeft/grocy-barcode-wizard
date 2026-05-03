import { Product, QuantityUnitConversion } from "@/interfaces/grocy";
import { z } from "zod/v4";
import { StockLabelType } from "@/generated/prisma/enums";
import { amountToStockUnit } from "@/lib/utils";
import { addYears } from "@/lib/utils";

export function createProductInventorySchema(
  product: Product,
  conversions: QuantityUnitConversion[],
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

      bestBeforeDate: z
        .date({ error: "Not a valid date" })
        .min(addYears(new Date(), -1), { error: "Date is too far in the past" })
        .optional(),

      //doesNotExpire: z.boolean(),

      price: z.number().gte(0, "The price, if set, must be zero or above").optional(),

      locationId: z
        .number("Product location choice is invalid")
        .gt(0, { message: "Product location choice is invalid" }),

      shoppingLocationId: z
        .number("Shopping location choice is invalid")
        .gte(0, { message: "Shopping location choice is invalid" })
        .optional(),

      stockLabelType: z.enum([
        StockLabelType.NO_LABEL,
        StockLabelType.SINGLE_LABEL,
        StockLabelType.LABEL_PER_UNIT,
      ]),

      note: z
        .string({ message: "Keep the note under 128 characters" })
        .trim()
        .max(128, "Keep the note under 128 characters")
        .optional(), // Grocy can (probably) handle much longer though
    })
    .refine(
      ({ bestBeforeDate }) => {
        // No need to check anything for NO_EXPIRY
        //if (dueDateType === DueDateType.NO_EXPIRY) return true;
        //console.log( "bestbeforedate", bestBeforeDate );
        if (!bestBeforeDate) return false;
        return true;
      },
      {
        message: "The date must be set",
        path: ["bestBeforeDate"],
      },
    )
    .superRefine(({ amount, amountQuantityUnitId }, ctx) => {
      const availableStockSelectedUnit = amountToStockUnit({
        conversions: conversions,
        amount: 10000,
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
