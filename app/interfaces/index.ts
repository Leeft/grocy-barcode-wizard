export interface Option {
  value: string;
  label: string;
}

export type QUConversion = {
  id: number | undefined;
  from_qu_id: number | undefined;
  to_qu_id: number | undefined;
  factor: number | undefined;
  product_id: number | undefined;
  row_created_timestamp: string | undefined;
};

export interface SerialisedBarcode {
  barcode: string;
  type: string;
  name?: string;
  quantity?: number;
  grocyProductId?: number;
  queuedProductId?: number;
}

export const allBarcodeTypes = [
  "product",
  "grocy-product",
  "grocy-recipe",
  "grocy-battery",
  "bbuddy-operation",
  "bbuddy-quantity",
  "sho-operation",
] as const;

export const specialBarcodeTypes = [
  "grocy-recipe",
  "bbuddy-operation",
  "bbuddy-quantity",
  "sho-operation",
] as const;

export const productOnlyBarcodeTypes = ["product", "grocy-product"] as const;

export type BarcodeAnyType = (typeof allBarcodeTypes)[number];
export type BarcodeSpecialType = (typeof specialBarcodeTypes)[number];
export type BarcodeProductType = (typeof productOnlyBarcodeTypes)[number];
