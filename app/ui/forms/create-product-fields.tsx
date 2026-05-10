"use client";

import { UnitSystem, DueDateType, PurchasePriceType } from "@/generated/prisma/enums";
import {
  inputCommonStyles,
  unitSystemOptions,
  dueDateTypeOptions,
  purchasePriceOptions,
} from "@/lib/product-form-shared";
import {
  DueDaysColumn,
  FormCheckbox,
  FormColumn,
  FormErrors,
  FormField,
  FormLabel,
  FormRow,
  FormRowGroup,
  PackagingDateTooltip,
  ShouldNotBeFrozenTooltip,
  WeightModeAmountTooltip,
  WeightModeTooltip,
} from "@/ui/forms/form-utils";
import { getInputProps, useFormMetadata, useInputControl } from "@conform-to/react";
import clsx from "clsx";
import { Dispatch, RefObject, SetStateAction, use, useContext, useRef, useState } from "react";
import CustomisableSelect from "../customisable-select";
import { LocationDropdown } from "../product/location-dropdown";
import { QuantityUnitsDropdown } from "../product/quantity-units-dropdown";
import { ModeToQuantityTitle, ModeToUnitTitle } from "../product/unit-mode-dropdown";
import { QuantityUnitContext } from "@/providers/quantity-unit-context";
import UnitConversions from "@/lib/conversions";
import { LocationContext } from "@/providers/location-context";
import {
  ProductLocation as PrLocation,
  purchasePriceTypeToPlaceholder,
  QuantityUnit,
} from "@/interfaces/grocy";
import { dateToISODate } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Route } from "next";

