import { z } from "zod/v4";
import { addYears, dateToISODate } from "@/lib/date";
import { DueDateType, UnitSystem } from "@/generated/prisma/enums";

export const QuickProductFormSchema = z
  .object({
    barcode: z.string().trim(),

    name: z
      .string({ message: "Expecting 2 to 128 characters" })
      .trim()
      .min(2, "Expecting at least 2 characters")
      .max(128, "Keep the product name under 128 characters"), // Grocy can handle longer though

    // productGroup: z.coerce.number().gt(-1, { message: `Must be 0 or greater` }),

    unitSystem: z.enum(
      [UnitSystem.WEIGHT, UnitSystem.VOLUME, UnitSystem.ABSTRACT],
      {
        message: "The unit system must be chosen",
      },
    ),

    unitId: z.coerce
      .number("Select a unit from the list")
      .gt(0, { message: "Select a unit from the list" }),

    unitAmount: z.coerce
      .number(`Must be above 0`)
      .gt(0, { message: `Must be above 0` })
      .lte(10000, { message: `Number must be 10000 or less` }),

    // parentProductId: z.coerce
    //   .number()
    //   .gt(-1, { message: "Parent product must be unset or greater than zero" }),

    defaultLocationId: z.coerce
      .number("Valid default product location must be chosen")
      .gt(0, { message: "Valid default product location must be chosen" }),

    // defaultConsumeLocationId: z.coerce.number().gt(-1, {
    //   message: "Consumption location must be unset or greater than zero",
    // }),

    // defaultShopLocationId: z.coerce.number().gt(-1, {
    //   message: "Default shop location must be unset or greater than zero",
    // }),

    dueDateType: z.enum(
      [DueDateType.BEST_BEFORE, DueDateType.EXPIRY_DATE, DueDateType.NO_EXPIRY],
      {
        message: "Due- or expiry-date type must be chosen",
      },
    ),

    dueOrExpiryDate: z
      .date({ error: "Not a valid date" })
      .min(addYears(new Date(), -1), { error: "Too old!" })
      .max(addYears(new Date(), 10), { error: "Too far!" })
      .optional(),

    packagingDate: z
      .date({ error: "Not a valid date" })
      .min(addYears(new Date(), -5), { error: "Too old!" })
      .max(new Date(), { error: "Must be in the past" })
      .optional(),

    shouldNotBeFrozen: z.coerce.boolean(),

    // noStockCheck: z.coerce.boolean(),

    // canNotOpen: z.coerce.boolean(),

    // moveOnOpen: z.coerce.boolean(),

    // hideFromStock: z.coerce.boolean(),

    defaultDueDays: z.coerce
      .number(`Must be 0 or greater`)
      .gte(0, { message: `Must be 0 or greater` })
      .lte(10000, { message: `Must be less than 10000` })
      .optional(),

    defaultDueDaysAfterOpen: z.coerce
      .number(`Must be 0 or greater`)
      .gte(0, { message: `Must be 0 or greater` })
      .lte(10000, { message: `Must be less than 10000` })
      .optional(),

    defaultDueDaysAfterFreezing: z.coerce
      .number(`Must be 0 or greater`)
      .gte(0, { message: `Must be 0 or greater` })
      .lte(10000, { message: `Must be less than 10000` })
      .optional(),

    defaultDueDaysAfterThawing: z.coerce
      .number(`Must be 0 or greater`)
      .gte(0, { message: `Must be 0 or greater` })
      .lte(10000, { message: `Must be less than 10000` })
      .optional(),

    image: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const {
      dueDateType,
      defaultDueDays,
      defaultDueDaysAfterOpen,
      defaultDueDaysAfterFreezing,
      defaultDueDaysAfterThawing,
      shouldNotBeFrozen,
    } = data;

    if (dueDateType !== "NO_EXPIRY" && isNaN(defaultDueDays!)) {
      ctx.addIssue({
        code: "custom",
        message: "Default due days must be 0 or more",
        input: defaultDueDays,
        path: ["defaultDueDays"],
      });
    }

    if (dueDateType !== "NO_EXPIRY" && isNaN(defaultDueDaysAfterOpen!)) {
      ctx.addIssue({
        code: "custom",
        message: "Default due days after open must be 0 or more",
        input: defaultDueDaysAfterOpen,
        path: ["defaultDueDaysAfterOpen"],
      });
    }

    if (
      dueDateType !== DueDateType.NO_EXPIRY &&
      !shouldNotBeFrozen &&
      isNaN(defaultDueDaysAfterFreezing!)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Default due days after freezing must be 0 or more",
        input: defaultDueDaysAfterFreezing,
        path: ["defaultDueDaysAfterFreezing"],
      });
    }

    if (
      dueDateType !== DueDateType.NO_EXPIRY &&
      !shouldNotBeFrozen &&
      isNaN(defaultDueDaysAfterThawing!)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Default due days after thawing must be 0 or more",
        input: defaultDueDaysAfterThawing,
        path: ["defaultDueDaysAfterThawing"],
      });
    }
  })
  .refine(
    ({ dueDateType, dueOrExpiryDate }) => {
      // No need to check anything for NO_EXPIRY
      if (dueDateType === DueDateType.NO_EXPIRY) return true;
      if (!dueOrExpiryDate) return false;
      return true;
    },
    {
      message: "Due date must be set",
      path: ["dueOrExpiryDate"],
    },
  )
  .refine(
    ({ dueDateType, dueOrExpiryDate, packagingDate }) => {
      // No need to check anything for NO_EXPIRY
      if (dueDateType === DueDateType.NO_EXPIRY) return true;
      if (packagingDate === undefined) return true;
      if (!dueOrExpiryDate) return false;
      return packagingDate < dueOrExpiryDate;
    },
    {
      message: "Due date must be after packaging date",
      path: ["dueOrExpiryDate"],
    },
  )
  .refine(
    ({ dueDateType, packagingDate }) => {
      // No need to check anything for NO_EXPIRY
      if (dueDateType === DueDateType.NO_EXPIRY) return true;
      if (!packagingDate) return true;
      const today = dateToISODate(new Date());
      return dateToISODate(packagingDate) <= today;
    },
    {
      message: "Packaging date must be in the past",
      path: ["packagingDate"],
    },
  );
