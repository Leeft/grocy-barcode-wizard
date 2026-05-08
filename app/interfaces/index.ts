import { SubmissionResult } from "@conform-to/react";

export interface Option {
  value: string;
  label: string;
}

export interface SerialisedBarcode {
  barcode: string;
  type: string;
  name?: string;
  quantity?: number;
  grocyProductId?: number;
  queuedProductId?: number;
}

export enum ProductBarcodeTypes {
  PRODUCT = "product",
  GROCY_PRODUCT = "grocy-product",
};

export enum SpecialBarcodeTypes {
  GROCY_RECIPE = "grocy-recipe",
  GROCY_BATTERY = "grocy-battery",
  BBUDDY_OPERATION = "bbuddy-operation",
  BBUDDY_QUANTITY = "bbuddy-quantity",
  SHO_OPERATION = "sho-operation",
  QR_URI = "qr-uri",
  QR_WIFI = "qr-wifi",
  QR_VCARD = "qr-vcard",
  QR_COMMUNICATION = "qr-communication",
  QR_VEVENT = "qr-vevent",
  QR_OTHER = "qr-other",
};

export type AllBarcodeTypes = ProductBarcodeTypes | SpecialBarcodeTypes;

export type ActionState =
  | {
      message: string;
      status: "success" | "error";
    }
  | null // initial state
  | SubmissionResult<string[]>
  | undefined; // if server action does not return anything