export default function CreateProductFields({
  formId,
  fields,
  selectedUnit,
  setSelectedUnit,
  unitConversions,
  selectedPurchaseQuId,
  setSelectedPurchaseQuId,
  selectedConsumeQuId,
  setSelectedConsumeQuId,
  selectedPriceQuId,
  setSelectedPriceQuId,
}: {
  formId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: any;
  selectedUnit: string;
  setSelectedUnit: Dispatch<SetStateAction<string>>;
  unitConversions?: UnitConversions;
  selectedPurchaseQuId?: string;
  setSelectedPurchaseQuId?: Dispatch<SetStateAction<string>>;
  selectedConsumeQuId?: string;
  setSelectedConsumeQuId?: Dispatch<SetStateAction<string>>;
  selectedPriceQuId?: string;
  setSelectedPriceQuId?: Dispatch<SetStateAction<string>>;
}) {
  const [dueDays, setDueDays] = useState<string>(fields.dueDays.value);

  const form = useFormMetadata(formId);
  if (form) {
    // NOOP to make the variable used
  }

  const unitIdRef = useRef<HTMLSelectElement>(null);
  const unitIdControl = useInputControl(fields.unitId);
  const unitAmountRef = useRef<HTMLInputElement>(null);
  const unitAmountControl = useInputControl(fields.unitAmount);

  const units = use(useContext(QuantityUnitContext) as Promise<QuantityUnit[]>);
  const locations = use(useContext(LocationContext) as Promise<PrLocation[]>);

  const calculateDueDays = (expiryDate: Date, packagingDate: Date): string => {
    if (expiryDate === null) return "";
    if (packagingDate === null) return "";
    return Math.abs(
      Math.round((packagingDate.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24)),
    ).toString();
  };

  return (
    <>
      <FormRow comment="Add barcode to product link">
        <FormColumn>
              <span className="hidden sm:inline-block">or:</span>
          <Link
            href={`/scan/${encodeURIComponent(fields.barcode.value)}/add-to-product` as Route<string>}
            className="rounded-lg border border-dashed px-4 py-2 ml-0 sm:ml-3 underline underline-offset-4 inline-block"
          >
            <ArrowRight className="inline size-6 pr-1.5" />
            Add barcode <code>{fields.barcode.value}</code> to existing product
          </Link>
        </FormColumn>
      </FormRow>

      <FormRow comment="Product name">
        <FormColumn>
          <FormLabel htmlFor={fields.name.name} title="Product name *" />
          <FormField>
            <input
              {...getInputProps(fields.name, { type: "text" })}
              placeholder="Name of the product to create"
              autoComplete="off"
              className={clsx(inputCommonStyles, "w-full")}
            />
          </FormField>
          <FormErrors id={fields.name.errorId} errors={fields.name.errors} />
        </FormColumn>
      </FormRow>

      <FormRow comment="[ ] Should not be frozen">
        <FormColumn>
          <div className="flex flex-col leading-7">
            <FormField>
              <FormCheckbox fieldInfo={fields.shouldNotBeFrozen}>
                This product should not be frozen
                <ShouldNotBeFrozenTooltip />
              </FormCheckbox>
            </FormField>
            <FormErrors id={fields.shouldNotBeFrozen.errorId} errors={fields.shouldNotBeFrozen.errors} />
          </div>
        </FormColumn>
      </FormRow>

      <FormRow className="flex-wrap" comment="Unit system configuration">
        <FormColumn className="w-50" comment="Unit system">
          <FormLabel htmlFor="unitSystem" title="Stock unit system *" className="inline-block">
            <WeightModeTooltip />
          </FormLabel>
          <FormField>
            <CustomisableSelect
              {...getInputProps(fields.unitSystem, { type: "number" })}
              required
              className="w-full"
              options={unitSystemOptions}
              onChange={() => {
                unitIdControl.change("");
                unitAmountControl.change("1.0");
              }}
            />
          </FormField>
          <FormErrors id={fields.unitSystem.errorId} errors={fields.unitSystem.errors} />
        </FormColumn>

        {fields.unitSystem.value !== "ABSTRACT" ? (
          <FormColumn className="w-34" comment="Unit amount">
            <FormLabel
              htmlFor={fields.unitAmount.name}
              title={ModeToQuantityTitle(fields.unitSystem?.value)}
              className="text-stock-unit inline-block"
            >
              <WeightModeAmountTooltip />
            </FormLabel>
            <FormField>
              <input
                {...getInputProps(fields.unitAmount, { type: "number" })}
                ref={unitAmountRef}
                step={0.001}
                placeholder="Number"
                className={clsx("hide-arrows", inputCommonStyles, "w-full", "text-stock-unit")}
              />
            </FormField>
            <FormErrors id={fields.unitAmount.errorId} errors={fields.unitAmount.errors} />
          </FormColumn>
        ) : (
          <input
            {...getInputProps(fields.unitAmount, { type: "hidden" })}
            step={1}
            min={1}
            max={1}
            defaultValue={1}
            required
            readOnly
          />
        )}

        <FormColumn className="min-w-50" comment="Unit id">
          <FormLabel
            htmlFor={fields.unitId.name}
            title={ModeToUnitTitle(fields.unitSystem?.value)}
            className={`text-stock-unit! text-sm!`}
          ></FormLabel>
          <FormField className="w-min-30 flex grow">
            {fields.unitSystem.value === "ABSTRACT" && (
              <div className="text-md text-stock-unit shrink p-2 pl-0 font-bold">1</div>
            )}
            <QuantityUnitsDropdown
              ref={unitIdRef as RefObject<HTMLSelectElement>}
              field={fields.unitId}
              units={units}
              unitSystem={fields.unitSystem.value as UnitSystem}
              className={clsx("w-full", "text-stock-unit")}
              selectedOption={selectedUnit!}
              setSelectedOption={setSelectedUnit}
              onChange={(e) => {
                const id = e.currentTarget.value;
                if (id !== fields.unitId.value) {
                  if (unitConversions !== undefined) {
                    if (selectedPurchaseQuId)
                      unitConversions.untrack(selectedPurchaseQuId, fields.unitId.value);
                    if (selectedConsumeQuId)
                      unitConversions.untrack(selectedConsumeQuId, fields.unitId.value);
                    if (selectedPriceQuId) unitConversions.untrack(selectedPriceQuId, fields.unitId.value);
                    unitConversions.trackConversion(id, id, "PURCHASE");
                  }
                  if (setSelectedPurchaseQuId) setSelectedPurchaseQuId(id);
                  if (setSelectedConsumeQuId) setSelectedConsumeQuId(id);
                  if (setSelectedPriceQuId) setSelectedPriceQuId(id);
                }
              }}
            />
          </FormField>
          <FormErrors className="grow" id={fields.unitId.errorId} errors={fields.unitId.errors} />
        </FormColumn>
      </FormRow>

      <FormRow comment="Initial product location">
        <FormColumn className="w-80">
          <FormLabel htmlFor={fields.defaultLocationId.name} title="Initial product location *"></FormLabel>
          <FormField>
            <LocationDropdown
              {...getInputProps(fields.defaultLocationId, {
                type: "number",
              })}
              units={locations}
              className="w-full"
              noFreezers={fields.shouldNotBeFrozen.value ? true : false}
              required
            />
          </FormField>
          <FormErrors id={fields.defaultLocationId.errorId} errors={fields.defaultLocationId.errors} />
        </FormColumn>
      </FormRow>

      <FormRow comment="Due date type and expiry" className="gap-y-5">
        <FormColumn className="flex-none">
          <FormLabel htmlFor={fields.dueDateType.name} title="Due date type *"></FormLabel>
          <FormField>
            <CustomisableSelect
              {...getInputProps(fields.dueDateType, { type: "hidden" })}
              options={dueDateTypeOptions}
              className="w-46"
            />
          </FormField>
          <FormErrors id={fields.dueDateType.errorId} errors={fields.dueDateType.errors} />
        </FormColumn>

        {fields.dueDateType.value !== DueDateType.NO_EXPIRY && (
          <>
            <FormColumn className="flex-none">
              <FormLabel
                htmlFor={fields.dueOrExpiryDate.name}
                title={
                  fields.dueOrExpiryDate.value === DueDateType.BEST_BEFORE ? "Best before *" : "Expires at *"
                }
              ></FormLabel>
              <FormField>
                <input
                  {...getInputProps(fields.dueOrExpiryDate, {
                    type: "date",
                  })}
                  required
                  className={inputCommonStyles}
                  onChange={(e) => {
                    if (fields.packagingDate.value)
                      setDueDays(
                        calculateDueDays(
                          new Date(e.currentTarget.value),
                          new Date(fields.packagingDate.value),
                        ),
                      );
                  }}
                />
              </FormField>
              <FormErrors id={fields.dueOrExpiryDate.errorId} errors={fields.dueOrExpiryDate.errors} />
            </FormColumn>
            <FormColumn className="flex-none">
              <FormLabel htmlFor={fields.packagingDate.name} title="Packaging date" className="inline-block">
                <PackagingDateTooltip />
              </FormLabel>
              <FormField>
                <input
                  {...getInputProps(fields.packagingDate, { type: "date" })}
                  className={inputCommonStyles}
                  max={dateToISODate(new Date())}
                  onChange={(e) => {
                    if (fields.dueOrExpiryDate.value)
                      setDueDays(
                        calculateDueDays(
                          new Date(fields.dueOrExpiryDate.value),
                          new Date(e.currentTarget.value),
                        ),
                      );
                  }}
                />
              </FormField>
              <FormErrors id={fields.packagingDate.errorId} errors={fields.packagingDate.errors} />
            </FormColumn>
          </>
        )}
      </FormRow>

      <FormRowGroup comment="Default due days rows">
        {fields.dueDateType.value !== DueDateType.NO_EXPIRY && (
          <FormRow className="flex-col gap-y-5" comment="Default due days * configuration">
            <DueDaysColumn
              fieldInfo={fields.dueDays}
              title="Default due days *"
              placeholder="default due days"
              value={dueDays}
              setValue={setDueDays}
            />
            <DueDaysColumn
              fieldInfo={fields.dueDaysAfterOpen}
              title="Default due days after open *"
              placeholder="days after open"
            />
            {!fields.shouldNotBeFrozen.value && (
              <>
                <DueDaysColumn
                  fieldInfo={fields.dueDaysAfterFreezing}
                  title="Default due days after freezing *"
                  placeholder="days after freezing"
                />
                <DueDaysColumn
                  fieldInfo={fields.dueDaysAfterThawing}
                  title="Default due days after thawing *"
                  placeholder="days after thawing"
                />
              </>
            )}
          </FormRow>
        )}
      </FormRowGroup>

      <FormRow comment="Purchase price type">
        <FormColumn className="w-38">
          <FormLabel htmlFor={fields.purchasePriceType.name} title="Purchase price type"></FormLabel>
          <FormField>
            <CustomisableSelect
              {...getInputProps(fields.purchasePriceType, {
                type: "hidden",
              })}
              options={purchasePriceOptions}
              className="w-full"
            />
          </FormField>
          <FormErrors id={fields.purchasePriceType.errorId} errors={fields.purchasePriceType.errors} />
        </FormColumn>

        <FormColumn className="w-40">
          <FormLabel htmlFor={fields.purchasePrice.name} title="Purchase price"></FormLabel>
          <FormField>
            <input
              defaultValue={"0"}
              {...getInputProps(fields.purchasePrice, {
                type: "number",
              })}
              className={clsx(inputCommonStyles, "w-full")}
              placeholder={purchasePriceTypeToPlaceholder(
                fields.purchasePriceType.value as PurchasePriceType,
              )}
            />
          </FormField>
          <FormErrors id={fields.purchasePrice.errorId} errors={fields.purchasePrice.errors} />
        </FormColumn>

        <FormColumn className="w-30">
          <FormLabel htmlFor={fields.quantity.name} title="Quantity to add" />
          <FormField>
            <input
              defaultValue={"1"}
              {...getInputProps(fields.quantity, {
                type: "number",
              })}
              className={clsx(inputCommonStyles, "w-full")}
            />
          </FormField>
          <FormErrors id={fields.quantity.errorId} errors={fields.quantity.errors} />
        </FormColumn>
      </FormRow>

      <FormRow comment="Notes">
        <FormColumn className="w-full md:w-110">
          <FormLabel htmlFor={fields.notes.name} title="Notes" />
          <FormField>
            <textarea
              {...getInputProps(fields.notes, {
                type: "text",
              })}
              className={clsx(inputCommonStyles, "w-full", "placeholder:text-slate-500")}
              placeholder="e.g. write down the energy per unit for this product"
            />
          </FormField>
          <FormErrors id={fields.notes.errorId} errors={fields.notes.errors} />
        </FormColumn>
      </FormRow>
    </>
  );
}
