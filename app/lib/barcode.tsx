import { Product as GrocyProduct } from "@/interfaces/grocy";
import { SerialisedBarcode } from "@/interfaces";
import {
  BarcodeAnyType,
  BarcodeProductType,
  BarcodeSpecialType,
  productOnlyBarcodeTypes,
  specialBarcodeTypes,
} from "@/interfaces";

let nextId: number = 1;

export default class Barcode {
  #id: number; // immutable; uniqueness not at all guaranteed atm
  #barcode: string; // immutable
  #type: BarcodeAnyType; // immutable
  name?: string;
  quantity?: number;
  product?: GrocyProduct;
  scannedAt?: Date;
  queuedProductId?: number;

  constructor({
    barcode,
    name,
    quantity,
    product,
    queuedProductId,
  }: {
    barcode: string;
    name?: string;
    quantity?: number;
    product?: GrocyProduct;
    queuedProductId?: number;
  }) {
    this.#id = nextId += 1;
    this.#barcode = barcode.trim();

    if (name !== undefined) this.name = name.trim();
    if (product !== undefined) this.product = product;
    if (queuedProductId !== undefined) this.queuedProductId = queuedProductId;

    this.quantity = quantity !== undefined && quantity >= 0 ? quantity : 1;
    this.#type = barcodeToType(barcode);
  }

  static fromJSON(json: SerialisedBarcode): Barcode {
    const barcode = new Barcode({
      barcode: json.barcode,
      name: json.name,
      quantity: json.quantity,
      product: json.product,
    });

    barcode.scannedAt = new Date(Date.now());

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
      product: this.product,
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

function parseProductBarcode(maybeProductBarcode: string): BarcodeProductType {
  const barcode = productOnlyBarcodeTypes.find(
    (validName) => validName === maybeProductBarcode,
  );
  if (barcode) {
    return barcode;
  }
  throw new Error("That is not a product barcode.");
}

function parseSpecialBarcode(maybeProductBarcode: string): BarcodeSpecialType {
  const barcode = specialBarcodeTypes.find(
    (validName) => validName === maybeProductBarcode,
  );
  if (barcode) {
    return barcode;
  }
  throw new Error("That is not a special barcode.");
}

export function barcodeToType(barcode: string): BarcodeAnyType {
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
  const inferredType: BarcodeAnyType = barcodeToType(barcode);
  try {
    parseSpecialBarcode(inferredType);
    return true;
  } catch {
    return false;
  }
}

function isProductBarcode(barcode: string): boolean {
  const inferredType: BarcodeAnyType = barcodeToType(barcode);
  try {
    parseProductBarcode(inferredType);
    return true;
  } catch {
    return false;
  }
}

function grocyProductNumber(barcode: string): number | null {
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
