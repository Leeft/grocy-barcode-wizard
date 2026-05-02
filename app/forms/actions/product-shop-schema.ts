import { z } from "zod/v4";

export function createProductShopSchema(
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

      listId: z.number().gt(0, "Must be a valid list id"),

      note: z
        .string()
        .trim()
        .optional(),
    })
    .superRefine(({ amount }, ctx) => {
      if (amount < 0.0001 || amount > 10000) {
        ctx.addIssue({
          code: "custom",
          message: `Amount must be greater than or equal to 0.0001 and less than or equal to 10000`,
          input: "amount",
          path: ["amount"],
        });
      }
      return;
    });
}
