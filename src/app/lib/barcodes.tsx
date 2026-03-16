import {
  BarcodeAnyType,
  BarcodeProductType,
  BarcodeSpecialType,
  productOnlyBarcodeTypes,
  specialBarcodeTypes,
} from "@/interfaces";

function parseProductBarcode(maybeProductBarcode: string): BarcodeProductType {
  const barcode = productOnlyBarcodeTypes.find((validName) => validName === maybeProductBarcode);
  if (barcode) {
    return barcode;
  }
  throw new Error("That is not a product barcode.");
}

function parseSpecialBarcode(maybeProductBarcode: string): BarcodeSpecialType {
  const barcode = specialBarcodeTypes.find((validName) => validName === maybeProductBarcode);
  if (barcode) {
    return barcode;
  }
  throw new Error("That is not a special barcode.");
}

export function barcodeToType(barcode: string): BarcodeAnyType {
  if (barcode.length < 5) {
    throw new Error("barcode is impossibly short");
  }

  if (/^(SHO)[:-](C|CS|CA|P|O|I|AS)$/i.test(barcode)) {
    return "sho-operation";
  }

  if (/^BBUDDY[:-]q[:-]/i.test(barcode)) {
    return "bbuddy-quantity";
  }

  if (/^(BBUDDY)[:-](C|CS|CA|P|O|I|AS)$/i.test(barcode)) {
    return "bbuddy-operation";
  }

  if (/^(GRCY)[:]R[:].*$/i.test(barcode)) {
    return "grocy-recipe";
  }

  if (/^(GRCY)[:]P[:].*$/i.test(barcode)) {
    return "grocy-product";
  }

  if (/^(GRCY)[:]B[:].*$/i.test(barcode)) {
    return "grocy-battery";
  }

  return "product";
}

export function isAnyBarcode(barcode: string): boolean {
  const inferredType: BarcodeAnyType = barcodeToType(barcode);
  try {
    // Can't validate anything but the length, but this'll do
    barcodeToType(inferredType);
    return true;
  } catch {
    return false;
  }
}

export function isSpecialBarcode(barcode: string): boolean {
  const inferredType: BarcodeAnyType = barcodeToType(barcode);
  try {
    parseSpecialBarcode(inferredType);
    return true;
  } catch {
    return false;
  }
}

export function isProductBarcode(barcode: string): boolean {
  const inferredType: BarcodeAnyType = barcodeToType(barcode);
  try {
    parseProductBarcode(inferredType);
    return true;
  } catch {
    return false;
  }
}

export function grocyProductNumber(barcode: string): number {
  try {
    const matched_grcy = barcode.match(/^GRCY:P:([0-9]+)$/i);
    if (
      matched_grcy !== null &&
      matched_grcy.length > 0 &&
      matched_grcy[1] !== undefined &&
      Number.parseInt(matched_grcy[1]) > 0
    ) {
      return Number.parseInt(matched_grcy[1]);
    }
  } catch {
    return 0;
  }
  return 0;
}

export function bbuddyQuantity(barcode: string): number | null {
  try {
    const matched_grcy = barcode.match(/^BBUDDY-Q-([0-9]+)$/i);
    if (
      matched_grcy !== null &&
      matched_grcy.length > 0 &&
      matched_grcy[1] !== undefined &&
      Number.parseInt(matched_grcy[1]) > 0
    ) {
      return Number.parseInt(matched_grcy[1]);
    }
  } catch {
    return null;
  }
  return null;
}
