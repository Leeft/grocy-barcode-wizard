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

export type ActionState =
  | {
      message: string;
      status: "success" | "error";
    }
  | null // initial state
  | SubmissionResult<string[]>
  | undefined; // if server action does not return anything

type Callbacks<T, R = unknown> = {
  onStart?: () => R;
  onEnd?: (reference: R) => void;
  onSuccess?: (result: T) => void;
  onError?: (result: T) => void;
};

export const withCallbacks = <Args extends unknown[], T extends ActionState, R = unknown>(
  fn: (...args: Args) => Promise<T>,
  callbacks: Callbacks<T, R>,
): ((...args: Args) => Promise<T>) => {
  return async (...args: Args) => {
    const promise = fn(...args);

    const reference = callbacks.onStart?.();

    const result = await promise;

    if (reference) {
      callbacks.onEnd?.(reference);
    }

    if (result?.status === "success") {
      callbacks.onSuccess?.(result);
    }

    if (result?.status === "error") {
      callbacks.onError?.(result);
    }

    return promise;
  };
};
