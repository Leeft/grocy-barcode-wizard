import { QuantityUnit, QuantityUnitConversion } from "@/interfaces/grocy";
import UnitConversions from "@/lib/conversions";
import { inputCommonStyles } from "@/lib/product-form-shared";
import { QuantityUnitContext } from "@/providers/quantity-unit-context";
import clsx from "clsx";
import { use, useContext } from "react";
import { toMap } from "@/lib/utils";
import { UnitSystem } from "@/generated/prisma/enums";
import { QuantityUnitConversionContext } from "@/providers/quantity-unit-conversion-context";

export default function UnitConversionsEditor({
  conversions,
  from,
  to,
  toValue,
  unitSystem,
}: {
  conversions: UnitConversions;
  from: string;
  to: string;
  toValue: string | undefined;
  unitSystem: UnitSystem;
}) {
  const conv = conversions.find(from, to);
  if (conv === undefined) {
    return <></>;
  }

  const [nTo, nFrom] = [Number(to), Number(from)];

  const existingConversions = use(
    useContext(QuantityUnitConversionContext) as Promise<
      QuantityUnitConversion[]
    >,
  );

  const haveExistingConversion = existingConversions.find(
    (exConv) =>
      (exConv.from_qu_id === nFrom && exConv.to_qu_id === nTo) ||
      (exConv.from_qu_id === nTo && exConv.to_qu_id === nFrom),
  );
  if (haveExistingConversion) {
    return <></>;
  }
  const units = use(
    useContext(QuantityUnitContext) as Promise<QuantityUnit[]>,
  ).reduce(toMap, {});

  const unitFrom = units[nFrom];
  const unitTo = units[nTo];

  //console.log( 'f->t', units[nFrom], units[nTo] )
  //console.log(...conversions.conversions);
  return (
    <div key={`conversion-${conv.key}-outer`}>
      {/* <h1>{conv.key}</h1> */}
      Add conversion:{" "}
      <span className="text-green-200">
        {toValue ? toValue : "???"}{" "}
        {Number(toValue) !== 1.0 ? unitFrom.name_plural : unitFrom.name}
      </span>{" "}
      to{" "}
      {unitTo.userfields.indivisible ? (
        <>
          1
          <input
            type="hidden"
            id={`conversion-${conv.key}-factor`}
            key={`conversion-${conv.key}-factor`}
            name={`conversion-${conv.key}-factor`}
            value={1}
          />
        </>
      ) : (
        <input
          id={`conversion-${conv.key}-factor`}
          key={`conversion-${conv.key}-factor`}
          name={`conversion-${conv.key}-factor`}
          type="number"
          defaultValue={conv.factor}
          min={0.000}
          step={1}
          max={10000}
          required
          autoComplete="off"
          placeholder={"> 0"}
          // aria-invalid={!field.valid || undefined}
          // aria-describedby={!field.valid ? field.errorId : undefined}
          className={clsx(inputCommonStyles, "w-20")}
          onChange={(e) => (conv.factor = Number(e.currentTarget.value))}
          onInput={(e) => (conv.factor = Number(e.currentTarget.value))}
          onBlur={(e) => (conv.factor = Number(e.currentTarget.value))}
        />
      )}{" "}
      {!unitTo.userfields.indivisible && unitTo.factor !== 1
        ? unitTo.name_plural
        : unitTo.name}{" "}
      <span className="text-slate-400">«=»</span> {conv.factor}{" "}
      {conv.factor !== 1 ? unitTo.name_plural : unitTo.name} in{" "}
      <span className="text-green-200">
        {toValue ? toValue : "???"}{" "}
        {Number(toValue) !== 1.0 ? unitFrom.name_plural : unitFrom.name}
      </span>
      <br />
      {/* <pre className="font-xs">{JSON.stringify(conv)}</pre> */}
    </div>
  );
}
