import { z } from "zod/v4";
import { DueDateType, PurchasePriceType, StockLabelType } from "@/generated/prisma/enums";
import { addYears } from "@/lib/utils";

const BaseFields = z.object({
  barcode: z.string().trim(),
  productId: z.number().gt(0, "Selection must be a valid product"),
});

const AmountAndUnit = z
  .object({
    amount: z.coerce.number(),
    // The shadow value is used to capture the actual amount to add/consume/transfer/etc,
    // it represents the value in stock units rather than the customer chosen unit in the
    // amount field, which is for user convenience.
    amountShadow: z.coerce.number(),
    // maximumAmount is the top value the amount can have, matching the value for the unit
    // chosen by the user.
    maximumAmount: z.coerce.number(),
    amountQuantityUnitId: z.number().gt(0, "You have to choose a valid quantity unit"),
  })
  .superRefine(({ amount, maximumAmount }, ctx) => {
    if (amount < 0.0001 || amount > maximumAmount) {
      ctx.addIssue({
        code: "custom",
        message: `Amount must be greater than or equal to 0.0001 and less than or equal to ${maximumAmount}`,
        input: "amount",
        path: ["amount"],
      });
    }
    return;
  });

export type AmountAndUnitType = z.infer<typeof AmountAndUnit>;

