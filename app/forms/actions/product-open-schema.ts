import z from "zod/v4";

export const ProductOpenSchema = z.object({
  barcode: z.string().trim(),

  productId: z.number().gt(0, "Must be a valid productId"),

  amount: z
    .number(`The amount must be greater than 0`)
    .gt(0, { message: `The amount must be greater than 0` })
    .lte(10000, { message: `The amount must be 10000 or less` }),

  allowSubproductSubstitution: z.boolean().optional(),

  stockEntryId: z.string().optional(),
});
