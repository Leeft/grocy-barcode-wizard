import {
  allBarcodeTypes,
  Barcode,
  BarcodeAnyType,
  BarcodeProductType,
  BarcodeSpecialType,
  productOnlyBarcodeTypes,
  specialBarcodeTypes,
} from "@/interfaces";

export default class Barcodes {
  private _barcodes: Barcode[] = [
    { id: 1, barcode: "XXXX", quantity: 1 },
    { id: 123, barcode: "YYYY", quantity: 0, description: "Whyohwhyohwhy" },
    { id: 27, barcode: "5701018050906", quantity: 12, description: "Not quite sure what this is for" },
    { barcode: "slug:life", quantity: 1, description: "It's a thug's life." },
    { id: 76, barcode: "5706911027437", quantity: 1 },
  ];

  get barcodes() {
    return this._barcodes;
  }

  barcode(code: string): Barcode | undefined {
    return this._barcodes.find((barcode) => barcode.barcode === code);
  }

  private set barcodes(value: Barcode[]) {
    this._barcodes = value;
  }
}

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

  if (/^(GRCY)[:]R[:][^:]+$/i.test(barcode)) {
    return "grocy-recipe";
  }

  if (/^(GRCY)[:]P[:][^:]+$/i.test(barcode)) {
    return "grocy-product";
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