export const ProductAddSchema = z
  .object({
    base: BaseFields,
    amount: AmountAndUnit,

    bestBeforeDate: z
      .date({ error: "Not a valid date" })
      .min(addYears(new Date(), -1), { error: "Date is too far in the past" }),

    dueDateType: z.enum(
      [DueDateType.BEST_BEFORE, DueDateType.EXPIRY_DATE, DueDateType.NO_EXPIRY],
      "Due- or expiry-date type must be chosen",
    ),

    price: z.number().gte(0, "The price, if set, must be zero or above"),

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
      .string({ message: "Please keep the note under 128 characters" })
      .trim()
      .max(128, "Please keep the note under 128 characters") // Grocy can handle much longer though
      .optional(),
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

export type ProductAddType = z.infer<typeof ProductAddSchema>;

export const ProductConsumeSchema = z.object({
  base: BaseFields,
  amount: AmountAndUnit,

  locationId: z
    .number("A product location must be chosen")
    .gt(0, { message: "A product location must be chosen" }),

  recipeId: z
    .number("Product recipe choice is invalid")
    .gt(0, { message: "Product recipe choice is invalid" })
    .optional(),

  exactAmount: z.boolean().optional(),
  allowSubproductSubstitution: z.boolean().optional(),
  spoiled: z.boolean().optional(),

  stockEntryId: z.string().optional(),
});
// .superRefine(({ amount, amountQuantityUnitId, locationId }, ctx) => {
//   const filteredStock = stock.filter((se) => se.location_id === locationId);
//   const availableStock = sumStock({ stock: filteredStock });
//   const availableStockSelectedUnit = amountToStockUnit({
//     conversions: conversions,
//     amount: availableStock,
//     unit: Number(product.qu_id_stock),
//     targetUnit: Number(amountQuantityUnitId),
//   });
//   if (amount < 0.0001 || amount > availableStockSelectedUnit) {
//     ctx.addIssue({
//       code: "custom",
//       message: `Amount must be greater than or equal to 0.0001 and less than or equal to ${availableStockSelectedUnit}`,
//       input: "amount",
//       path: ["amount"],
//     });
//   }
//   return;
// });

export type ProductConsumeType = z.infer<typeof ProductConsumeSchema>;

export const ProductInventorySchema = z
  .object({
    base: BaseFields,
    amount: AmountAndUnit,

    bestBeforeDate: z
      .date({ error: "Not a valid date" })
      .min(addYears(new Date(), -1), { error: "Date is too far in the past" })
      .optional(),

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
  );
// .superRefine(({ amount, amountQuantityUnitId }, ctx) => {
//   const availableStockSelectedUnit = amountToStockUnit({
//     conversions: conversions,
//     amount: 10000,
//     unit: Number(product.qu_id_stock),
//     targetUnit: Number(amountQuantityUnitId),
//   });
//   if (amount < 0.0001 || amount > availableStockSelectedUnit) {
//     ctx.addIssue({
//       code: "custom",
//       message: `Amount must be greater than or equal to 0.0001 and less than or equal to ${availableStockSelectedUnit}`,
//       input: "amount",
//       path: ["amount"],
//     });
//   }
//   return;
// });

export type ProductInventoryType = z.infer<typeof ProductConsumeSchema>;

export const ProductOpenSchema = z.object({
  base: BaseFields,
  amount: AmountAndUnit,

  allowSubproductSubstitution: z.boolean().optional(),

  stockEntryId: z.string().optional(),
});
// .superRefine(({ amount, amountQuantityUnitId }, ctx) => {
//   const availableStock = sumStock({ stock: stock });
//   const availableStockSelectedUnit = amountToStockUnit({
//     conversions: conversions,
//     amount: availableStock,
//     unit: Number(product.qu_id_stock),
//     targetUnit: Number(amountQuantityUnitId),
//   });
//   if (amount < 0.0001 || amount > availableStockSelectedUnit) {
//     ctx.addIssue({
//       code: "custom",
//       message: `Amount must be greater than or equal to 0.0001 and less than or equal to ${availableStockSelectedUnit}`,
//       input: "amount",
//       path: ["amount"],
//     });
//   }
//   return;
// });

export type ProductOpenType = z.infer<typeof ProductOpenSchema>;

export const ProductShopSchema = z.object({
  base: BaseFields,
  amount: AmountAndUnit,

  listId: z.number().gt(0, "Must be a valid shopping list"),

  note: z.string().trim().optional(),
});
// .superRefine(({ amount }, ctx) => {
//   if (amount < 0.0001 || amount > 10000) {
//     ctx.addIssue({
//       code: "custom",
//       message: `Amount must be greater than or equal to 0.0001 and less than or equal to 10000`,
//       input: "amount",
//       path: ["amount"],
//     });
//   }
//   return;
// });

export type ProductShopType = z.infer<typeof ProductShopSchema>;

export const ProductTransferSchema = z.object({
  base: BaseFields,
  amount: AmountAndUnit,

  locationIdFrom: z
    .number(`Location "from" must be selected`)
    .gt(0, { message: `Location "from" must be selected` }),

  locationIdTo: z
    .number(`Location "to" must be selected`)
    .gt(0, { message: `Location "to" must be selected` }),

  stockEntryId: z.string().optional(),
});
// .superRefine(({ amount, amountQuantityUnitId, locationIdFrom }, ctx) => {
//   const filteredStock = stock.filter((se) => se.location_id === locationIdFrom);
//   const availableStock = sumStock({ stock: filteredStock });
//   const availableStockSelectedUnit = amountToStockUnit({
//     conversions: conversions,
//     amount: availableStock,
//     unit: Number(product.qu_id_stock),
//     targetUnit: Number(amountQuantityUnitId),
//   });
//   if (amount < 0.0001 || amount > availableStockSelectedUnit) {
//     ctx.addIssue({
//       code: "custom",
//       message: `Amount must be greater than or equal to 0.0001 and less than or equal to ${availableStockSelectedUnit}`,
//       input: "amount",
//       path: ["amount"],
//     });
//   }
//   return;
// });

export type ProductTransferType = z.infer<typeof ProductTransferSchema>;

//

export const AddBarcodeToProductSchema = z.object({
  base: BaseFields,
  amount: AmountAndUnit,

  shoppingLocationId: z
    .number("Shopping location choice is invalid")
    .gte(0, { message: "Shopping location choice is invalid" })
    .optional(),

  note: z
    .string({ message: "Please keep the note under 128 characters" })
    .trim()
    .max(128, "Please keep the note under 128 characters") // Grocy can handle much longer though
    .optional(),
});

export type AddBarcodeToProductType = z.infer<typeof AddBarcodeToProductSchema>;