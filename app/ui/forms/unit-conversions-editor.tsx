import { QuantityUnit, QuantityUnitConversion } from "@/interfaces/grocy";
import UnitConversions from "@/lib/conversions";
import { inputCommonStyles } from "@/lib/product-form-shared";
import { QuantityUnitContext } from "@/providers/quantity-unit-context";
import clsx from "clsx";
import { use, useContext, useState } from "react";
import { toLookup } from "@/lib/utils";
import { QuantityUnitConversionContext } from "@/providers/quantity-unit-conversion-context";
import { FieldMetadata, getInputProps } from "@conform-to/react";

export default function UnitConversionsEditor({
  field,
  conversions,
  from,
  to,
  toValue,
  initialFactor,
  active,
}: {
  field: FieldMetadata;
  conversions: UnitConversions;
  from: string;
  to: string;
  toValue: string | undefined;
  initialFactor?: string;
  active: boolean;
}) {
  const existingConversions = use(
    useContext(QuantityUnitConversionContext) as Promise<QuantityUnitConversion[]>,
  );

  const units = toLookup(use(useContext(QuantityUnitContext) as Promise<QuantityUnit[]>));

  const conv = conversions.find(from, to);

  const [convFactor, setConvFactor] = useState<number>(
    initialFactor ? Number(initialFactor) : conv ? conv.factor : 1.0,
  );

  if (!active) {
    return <input {...getInputProps(field, { type: "hidden" })} defaultValue={1} />;
  }

  if (conv === undefined) {
    console.log("no conversion", field.name);
    return <></>;
  }

  const [nTo, nFrom] = [Number(to), Number(from)];

  const haveExistingConversion = existingConversions.find(
    (exConv) =>
      (exConv.from_qu_id === nFrom && exConv.to_qu_id === nTo) ||
      (exConv.from_qu_id === nTo && exConv.to_qu_id === nFrom),
  );
  if (haveExistingConversion) {
    return <></>;
  }

  //const locations = use(useContext(LocationContext) as Promise<PrLocation[]>);

  const unitFrom = units[nFrom];
  const unitTo = units[nTo];

  if (unitFrom === undefined || unitTo === undefined) {
    return <></>;
  }

  //console.log( 'f->t', units[nFrom], units[nTo] )
  //console.log(...conversions.conversions);
  return (
    <div key={`conversion-${conv.key}-outer`} className="min-h-10 pt-3">
      Add conversion:{" "}
      <span className="text-green-200">
        {toValue ? toValue : "???"} {Number(toValue) !== 1.0 ? unitFrom.name_plural : unitFrom.name}
      </span>{" "}
      to{" "}
      {unitTo.userfields!.indivisible ? (
        <>
          1
          <input type="hidden" id={field.id} key={field.key} name={field.name} value={1} />
        </>
      ) : (
        <input
          id={field.id}
          key={field.key}
          name={field.name}
          type="number"
          defaultValue={convFactor}
          min={0.0}
          step={1}
          max={10000}
          required
          autoComplete="off"
          placeholder={"> 0"}
          // aria-invalid={!field.valid || undefined}
          // aria-describedby={!field.valid ? field.errorId : undefined}
          className={clsx(inputCommonStyles, "w-20", "mt-[-11]")}
          onChange={(e) => setConvFactor(Number(e.currentTarget.value))}
          onInput={(e) => setConvFactor(Number(e.currentTarget.value))}
          onBlur={(e) => setConvFactor(Number(e.currentTarget.value))}
        />
      )}{" "}
      {!unitTo.userfields!.indivisible && convFactor !== 1 ? unitTo.name_plural : unitTo.name}{" "}
      <span className="text-slate-400">«=»</span> {convFactor}{" "}
      {convFactor !== 1 ? unitTo.name_plural : unitTo.name} in{" "}
      <span className="text-green-200">
        {toValue ? toValue : "???"} {Number(toValue) !== 1.0 ? unitFrom.name_plural : unitFrom.name}
      </span>
      <br />
      {/* <pre className="font-xs">{JSON.stringify(conv)}</pre> */}
    </div>
  );
}
