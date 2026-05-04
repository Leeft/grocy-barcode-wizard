import { Product, QuantityUnit, QuantityUnitConversion, StockEntry } from "@/interfaces/grocy";
import { amountToStockUnit, sumStock, toLookup } from "@/lib/utils";
import { getInputProps, useField } from "@conform-to/react";
import { Dispatch, SetStateAction, use, useState } from "react";
import { FormColumn, FormErrors, FormField, FormLabel } from "./form-utils";
import { UnitForAmount } from "@/components/unit-for-amount";
import { Button } from "../button";
import { CornerDownLeft } from "lucide-react";
import { clsx } from "clsx";
import { inputCommonStyles } from "@/lib/product-form-shared";
import { CustomisableSelect, CustomisableSelectOptionArray } from "../customisable-select";
import { useGetAmountPlusUnitObject } from "@/providers/amount-plus-unit-context";

export function AmountPlusUnitSelection({
  product,
  stock,
  title = "Amount *",
  className = "",
  disabled = false,
  autoFocus = false,
  amountValue,
  setAmountValue,
  compoundField,
}: {
  product: Product;
  stock: StockEntry[];
  title?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  amountValue: string;
  setAmountValue: Dispatch<SetStateAction<string>>;
  compoundField: any;
}) {
  const [, form] = useField("amount");
  const fieldAmount = compoundField.amount;
  const fieldMaxAmount = compoundField.maximumAmount;
  const fieldQuantityUnitId = compoundField.amountQuantityUnitId;
  const fieldAmountShadow = compoundField.amountShadow;

  const multi = useGetAmountPlusUnitObject();

  const availableStock = sumStock({ stock: stock });

  const unitsLookup = toLookup(use(multi.quantityUnitsPromise));
  const conversions = use(multi.resolvedQuantityUnitsConversionPromise);

  const options = buildOptions({
    conversions: conversions,
    units: unitsLookup,
  }) as CustomisableSelectOptionArray;

  const [availableStockSelectedUnit, setAvailableStockSelectedUnit] = useState<number>(
    amountToStockUnit({
      conversions: conversions,
      amount: availableStock,
      unit: Number(product.qu_id_stock),
      targetUnit: Number(fieldQuantityUnitId.value ?? product.qu_id_stock),
    }),
  );

  const [conversionUnit, setConversionUnit] = useState<number>(product.qu_id_stock!);

  let equivalent = amountToStockUnit({
    conversions: conversions,
    amount: Number(fieldAmount.value),
    unit: Number(fieldQuantityUnitId.value),
    targetUnit: Number(product.qu_id_stock),
  });
  if (equivalent === undefined || equivalent === 0 || isNaN(equivalent)) {
    equivalent = 0;
  }

  return (
    <>
      <FormColumn className={`w-full ${className}`}>
        <input {...getInputProps(fieldAmountShadow, { type: "hidden", value: false })} value={equivalent} />
        <input {...getInputProps(fieldMaxAmount, { type: "hidden" })} />
        <div className="w-ful md:max-w-110">
          <div className={`flex`}>
            <div className="grow">
              <FormLabel htmlFor={fieldAmount.name} title={title} className="relative top-[-8] mb-0!" />
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
                  setAmountValue(availableStock.toString() ?? "0");
                  setConversionUnit(product.qu_id_stock!);
                  setTimeout(() => form.validate(), 40);
                }}
              >
                <CornerDownLeft className="radius-md border-form-input-border mb-2 size-5 cursor-pointer border border-dashed p-0.5" />
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
              disabled={disabled}
              autoFocus={autoFocus}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => {
                setAmountValue(e.currentTarget.value);
                setAvailableStockSelectedUnit(
                  amountToStockUnit({
                    conversions: conversions,
                    amount: availableStock,
                    unit: Number(product.qu_id_stock),
                    targetUnit: Number(fieldQuantityUnitId.value),
                  }),
                );
              }}
              required
            />
          </FormField>
          <FormField className="flex-1 grow">
            <CustomisableSelect
              id={fieldQuantityUnitId.id}
              name={fieldQuantityUnitId.name}
              form={fieldQuantityUnitId.formId}
              aria-invalid={!fieldQuantityUnitId.valid || undefined}
              aria-describedby={!fieldQuantityUnitId.valid ? fieldQuantityUnitId.errorId : undefined}
              required={true}
              options={options}
              value={conversionUnit}
              className="w-full"
              disabled={disabled}
              onChange={(e) => {
                setConversionUnit(Number(e.target.value));
                const newAvailableStockAmount = amountToStockUnit({
                  conversions: conversions,
                  amount: availableStock,
                  unit: Number(product.qu_id_stock),
                  targetUnit: Number(fieldQuantityUnitId.value),
                });
                setAvailableStockSelectedUnit(newAvailableStockAmount);
                if (newAvailableStockAmount < fieldAmount.value) {
                  form.update({
                    name: fieldAmount.name,
                    value: newAvailableStockAmount,
                  });
                }
              }}
            />{" "}
          </FormField>
        </div>
        {conversionUnit !== product.qu_id_stock! && (
          <div className="w-full pt-1 text-slate-400 md:max-w-110">
            Is equal to {equivalent}{" "}
            {equivalent === 1
              ? unitsLookup[product.qu_id_stock!]!.name
              : unitsLookup[product.qu_id_stock!]!.name_plural}
          </div>
        )}

        <FormErrors id={fieldAmount.errorId} errors={fieldAmount.errors} />
      </FormColumn>
    </>
  );
}

function buildOptions({
  conversions,
  units,
}: {
  conversions: QuantityUnitConversion[];
  units: Record<string | number, QuantityUnit>;
}) {
  const distinctConversions = [
    ...new Set(conversions.filter((item) => item.from_qu_id !== undefined).map((item) => item.from_qu_id)),
  ];

  return distinctConversions
    .map((id) => units[id])
    .filter((qu) => qu !== undefined)
    .map((qu) => {
      return {
        value: qu.id!.toString(),
        label: qu.name,
      };
    });
}
