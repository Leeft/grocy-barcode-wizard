import { Product, QuantityUnit, QuantityUnitConversion, StockEntry } from "@/interfaces/grocy";
import { roundToFourDecimalPlaces, toLookup } from "@/lib/utils";
import { QuantityUnitContext } from "@/providers/quantity-unit-context";
import { QuantityUnitConversionResolvedContext } from "@/providers/quantity-unit-conversion-resolved-context";
import { getInputProps, useField } from "@conform-to/react";
import { Dispatch, SetStateAction, use, useContext, useState } from "react";
import { FormColumn, FormErrors, FormField, FormLabel } from "./form-utils";
import { UnitForAmount } from "@/components/unit-for-amount";
import { Button } from "../button";
import { CornerDownLeft } from "lucide-react";
import { clsx } from "clsx";
import { inputCommonStyles } from "@/lib/product-form-shared";
import { CustomisableSelect, CustomisableSelectOptionArray } from "../customisable-select";

export function AmountPlusUnitSelection({
  product,
  stock,
  availableStock,
  setAvailableStock,
}: {
  product: Product;
  stock: StockEntry[];
  availableStock: number;
  setAvailableStock: Dispatch<SetStateAction<number>>;
}) {
  const [fieldAmount, form] = useField("amount");
  const [fieldUnit] = useField("amountQuantityUnitId");
  const [amountShadow] = useField("amountShadow");

  const unitsLookup = toLookup(use(useContext(QuantityUnitContext) as Promise<QuantityUnit[]>));
  const conversions = use(
    useContext(QuantityUnitConversionResolvedContext) as Promise<QuantityUnitConversion[]>,
  );

  const distinctConversions = [
    ...new Set(conversions.filter((item) => item.from_qu_id !== undefined).map((item) => item.from_qu_id)),
  ];

  const options = distinctConversions
    .map((id) => unitsLookup[id])
    .filter((qu) => qu !== undefined)
    .map((qu) => {
      return {
        value: qu.id!.toString(),
        label: qu.name,
      };
    });

  function amountToStockUnit(amount: number, unit: number, targetUnit: number) {
    if (unit === targetUnit) return amount;
    const conversion = conversions.find((conv) => conv.to_qu_id === targetUnit && conv.from_qu_id === unit);
    if (conversion === undefined) return amount;
    return roundToFourDecimalPlaces(amount * conversion.factor);
  }

  const [availableStockSelectedUnit, setAvailableStockSelectedUnit] = useState<number>(
    amountToStockUnit(availableStock, Number(fieldUnit.value), Number(product.qu_id_stock)),
  );

  const [amountValue, setAmountValue] = useState<string>("1");
  const [conversionUnit, setConversionUnit] = useState<number>(product.qu_id_stock!);

  const equivalent = amountToStockUnit(
    Number(fieldAmount.value),
    Number(fieldUnit.value),
    Number(product.qu_id_stock),
  );

  return (
    <FormColumn className="w-full">
      <input {...getInputProps(amountShadow, { type: "hidden", value: false })} value={equivalent} />
      <div className="w-ful md:max-w-110">
        <div className={`flex`}>
          <div className="grow">
            <FormLabel htmlFor={fieldAmount.name} title="Amount *" className="relative top-[-8] mb-0!" />
          </div>
          <div className="inline-flex">
            Max of {availableStock}&nbsp;
            <UnitForAmount
              unit={product.qu_id_stock!}
              title="This is the stock unit used for this product and this unit can't be easily changed."
              className="h-5 grow text-right text-sm"
              plural={availableStock > 1}
            />
            <Button
              type="button"
              className="remove-styles hover:remove-styles mb-1 ml-2! inline-block h-auto w-auto"
              title="Copy the maximum possible value to the input fields"
              onClick={() => {
                setAmountValue(availableStock.toString());
                setConversionUnit(product.qu_id_stock!);
                setTimeout(() => form.validate(), 40);
              }}
            >
              <CornerDownLeft className="radius-md mb-2 size-5 cursor-pointer border border-dashed border-blue-400 p-0.5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-row gap-3 md:max-w-110">
        <FormField className="flex-2 grow">
          <input
            {...getInputProps(fieldAmount, {
              type: "number",
              value: false,
            })}
            min={0}
            step={1}
            max={availableStockSelectedUnit}
            className={clsx(inputCommonStyles, "w-full")}
            placeholder="Amount"
            value={amountValue}
            onChange={(e) => {
              setAmountValue(e.currentTarget.value);
              setAvailableStockSelectedUnit(
                amountToStockUnit(availableStock, Number(product.qu_id_stock), Number(fieldUnit.value)),
              );
            }}
            required
          />
        </FormField>
        <FormField className="flex-1 grow">
          <CustomisableSelect
            id={fieldUnit.id}
            name={fieldUnit.name}
            form={fieldUnit.formId}
            aria-invalid={!fieldUnit.valid || undefined}
            aria-describedby={!fieldUnit.valid ? fieldUnit.errorId : undefined}
            required={true}
            options={options as CustomisableSelectOptionArray}
            value={conversionUnit}
            className="w-full"
            onChange={(e) => {
              setConversionUnit(Number(e.target.value));
              setAvailableStockSelectedUnit(
                amountToStockUnit(availableStock, Number(product.qu_id_stock), Number(fieldUnit.value)),
              );
            }}
          />{" "}
        </FormField>
      </div>
      {conversionUnit !== product.qu_id_stock! && !isNaN(equivalent) && (
        <div className="w-full pt-1 text-slate-400 md:max-w-110">
          Is equal to {equivalent}{" "}
          {equivalent === 1
            ? unitsLookup[product.qu_id_stock!]!.name
            : unitsLookup[product.qu_id_stock!]!.name_plural}
        </div>
      )}
      <FormErrors id={fieldAmount.errorId} errors={fieldAmount.errors} />
    </FormColumn>
  );
}
