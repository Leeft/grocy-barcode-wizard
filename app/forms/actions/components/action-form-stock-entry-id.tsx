import { Product, StockEntry } from "@/interfaces/grocy";
import { sumStock } from "@/lib/utils";
import { CustomisableSelect } from "@/ui/customisable-select";
import { FormColumn, FormErrors, FormField, FormLabel } from "@/ui/forms/form-utils";
import { StockEntrySummaryText } from "@/ui/stock-entry-summary";
import { FieldMetadata, getInputProps } from "@conform-to/react";
import { Dispatch, SetStateAction } from "react";

export function ActionFormStockEntryId({
  product,
  stock,
  field,
  setAmountValue,
}: {
  product: Product;
  stock: StockEntry[];
  field: FieldMetadata<unknown>;
  setAmountValue: Dispatch<SetStateAction<string>>;
}) {
  const seen: Record<string, number> = {};

  const stockOptions = stock
    .filter((se) => {
      if (se.stock_id !== undefined) {
        if (seen[se.stock_id] === undefined) seen[se.stock_id] = 0;
        seen[se.stock_id]! += 1;
        return seen[se.stock_id] == 1;
      }
      return false;
    })
    .map((se) => {
      const node = StockEntrySummaryText({ product: product, se: se });
      return { value: se.stock_id!, label: node };
    });

  stockOptions.unshift({
    value: "",
    label: "",
  });

  return (
    <FormColumn className="w-full">
      <FormLabel htmlFor={field.name} title="Specific stock entry" className="relative top-[-8] mb-0!" />
      <FormField className="flex flex-row gap-x-2">
        <CustomisableSelect
          {...getInputProps(field, {
            type: "hidden",
          })}
          options={stockOptions}
          className="w-full"
          onChange={(e) => {
            setAmountValue(sumStock({ stock: stock, stockId: e.currentTarget.value }).toString());
          }}
        />
      </FormField>
      <FormErrors id={field.errorId} errors={field.errors} />
    </FormColumn>
  );
}
