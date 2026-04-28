import { z } from "zod/v4";
import { DueDateType, PurchasePriceType, StockLabelType } from "@/generated/prisma/enums";
import { addYears } from "@/lib/utils";

export const ProductAddSchema = z
  .object({
    barcode: z.string().trim(),

    productId: z.number().gt(0, "Must be a valid productId"),

    amount: z
      .number(`The amount must be greater than 0`)
      .gt(0, { message: `The amount must be greater than 0` })
      .lte(10000, { message: `The amount must be 10000 or less` }),

    bestBeforeDate: z
      .date({ error: "Not a valid date" })
      .min(addYears(new Date(), -1), { error: "Date is too far in the past" })
      .optional(),

    dueDateType: z.enum(
      [DueDateType.BEST_BEFORE, DueDateType.EXPIRY_DATE, DueDateType.NO_EXPIRY],
      "Due- or expiry-date type must be chosen",
    ),

    price: z.number().gte(0, "The price, if set, must be zero or above").optional(),

    locationId: z
      .number("Product location choice is invalid")
      .gt(0, { message: "Product location choice is invalid" })
      .optional(),

    shoppingLocationId: z
      .number("Shopping location choice is invalid")
      .gte(0, { message: "Shopping location choice is invalid" })
      .optional(),

    stockLabelType: z.enum([
      StockLabelType.NO_LABEL,
      StockLabelType.SINGLE_LABEL,
      StockLabelType.LABEL_PER_UNIT,
    ]),

    purchasePriceType: z.enum([
      PurchasePriceType.UNSPECIFIED,
      PurchasePriceType.UNIT_PRICE,
      PurchasePriceType.TOTAL_PRICE,
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
  );
