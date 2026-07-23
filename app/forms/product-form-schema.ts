import { z } from "zod/v4";
import { DueDateType, PurchasePriceType, UnitSystem } from "@/generated/prisma/enums";
import { addYears, dateToISODate } from "@/lib/utils";

export const createProductFormSchema = (productNames: string[]) => {
  return z
    .object({
      intent: z.literal("create"),

      barcode: z.string().trim(),

      name: z
        .string({ message: "Expecting 2 to 128 characters" })
        .trim()
        .min(2, "Expecting at least 2 characters")
        .max(128, "Keep the product name under 128 characters"), // Grocy can handle longer though

      // productGroup: z.coerce.number().gt(-1, { message: `Must be 0 or greater` }),

      unitSystem: z.enum(
        [UnitSystem.WEIGHT, UnitSystem.VOLUME, UnitSystem.ABSTRACT],
        "The unit system must be chosen",
      ),

      unitId: z.number("Select a unit from the list").gt(0, { message: "Select a unit from the list" }),

      unitAmount: z
        .number(`Must be above 0`)
        .gt(0, { message: `Must be above 0` })
        .lte(10000, { message: `Number must be 10000 or less` }),

      defaultLocationId: z
        .number("Valid default product location must be chosen")
        .gt(0, { message: "Valid default product location must be chosen" }),

      dueDateType: z.enum(
        [DueDateType.BEST_BEFORE, DueDateType.EXPIRY_DATE, DueDateType.NO_EXPIRY],
        "Due- or expiry-date type must be chosen",
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

      dueDays: z.coerce
        .number(`Must be 0 or greater`)
        .gte(0, { message: `Must be 0 or greater` })
        .lte(10000, { message: `Must be less than 10000` })
        .optional(),

      dueDaysAfterOpen: z.coerce
        .number(`Must be 0 or greater`)
        .gte(0, { message: `Must be 0 or greater` })
        .lte(10000, { message: `Must be less than 10000` })
        .optional(),

      dueDaysAfterFreezing: z.coerce
        .number(`Must be 0 or greater`)
        .gte(0, { message: `Must be 0 or greater` })
        .lte(10000, { message: `Must be less than 10000` })
        .optional(),

      dueDaysAfterThawing: z.coerce
        .number(`Must be 0 or greater`)
        .gte(0, { message: `Must be 0 or greater` })
        .lte(10000, { message: `Must be less than 10000` })
        .optional(),

      // "this will be used as the default price type selection on purchase"
      purchasePriceType: z.enum([
        PurchasePriceType.UNSPECIFIED,
        PurchasePriceType.UNIT_PRICE,
        PurchasePriceType.TOTAL_PRICE,
      ]),

      purchasePrice: z.number().gte(0, "Must be zero or above").optional(),

      quantity: z.number().gte(1, "Must be 1 or greater"),

      notes: z.string().max(1024, { error: "Please keep the notes under 1024 characters" }).optional(),

      imageData: z.string().optional(),
      imageType: z.string().optional(),
      imageName: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const {
        dueDateType,
        dueDays,
        dueDaysAfterOpen,
        dueDaysAfterFreezing,
        dueDaysAfterThawing,
        shouldNotBeFrozen,
      } = data;

      if (dueDateType !== "NO_EXPIRY" && isNaN(dueDays!)) {
        ctx.addIssue({
          code: "custom",
          message: "Default due days must be 0 or more",
          input: dueDays,
          path: ["dueDays"],
        });
      }

      if (dueDateType !== "NO_EXPIRY" && isNaN(dueDaysAfterOpen!)) {
        ctx.addIssue({
          code: "custom",
          message: "Default due days after open must be 0 or more",
          input: dueDaysAfterOpen,
          path: ["dueDaysAfterOpen"],
        });
      }

      if (dueDateType !== DueDateType.NO_EXPIRY && !shouldNotBeFrozen && isNaN(dueDaysAfterFreezing!)) {
        ctx.addIssue({
          code: "custom",
          message: "Default due days after freezing must be 0 or more",
          input: dueDaysAfterFreezing,
          path: ["dueDaysAfterFreezing"],
        });
      }

      if (dueDateType !== DueDateType.NO_EXPIRY && !shouldNotBeFrozen && isNaN(dueDaysAfterThawing!)) {
        ctx.addIssue({
          code: "custom",
          message: "Default due days after thawing must be 0 or more",
          input: dueDaysAfterThawing,
          path: ["dueDaysAfterThawing"],
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
    )
    .refine(
      ({ name }) => {
        const found = productNames.find((pn) => pn.toLocaleLowerCase() === name.toLocaleLowerCase());
        return found === undefined;
      },
      {
        message: "Product name exists in Grocy. It must be unique.",
        path: ["name"],
      },
    );
};

//export createProductFormSchema as CreateProductFormSchema;

export const editProductFormSchema = (productNames: string[]) =>
  createProductFormSchema(productNames).safeExtend({
    intent: z.literal("update") as never,

    id: z.number("Existing product id must be set").gt(0, { message: "Existing product id must be set" }),

    productGroup: z.number().gt(-1, { message: `Must be 0 or greater` }),

    parentProductId: z.number().gt(-1, { message: "Parent product must be unset or greater than zero" }),

    defaultConsumeLocationId: z
      .number("Default consume location must be chosen")
      .gte(0, { message: "Default consume location must be chosen" }),

    moveOnOpen: z.boolean(),
    enableTareWeight: z.boolean(),
    disableStockChecking: z.boolean(),
    openedAsOutOfStock: z.boolean(),
    accumulateSubProductsMinStock: z.boolean(),
    cantOpen: z.boolean(),
    dontShowOnStock: z.boolean(),

    // These all have quantityUnitStock (unitId, in this app) as their unit
    tareWeight: z.number().gte(0, { message: `Must be 0 or greater` }),
    energy: z.number().gte(0, { message: `Must be 0 or greater` }),
    quickConsumeAmount: z.number().gt(0, { message: `Must greater than zero` }),
    quickOpenAmount: z.number().gt(0, { message: `Must be greater than zero` }),

    energyCalculationHelper: z.number().optional(),
    energyCalculatorOptions: z.enum(["PER100G"]).optional(),

    defaultShop: z
      .number("Default shop must be a valid number or empty")
      .gte(0, { message: "Default shop must be a valid number or empty" })
      .optional(),

    defaultQuantityUnitPurchase: z
      .number("Select a unit from the list")
      .gt(0, { message: "Select a unit from the list" }),

    defaultQuantityUnitConsume: z
      .number("Select a unit from the list")
      .gt(0, { message: "Select a unit from the list" }),

    quantityUnitPrices: z
      .number("Select a unit from the list")
      .gt(0, { message: "Select a unit from the list" }),

    purchaseConversionFactor: z.number().gt(0, { message: `Must be greater than 0` }),

    consumeConversionFactor: z.number().gt(0, { message: `Must be greater than 0` }),

    priceConversionFactor: z.number().gt(0, { message: `Must be greater than 0` }),

    submitMode: z.enum(["updateOnly", "createInGrocy", "deleteQueuedEntry"]),
  });
