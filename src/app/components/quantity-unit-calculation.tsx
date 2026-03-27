"use client";

import { QUConversion } from "@/interfaces";
import { QuantityUnit } from "@/interfaces/grocy";

type UnitTarget = {
  id: number | undefined;
  from_qu_id: number | undefined;
  to_qu_id: number | undefined;
  factor: number | undefined;
  target: QuantityUnit | undefined;
};

export function QuantityUnitCalculation({
  units,
  selectedUnit,
  selectedGroup,
  className,
  conversions,
  quantity,
}: {
  units: QuantityUnit[];
  selectedUnit: number;
  selectedGroup: string;
  className?: string;
  conversions: QUConversion[];
  quantity: number;
}) {
  // const source: QuantityUnit = units
  //   .find((unit) => {
  //     return unit.id == selectedUnit;
  //   });

  const safeQuantity = !Number.isNaN(quantity) ? quantity : 0;

  const matchedUnits: UnitTarget[] = conversions
    .filter((conv) => {
      return conv.from_qu_id == selectedUnit;
    })
    .map((conv): UnitTarget => {
      const target = units.find((unit) => {
        return unit.id == conv.to_qu_id;
      });
      return {
        id: conv.id,
        from_qu_id: conv.from_qu_id,
        to_qu_id: conv.to_qu_id,
        factor: conv.factor,
        target: target,
      };
    });

  return (
    <div className={className}>
      {matchedUnits.map((unit) => (
        <DisplayConversion
          key={unit.id}
          unit={unit}
          fraction={unit.factor! * safeQuantity!}
          group={selectedGroup}
        ></DisplayConversion>
      ))}
    </div>
  );
}

function DisplayConversion({
  unit,
  fraction,
  group,
}: {
  unit: UnitTarget;
  fraction: number;
  group: string;
}) {
  let value;
  let error;

  try {
    value = (/metric/.test(group))
      ? floatString(fraction)
      : floatToFractions(fraction.toString());
  } catch (reason) {
    error = reason;
  }

  if (Number.isNaN(value)) {
    return <span className="text-slate-400">« Awaiting valid input {JSON.stringify(error)} »</span>;
  }

  //   =&nbsp;
  //   {/* {RegExp(/metric/).test(selectedGroup)
  //         ? floatString(m.factor! * safeQuantity!)
  //         : floatToFractions(m.factor! * safeQuantity!)}{" "} */}
  //   {value}
  //   {/* {children} */}
  return (
    <span className={"mr-5"}>
      <>»&nbsp;</>
      <>{/metric/.test(group) && false ? (
          <>{floatString(fraction)}</>
      ) : (
          <>{value}</>
      )}</>
      &nbsp;{unit.factor! * fraction > 1 ? unit.target!.name_plural : unit.target!.name}
    </span>
  );
}

const SEP = `⁄`;

// function gcd(a: number, b: number): number {
//   if (a == 0) return b;
//   while (b > 0 && a > 0) {
//     if (a > b) {
//       a -= b;
//     } else {
//       b -= a;
//     }
//   }
//   return a;
// }

// Reused and modified to no longer work with inches, still uses
// 16ths which probably makes the most sense.
// function floatToFractions(float: number, denominator: number): string {
//   if (float === undefined || float === null) {
//     float = 0.0;
//   }

//   const rnd: number = 1.0 / denominator;

//   let float_integer = Math.floor(float);
//   let float_fraction = float - float_integer;

//   let n = Math.ceil(float_fraction / rnd);
//   let dv = gcd(n, denominator);
//   n /= dv;
//   denominator /= dv;

//   if (n === 1 && denominator === 1 && dv === 16) {
//     float_integer += 1;
//     return `${float_integer}`;
//   }

//   if (n === 0) {
//     return `${float_integer}`;
//   }

//   if (float_integer === 0 && n === 0) {
//     return `0`;
//   }

//   if (float_integer === 0) {
//     return `${n}${SEP}${denominator}`;
//   }

//   return `${float_integer} ${n}${SEP}${denominator}`;
// }

const TO_FRACTION_64: number = 0.015625;

const simplifyFraction = function (numerator: number, denominator: number = 64): string {
  // if there is no denominator then there is no fraction
  if (numerator < 1) {
    return "";
  }

  // fraction can't be broken further down:
  if (
    // a) if numerator is 1
    numerator === 1 ||
    // b) if numerator is prime number
    !(numerator % 2 === 0 || Math.sqrt(numerator) % 1 === 0)
  ) {
    return numerator + SEP + denominator;
  }

  return simplifyFraction(numerator / 2, denominator / 2);
};


export function floatToFractions(_input: string, /* denominator: number = 64 */) {
  const input: number = Number.parseFloat(_input);

  if (Number.isNaN(input)) throw new Error(`Input ${input} is not a valid number`);

  const integerPart: number = Math.floor(input);
  // limit decimals to avoid "conflicts" (not sure what conflicts ...)
  const decimalPart: number = Number((input % 1).toFixed(6));

  const fraction64: number = Math.round(decimalPart / TO_FRACTION_64);
  const simplifiedFraction: string = simplifyFraction(fraction64);

  const result = [integerPart, simplifiedFraction];

  return result
    .filter(function (r) {
      return r;
    })
    .join(" ");
}

function floatString(value: number) {
  return Number.parseFloat(value.toFixed(4));
}
