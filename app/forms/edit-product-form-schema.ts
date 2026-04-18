import { z } from "zod/v4";
import { QuickProductFormSchema } from "./quick-product-form-schema";
import { PurchasePriceType } from "@/generated/prisma/enums";

export const EditProductFormSchema = QuickProductFormSchema.extend({
  id: z
    .number("Existing product id must be set")
    .gt(0, { message: "Existing product id must be set" }),

  productGroup: z.coerce.number().gt(-1, { message: `Must be 0 or greater` }),

  parentProductId: z.coerce
    .number()
    .gt(-1, { message: "Parent product must be unset or greater than zero" }),

  defaultConsumeLocationId: z.coerce
    .number("Default consume location must be chosen")
    .gte(0, { message: "Default consume location must be chosen" }),

  moveOnOpen: z.coerce.boolean(),
  enableTareWeight: z.coerce.boolean(),
  disableStockChecking: z.coerce.boolean(),
  openedAsOutOfStock: z.coerce.boolean(),
  accumulateSubProductsMinStock: z.coerce.boolean(),
  cantOpen: z.coerce.boolean(),
  dontShowOnStock: z.coerce.boolean(),
  disableOwnStock: z.coerce.boolean(),

  // These all have quantityUnitStock as their unit
  tareWeight: z.number().gte(0, { message: `Must be 0 or greater` }),
  energy: z.number().gte(0, { message: `Must be 0 or greater` }),
  quickConsumeAmount: z.number().gt(0, { message: `Must greater than zero` }),
  quickOpenAmount: z.number().gt(0, { message: `Must be greater than zero` }),

  defaultShop: z
    .number("Default shop must be a valid number or empty")
    .gte(0, { message: "Default shop must be a valid number or empty" })
    .optional(),

  // "this will be used as the default price type selection on purchase"
  purchasePriceType: z.enum([
    PurchasePriceType.UNSPECIFIED,
    PurchasePriceType.UNIT_PRICE,
    PurchasePriceType.TOTAL_PRICE,
  ]),

  quantityUnitStock: z.coerce.string().readonly(),

  defaultQuantityUnitPurchase: z.coerce
    .number("Select a unit from the list")
    .gt(0, { message: "Select a unit from the list" }),

  defaultQuantityUnitConsume: z.coerce
    .number("Select a unit from the list")
    .gt(0, { message: "Select a unit from the list" }),

  quantityUnitPrices: z.coerce
    .number("Select a unit from the list")
    .gt(0, { message: "Select a unit from the list" }),
});
