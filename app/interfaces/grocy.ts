import { DueDateType, PurchasePriceType, StockLabelType } from "@/generated/prisma/enums";
import type { paths, components } from "./grocy.d";

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

// CREATE TABLE products (
//         id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
//         name TEXT NOT NULL UNIQUE,
//         description TEXT,
//         product_group_id INTEGER,
//         active TINYINT NOT NULL DEFAULT 1 CHECK(active IN (0, 1)),
//         location_id INTEGER NOT NULL,
//         shopping_location_id INTEGER,
//         qu_id_purchase INTEGER NOT NULL,
//         qu_id_stock INTEGER NOT NULL,
//         min_stock_amount INTEGER NOT NULL DEFAULT 0,
//         default_best_before_days INTEGER NOT NULL DEFAULT 0,
//         default_best_before_days_after_open INTEGER NOT NULL DEFAULT 0,
//         default_best_before_days_after_freezing INTEGER NOT NULL DEFAULT 0,
//         default_best_before_days_after_thawing INTEGER NOT NULL DEFAULT 0,
//         picture_file_name TEXT,
//         enable_tare_weight_handling TINYINT NOT NULL DEFAULT 0,
//         tare_weight REAL NOT NULL DEFAULT 0,
//         not_check_stock_fulfillment_for_recipes TINYINT DEFAULT 0,
//         parent_product_id INT,
//         calories INTEGER,
//         cumulate_min_stock_amount_of_sub_products TINYINT DEFAULT 0,
//         due_type TINYINT NOT NULL DEFAULT 1 CHECK(due_type IN (1, 2)),
//         quick_consume_amount REAL NOT NULL DEFAULT 1,
//         hide_on_stock_overview TINYINT NOT NULL DEFAULT 0 CHECK(hide_on_stock_overview IN (0, 1)),
//         default_stock_label_type INTEGER NOT NULL DEFAULT 0,
//         should_not_be_frozen TINYINT NOT NULL DEFAULT 0 CHECK(should_not_be_frozen IN (0, 1)),
//         treat_opened_as_out_of_stock TINYINT NOT NULL DEFAULT 1 CHECK(treat_opened_as_out_of_stock IN (0, 1)),
//         no_own_stock TINYINT NOT NULL DEFAULT 0 CHECK(no_own_stock IN (0, 1)),
//         default_consume_location_id INTEGER,
//         move_on_open TINYINT NOT NULL DEFAULT 0 CHECK(move_on_open IN (0, 1)),
//         row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
// , qu_id_consume INTEGER, auto_reprint_stock_label TINYINT NOT NULL DEFAULT 0 CHECK(auto_reprint_stock_label IN (0, 1)), quick_open_amount REAL NOT NULL DEFAULT 1, qu_id_price INTEGER, disable_open TINYINT NOT NULL DEFAULT 0 CHECK(disable_open IN (0, 1)), default_purchase_price_type TINYINT NOT NULL DEFAULT 1 CHECK(default_purchase_price_type IN (1, 2, 3)));

export type QuantityUnit = components["schemas"]["QuantityUnit"];
export type ProductLocation = components["schemas"]["Location"] & {
  is_freezer?: 0 | 1,
};

export type ShoppingLocation = components["schemas"]["ShoppingLocation"];
export type StockEntry = components["schemas"]["StockEntry"];
export type ProductDetailsResponse = components["schemas"]["ProductDetailsResponse"];
export type ProductBarcode = components["schemas"]["ProductBarcode"];

export type QuantityUnitConversion = {
  id: number;
  from_qu_id: number;
  to_qu_id: number;
  factor: number;
  product_id: number;
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
      return 'Price';
    case "UNIT_PRICE":
      return 'Price per unit';
    case "TOTAL_PRICE":
      return 'Total price';
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
  if ( labelType === null ) return 0;
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