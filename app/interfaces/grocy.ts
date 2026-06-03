import { DueDateType, PurchasePriceType, StockLabelType } from "@/generated/prisma/enums";
import type { paths, components } from "./grocy.d";

// The API schema provided Product schema is missing various columns, causing
// typescript validation issues. Extending the generated type here to also add
// the missing columns.
export type Product = components["schemas"]["Product"] & {
  default_best_before_days_after_freezing?: number;
  default_best_before_days_after_thawing?: number;
  qu_id_consume?: number;
  qu_id_price?: number;
  default_purchase_price_type?: 1 | 2 | 3;
  calories?: number;
  parent_product_id?: number;
  cumulate_min_stock_amount_of_sub_products?: number; // Probably 0 | 1 but no constraint
  due_type?: 1 | 2;
  hide_on_stock_overview?: 0 | 1;
  default_stock_label_type?: number; // Technically 0 | 1 | 2 but no constraint
  quick_open_amount?: number;
  disable_open?: 0 | 1;
  quick_consume_amount?: number;
  active?: 0 | 1;
  stock_amount_aggregated?: number;
};

export type Recipe = {
  id: number;
  name: string;
  description: string;
  row_created_timestamp?: string;
  picture_file_name?: string;
  base_servings?: number;
  desired_servings?: number;
  not_check_shoppinglist: 0 | 1;
  type?: string;
  product_id?: number;
  userfields?: Record<string, never>;
};

export type Error400 = components["schemas"]["Error400"];
export type Error500 = components["schemas"]["Error500"];
export type FileGroups = components["schemas"]["FileGroups"];

// (arrays of StockLogEntry)
// 200 status of /stock/products/{productId}/add
// 200 status of /stock/products/{productId}/consume
// 200 status of /stock/products/{productId}/transfer
// 200 status of /stock/products/{productId}/inventory
// 200 status of /stock/products/{productId}/open
export type StockLogEntry = components["schemas"]["StockLogEntry"];

export type QuantityUnit = components["schemas"]["QuantityUnit"];
export type ProductLocation = components["schemas"]["Location"] & {
  is_freezer?: 0 | 1;
};

export type ShoppingLocation = components["schemas"]["ShoppingLocation"];
export type StockEntry = components["schemas"]["StockEntry"];
export type ProductDetailsResponse = components["schemas"]["ProductDetailsResponse"];
export type ProductBarcode = components["schemas"]["ProductBarcode"];
export type Battery = components["schemas"]["Battery"];
export type BatteryDetailsResponse = components["schemas"]["BatteryDetailsResponse"];

export type QuantityUnitConversion = {
  id: number;
  from_qu_id: number;
  from_qu_name: string;
  from_qu_name_plural: string;
  to_qu_id: number;
  to_qu_name: string;
  to_qu_name_plural: string;
  factor: number;
  product_id: number;
  row_created_timestamp: string;
};

export type ShoppingList = {
  id: number;
  name: string;
  description: string;
  row_created_timestamp: string;
};

export type ProductGroup = {
  id: number;
  name: string;
  description: string;
  row_created_timestamp: string;
  active: 0 | 1;
};

export type ObjectByIdParams = paths["/objects/{entity}/{objectId}"]["parameters"];
export type ProductByBarcodeParams = paths["/stock/products/by-barcode/{barcode}"]["parameters"];

export type ObjectSuccessResponse =
  paths["/objects/{entity}/{objectId}"]["get"]["responses"]["200"]["content"]["application/json"];
export type ObjectErrorResponse =
  paths["/objects/{entity}/{objectId}"]["get"]["responses"]["400"]["content"]["application/json"];
export type ObjectNotFoundResponse =
  paths["/objects/{entity}/{objectId}"]["get"]["responses"]["404"]["content"]["application/json"];

export const purchasePriceTypeToGrocy = (purchasePriceType: PurchasePriceType): 1 | 2 | 3 => {
  switch (purchasePriceType) {
    case "UNSPECIFIED":
      return 1;
    case "UNIT_PRICE":
      return 2;
    case "TOTAL_PRICE":
      return 3;
  }
};

export const purchasePriceTypeToPlaceholder = (purchasePriceType: PurchasePriceType): string => {
  switch (purchasePriceType) {
    case "UNSPECIFIED":
      return "Price";
    case "UNIT_PRICE":
      return "Price per unit";
    case "TOTAL_PRICE":
      return "Total price";
  }
};

export const dueDateTypeToGrocy = (dueDateType: DueDateType): 1 | 2 => {
  switch (dueDateType) {
    case "BEST_BEFORE":
    case "NO_EXPIRY":
      return 1;
    case "EXPIRY_DATE":
      return 2;
  }
};

export const labelTypeToGrocy = (labelType: StockLabelType): 0 | 1 | 2 => {
  if (labelType === null) return 0;
  switch (labelType) {
    case "NO_LABEL":
    default:
      return 0;
    case "SINGLE_LABEL":
      return 1;
    case "LABEL_PER_UNIT":
      return 2;
  }
};

export function grocyAsPurchasePriceType(value?: number): PurchasePriceType {
  switch (value) {
    default:
    case 1:
      return PurchasePriceType.UNSPECIFIED;
    case 2:
      return PurchasePriceType.UNIT_PRICE;
    case 3:
      return PurchasePriceType.TOTAL_PRICE;
  }
}

export function grocyAsStockLabelType(value?: number): StockLabelType {
  switch (value) {
    default:
    case 0:
      return StockLabelType.NO_LABEL;
    case 1:
      return StockLabelType.SINGLE_LABEL;
    case 2:
      return StockLabelType.LABEL_PER_UNIT;
  }
}

export function grocyAsDueType(value?: number): DueDateType {
  switch (value) {
    default:
      return DueDateType.NO_EXPIRY;
    case 1:
      return DueDateType.BEST_BEFORE;
    case 2:
      return DueDateType.EXPIRY_DATE;
  }
}
