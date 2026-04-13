import { z } from "zod/v4";
import { dateToISODate } from "@/lib/date";

export const QuickProductFormSchema = z
  .object({
    barcode: z.string().trim(),

    name: z
      .string({ message: "Expecting 2 to 64 characters"})
      .trim()
      .min(2, "Expecting at least 2 characters")
      .max(64, "Keep the product name under 64 characters"), // Grocy can handle longer though

    // productGroup: z.coerce.number().gt(-1, { message: `Must be 0 or greater` }),

    unitSystem: z.enum(["weight", "volume", "abstract"], {
      message: "The unit system must be chosen",
    }),

    mainQuantityUnitId: z.coerce
      .number({
        message: "Main unit type must be chosen",
      })
      .gt(0, { message: "Select a unit from the list" }),

    mainQuantity: z.coerce.number({
        message: "Must be above 0",
      }).gt(0, { message: `Must be above 0` }),

    // parentProductId: z.coerce
    //   .number()
    //   .gt(-1, { message: "Parent product must be unset or greater than zero" }),

    defaultLocationId: z.coerce
      .number({
        message: "Default product location must be chosen",
      })
      .gt(0, { message: "Default product location must be chosen" }),

    // defaultConsumeLocationId: z.coerce.number().gt(-1, {
    //   message: "Consumption location must be unset or greater than zero",
    // }),

    // defaultShopLocationId: z.coerce.number().gt(-1, {
    //   message: "Default shop location must be unset or greater than zero",
    // }),

    dueDateType: z.enum(["best-before", "expiry-date", "no-expiry"], {
      message: "Due- or expiry-date type must be chosen",
    }),

    dueOrExpiryDate: z.iso.date({ error: "Not a valid date" }).optional(),

    packagingDate: z.iso.date({ error: "Not a valid date" }).optional(),

    shouldNotBeFrozen: z.coerce.boolean(),

    // noStockCheck: z.coerce.boolean(),

    // canNotOpen: z.coerce.boolean(),

    // moveOnOpen: z.coerce.boolean(),

    // hideFromStock: z.coerce.boolean(),

    defaultDueDays: z.coerce
      .number()
      .gt(-1, { message: `Must be 0 or greater` })
      .optional(),

    defaultDueDaysAfterOpen: z.coerce
      .number()
      .gt(-1, { message: `Must be 0 or greater` })
      .optional(),

    defaultDueDaysAfterFreezing: z.coerce
      .number()
      .gt(-1, { message: `Must be 0 or greater` })
      .optional(),

    defaultDueDaysAfterThawing: z.coerce
      .number()
      .gt(-1, { message: `Must be 0 or greater` })
      .optional(),

    image: z.string().optional(),
  })
  .refine(
    ({ dueDateType, dueOrExpiryDate, packagingDate }) => {
      // No need to check anything for no-expiry
      if (dueDateType === "no-expiry") return true;
      if (!dueOrExpiryDate) return false;
      if (!packagingDate) return true;
      return packagingDate < dueOrExpiryDate;
    },
    {
      message: "Due date must be after packaging date",
      path: ["dueOrExpiryDate"],
    },
  )
  .refine(
    ({ dueDateType, packagingDate }) => {
      // No need to check anything for no-expiry
      if (dueDateType === "no-expiry") return true;
      if (!packagingDate) return true;
      const today = dateToISODate(new Date());
      return packagingDate <= today;
    },
    {
      message: "Packaging date must be in the past",
      path: ["packagingDate"],
    },
  );
