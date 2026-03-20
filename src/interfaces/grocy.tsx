import type { paths, components } from "./grocy.d";

export type Product = components["schemas"]["Product"];
export type QuantityUnit = components["schemas"]["QuantityUnit"];
export type ProductLocation = components["schemas"]["Location"];

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
