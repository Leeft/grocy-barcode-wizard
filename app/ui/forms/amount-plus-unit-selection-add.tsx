import { Product, QuantityUnit, QuantityUnitConversion } from "@/interfaces/grocy";
import { amountToStockUnit, toLookup } from "@/lib/utils";
import { getInputProps, useField } from "@conform-to/react";
import { use, useState } from "react";
import { FormColumn, FormErrors, FormField, FormLabel } from "./form-utils";
import { UnitForAmount } from "@/components/unit-for-amount";
import { Button } from "../button";
import { CornerDownLeft } from "lucide-react";
import { clsx } from "clsx";
import { inputCommonStyles } from "@/lib/product-form-shared";
import { CustomisableSelect, CustomisableSelectOptionArray } from "../customisable-select";
import { useGetAmountPlusUnitObject } from "@/providers/amount-plus-unit-context";

export function AmountPlusUnitSelectionAdd({
  product,
  title = "Amount to add *",
}: {
  product: Product;
  title?: string;
}) {
  const [fieldAmount, form] = useField("amount.amount");
  const [fieldMaxAmount] = useField("amount.maximumAmount");
  const [fieldAmountShadow] = useField("amount.amountShadow");
  const [fieldQuantityUnitId] = useField("amount.amountQuantityUnitId");

  const [amountValue, setAmountValue] = useState<string>("1");

  const multi = useGetAmountPlusUnitObject();

  const unitsLookup = toLookup(use(multi.quantityUnitsPromise));
  const conversions = use(multi.resolvedQuantityUnitsConversionPromise).filter(
    (qu) => qu.product_id === product.id,
  );

  const options = buildOptions({
    conversions: conversions,
    units: unitsLookup,
  }) as CustomisableSelectOptionArray;

  // const [availableStockSelectedUnit, setAvailableStockSelectedUnit] = useState<number>(
  //   amountToStockUnit({
  //     conversions: conversions,
  //     amount: 10000,
  //     unit: Number(product.qu_id_stock),
  //     targetUnit: Number(fieldQuantityUnitId.value ?? product.qu_id_stock),
  //   }),
  // );

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
      <FormColumn className={`w-full`}>
        <input {...getInputProps(fieldAmountShadow, { type: "hidden", value: false })} value={equivalent} />
        <input {...getInputProps(fieldMaxAmount, { type: "hidden" })} />
        <div className="w-ful md:max-w-110">
          <div className={`flex`}>
            <div className="grow">
              <FormLabel htmlFor={fieldAmount.name} title={title} className="relative top-[-8] mb-0!" />
            </div>
            <div className="inline-flex">
              <UnitForAmount
                unit={product.qu_id_stock!}
                title="This is the stock unit used for this product and this unit can't be easily changed."
                className="h-5 grow text-right text-sm"
                plural={true}
              />
              <Button
                type="button"
                className="remove-styles hover:remove-styles mb-1 ml-2! inline-block h-auto w-auto"
                title="Set one of the product's stock unit"
                onClick={() => {
                  setAmountValue("1");
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
              max={Number(fieldMaxAmount.value ?? '10000')}
              className={clsx(inputCommonStyles, "w-full")}
              placeholder="Amount"
              value={amountValue}
              autoFocus={true}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => {
                setAmountValue(e.currentTarget.value);
                // setAvailableStockSelectedUnit(
                //   amountToStockUnit({
                //     conversions: conversions,
                //     amount: 10000,
                //     unit: Number(product.qu_id_stock),
                //     targetUnit: Number(fieldQuantityUnitId.value),
                //   }),
                // );
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
              onChange={(e) => {
                setConversionUnit(Number(e.target.value));
                // setAvailableStockSelectedUnit(
                //   amountToStockUnit({
                //     conversions: conversions,
                //     amount: 10000,
                //     unit: Number(product.qu_id_stock),
                //     targetUnit: Number(fieldQuantityUnitId.value),
                //   }),
                // );
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
