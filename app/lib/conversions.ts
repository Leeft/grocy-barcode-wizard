// eslint-disable-next-line @typescript-eslint/no-unused-vars
const conversionSources = ["PURCHASE", "CONSUME", "PRICE"] as const;
export type ConversionSource = (typeof conversionSources)[number];
export type ConversionSources = ConversionSource[];

export default class UnitConversions {
  conversions: UnitConversion[];

  constructor() {
    this.conversions = [];
  }

  #track(conversion: UnitConversion): UnitConversion | undefined {
    if (conversion.noConversion || this.conversions.find((conv) => conv.key === conversion.key)) {
      return undefined;
    }

    this.conversions.push(conversion);
    return conversion;
  }

  trackConversion(from: string, to: string, source: ConversionSource) {
    //console.log("trackConversion", from, to, source);
    if (from === undefined || to === undefined) return;
    const conversion = new UnitConversion({
      from_qu_id: from,
      to_qu_id: to,
      factor: 1.0,
      for: source,
    });
    this.#track(conversion);
  }

  untrack(from: string, to: string | undefined) {
    if (from === undefined || to === undefined) return;
    const key = `${from}-${to}`;
    this.conversions.find((conv, index) => {
      if (conv !== undefined && conv.key === key) {
        this.conversions.splice(index, 1);
      }
    });
  }

  find(from: string, to: string) {
    const key = `${from}-${to}`;
    // const keys = this.conversions
    //   .filter((c) => c !== undefined)
    //   .map((c) => c.key);
    // console.log( "find key is", key, "; conversions have keys", keys);
    return this.conversions.find((conv) => conv.key == key);
  }
}

interface IUnitConversion {
  from_qu_id: string;
  to_qu_id: string;
  factor: number;
  flipped?: boolean; // from/to are reversed, or using 1/factor instead
  for?: ConversionSource;
}

export class UnitConversion implements IUnitConversion {
  from_qu_id: string;
  to_qu_id: string;
  factor: number;
  flipped?: boolean;
  for?: ConversionSource;

  constructor(args: IUnitConversion) {
    this.from_qu_id = args.from_qu_id;
    this.to_qu_id = args.to_qu_id;
    this.factor = args.factor;
    this.flipped = args.flipped ?? false;
    this.for = args.for;
  }

  get key() {
    return `${this.from_qu_id}-${this.to_qu_id}`;
  }

  get noConversion(): boolean {
    return this.from_qu_id === this.to_qu_id;
  }

  get incomplete(): boolean {
    return Number(this.from_qu_id) <= 0 || Number(this.to_qu_id) <= 0;
  }

  setFactor(factor: number): void {
    this.factor = factor;
  }

  convert(amount: number): number {
    return amount * this.factor;
  }

  convertInverse(amount: number): number {
    return 1 / (amount * this.factor);
  }

  copy(): UnitConversion {
    return new UnitConversion({
      from_qu_id: this.from_qu_id,
      to_qu_id: this.to_qu_id,
      factor: this.factor,
      flipped: this.flipped,
      for: this.for,
    });
  }

  static quickCreate(id: string, src: ConversionSource): UnitConversion {
    return new UnitConversion({
      from_qu_id: id,
      to_qu_id: id,
      factor: 1,
      for: src,
    });
  }
}

export type UnitConversionsArray = UnitConversion[];
