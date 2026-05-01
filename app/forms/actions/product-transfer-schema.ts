import z from "zod/v4";

export const ProductTransferSchema = z.object({
  barcode: z.string().trim(),

  productId: z.number().gt(0, "Must be a valid productId"),

  amount: z
    .number(`The amount must be greater than 0`)
    .gt(0, { message: `The amount must be greater than 0` }),

  // Shadow value to capture the actual amount to transfer, rather than amount for the chosen unit
  // which is for user convenience.
  amountShadow: z
    .coerce
    .number()
    .optional(),

  amountQuantityUnitId: z.number().gt(0, "Must be a valid quantity unit"),

  locationIdFrom: z
    .number(`Location "from" must be selected`)
    .gt(0, { message: `Location "from" must be selected` }),

  locationIdTo: z
    .number(`Location "to" must be selected`)
    .gt(0, { message: `Location "to" must be selected` }),

  stockEntryId: z.string().optional(),
});
