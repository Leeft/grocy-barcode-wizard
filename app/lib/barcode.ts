import { AllBarcodeTypes, ProductBarcodeTypes, SerialisedBarcode, SpecialBarcodeTypes } from "@/interfaces";

let nextId: number = 1;

export default class Barcode {
  #id: number; // immutable; uniqueness not at all guaranteed atm
  #barcode: string; // immutable
  #type: AllBarcodeTypes; // immutable
  name?: string;
  quantity?: number;
  grocyProductId?: number; // If a product is found in grocy, this is its id
  scannedAt?: Date;
  queuedProductId?: number; // If a product has been captured here, this is its id

  constructor({
    barcode,
    name,
    quantity,
    grocyProductId,
    queuedProductId,
    scannedAt,
  }: {
    barcode: string;
    name?: string;
    quantity?: number;
    grocyProductId?: number;
    queuedProductId?: number;
    scannedAt?: Date;
  }) {
    this.#id = nextId += 1;
    this.#barcode = decodeURIComponent(barcode).trim();

    if (name !== undefined) this.name = name.trim();
    if (grocyProductId !== undefined) this.grocyProductId = grocyProductId;
    if (queuedProductId !== undefined) this.queuedProductId = queuedProductId;
    if (scannedAt !== undefined) this.scannedAt = scannedAt;

    this.quantity = quantity !== undefined && quantity >= 0 ? quantity : 1;
    this.#type = barcodeToType(barcode);
  }

  static fromJSON(json: SerialisedBarcode): Barcode {
    const barcode = new Barcode({
      barcode: json.barcode,
      name: json.name,
      quantity: json.quantity,
      grocyProductId: json.grocyProductId,
    });

    barcode.scannedAt = new Date();

    if (json.queuedProductId !== undefined && json.queuedProductId !== null) {
      barcode.queuedProductId = json.queuedProductId;
    }

    return barcode;
  }

  toJSON(): SerialisedBarcode {
    return {
      barcode: this.barcode,
      type: this.type,
      name: this.name,
      quantity: this.quantity,
      grocyProductId: this.grocyProductId,
      queuedProductId: this.queuedProductId,
    };
  }

  toString(): string {
    return this.#barcode;
  }

  get id(): number {
    return this.#id;
  }

  get barcode(): string {
    return this.#barcode;
  }

  get code(): string {
    return this.#barcode;
  }

  get type(): string {
    return this.#type;
  }

  isSpecialBarcode(): boolean {
    return isSpecialBarcode(this.barcode);
  }

  isProductBarcode(): boolean {
    return isProductBarcode(this.barcode);
  }

  grocyProductNumber(): number | null {
    return grocyProductNumber(this.barcode);
  }

  bbuddyQuantity(): number | null {
    return bbuddyQuantity(this.barcode);
  }
}

export function barcodeToType(barcode: string): AllBarcodeTypes {
  if (barcode.length < 5) {
    throw new Error("barcode is impossibly short");
  }

  if (barcode.length > 1500) {
    throw new Error("barcode is excessively long");
  }

  // It needs to go into a database; data entry alone makes whitespace
  // undesirable, but utf-8 and such might need to be allowed so for
  // now this is not checked for.
  if (/\s/.test(barcode)) {
    throw new Error("barcode contains whitespace");
  }

  if (/^https?:\/\//i.test(barcode)) return SpecialBarcodeTypes.QR_URI;
  if (/^WIFI:/i.test(barcode)) return SpecialBarcodeTypes.QR_WIFI;
  if (/^(BEGIN:VCARD|MECARD:)/i.test(barcode)) return SpecialBarcodeTypes.QR_VCARD;
  if (/^(mailto|matmsg|tel|smsto|sms):/i.test(barcode)) return SpecialBarcodeTypes.QR_COMMUNICATION;
  if (/^BEGIN:VEVENT/i.test(barcode)) return SpecialBarcodeTypes.QR_VEVENT;
  if (/^\[/i.test(barcode)) return SpecialBarcodeTypes.QR_OTHER;

  if (/^(SHO)[:-](C|CS|CA|P|O|I|AS)$/i.test(barcode)) {
    return SpecialBarcodeTypes.SHO_OPERATION;
  }

  if (/^BBUDDY[:-]q[:-]/i.test(barcode)) {
    return SpecialBarcodeTypes.BBUDDY_QUANTITY;
  }

  if (/^(BBUDDY)[:-](C|CS|CA|P|O|I|AS)$/i.test(barcode)) {
    return SpecialBarcodeTypes.BBUDDY_OPERATION;
  }

  if (/^(GRCY)[:]R[:].*$/i.test(barcode)) {
    return SpecialBarcodeTypes.GROCY_RECIPE;
  }

  if (/^(GRCY)[:]P[:].*$/i.test(barcode)) {
    return ProductBarcodeTypes.GROCY_PRODUCT;
  }

  if (/^(GRCY)[:]B[:].*$/i.test(barcode)) {
    return SpecialBarcodeTypes.GROCY_BATTERY;
  }

  return ProductBarcodeTypes.PRODUCT;
}

// function isAnyBarcode(barcode: string): boolean {
//   const inferredType: BarcodeAnyType = barcodeToType(barcode);
//   try {
//     barcodeToType(inferredType);
//     return true;
//   } catch (err) {
//     console.error("barcode rejected:", err);
//     return false;
//   }
// }

function isSpecialBarcode(barcode: string): boolean {
  const inferredType: AllBarcodeTypes = barcodeToType(barcode);
  const found = Object.values(SpecialBarcodeTypes).find((type: string) => type === inferredType);
  if (found) {
    return true;
  }
  return false;
}

function isProductBarcode(barcode: string): boolean {
  const inferredType: AllBarcodeTypes = barcodeToType(barcode);
  const found = Object.values(ProductBarcodeTypes).find((type: string) => type === inferredType);
  if (found) {
    return true;
  }
  return false;
}

export function stripBarcode(barcode: string): string {
  const parts = /^(GRCY:P:[0-9]+)(:[^:]+)?$/i.exec( barcode );
  if ( parts !== null && parts[1] !== undefined ) {
    return  parts[1];
  }
  return barcode;
}

export function stockIdFromBarcode(barcode: string): string | undefined {
  const parts = /^(GRCY:P:[0-9]+)(:([^:]+))?$/i.exec( barcode );
  if ( parts !== null && parts[3] !== undefined ) {
    return parts[3];
  }
  return;
}

function grocyProductNumber(barcode: string): number | null {
  try {
    const matched_grcy = stripBarcode(barcode).match(/^GRCY:P:([0-9]+)$/i);
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

function bbuddyQuantity(barcode: string): number | null {
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
