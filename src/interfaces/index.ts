import { name } from "@material-tailwind/react/types/components/select";
import { Product, ProductLocation } from "./grocy";

export type Barcode = {
  id?: number; // Internal id to keep track of them
  name?: name;
  barcode: string;
  type?: BarcodeAnyType;
  description?: string;
  productId?: number;
  quantity?: number;
  product?: Product;
  location?: ProductLocation;
  timestamp?: number;
};

export interface Option {
  value: string;
  label: string;
}

export const allBarcodeTypes = [ "product", "grocy-product", "grocy-recipe", "bbuddy-operation", "bbuddy-quantity", "sho-operation" ] as const;
export const specialBarcodeTypes = [ "grocy-recipe", "bbuddy-operation", "bbuddy-quantity", "sho-operation" ] as const;
export const productOnlyBarcodeTypes = [ "product", "grocy-product" ] as const;

export type BarcodeAnyType = typeof allBarcodeTypes[number];
export type BarcodeSpecialType = typeof specialBarcodeTypes[number];
export type BarcodeProductType = typeof productOnlyBarcodeTypes[number];
