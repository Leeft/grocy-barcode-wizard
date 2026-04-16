import { z } from "zod/v4";
import { QuickProductFormSchema } from "./quick-product-form-schema";

export const EditProductFormSchema = QuickProductFormSchema.extend({
  id: z
    .number("Existing product id must be set")
    .gt(0, { message: "Existing product id must be set" }),

  // productGroup: z.coerce.number().gt(-1, { message: `Must be 0 or greater` }),

  // parentProductId: z.coerce
  //   .number()
  //   .gt(-1, { message: "Parent product must be unset or greater than zero" }),

  // defaultConsumeLocationId: z.coerce.number().gt(-1, {
  //   message: "Consumption location must be unset or greater than zero",
  // }),

  // defaultShopLocationId: z.coerce.number().gt(-1, {
  //   message: "Default shop location must be unset or greater than zero",
  // }),

  // noStockCheck: z.coerce.boolean(),

  // canNotOpen: z.coerce.boolean(),

  // moveOnOpen: z.coerce.boolean(),

  // hideFromStock: z.coerce.boolean(),
});
