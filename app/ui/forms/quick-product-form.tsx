"use client";

import React, {
  ChangeEvent,
  use,
  useActionState,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { QuantityUnitsDropdown } from "../product/quantity-units-dropdown";
import { ProductLocation, QuantityUnit } from "@/interfaces/grocy";
import { QuantityUnitContext } from "@/providers/quantity-unit-context";
import {
  quickProductFormSubmit,
  State,
} from "@/forms/quick-product-form-submit";
import { Button } from "../button";
import { LocationContext } from "@/providers/location-context";
import { LocationDropdown } from "../product/location-dropdown";
import { InformationCircleIcon } from "@heroicons/react/20/solid";
import { Tooltip } from "react-tooltip";
import { addYears, dateToISODate } from "@/lib/date";
import clsx from "clsx";
import { ModeType, Option } from "@/interfaces";
import CustomSelect, { CustomSelectHandle } from "../custom-select";
import { FormLabel } from "./inputs/form-label";
import { FormField } from "./inputs/form-field";
import { FormErrors } from "./inputs/form-errors";
import { FormCheckbox } from "./inputs/form-checkbox";
import { UnitModeDropdown } from "../product/unit-mode-dropdown";

export function QuickProductForm() {
  const [selectedWeightUnitId, setSelectedWeightUnitId] = useState<
    number | null
  >(null);
  const [selectedUnitMode, setSelectedUnitMode] = useState<
    ModeType | undefined
  >(undefined);
  const [quantity, setQuantity] = useState<string>("");
  const [shouldNotBeFrozen, setShouldNotBeFrozen] = useState<boolean>(false);
  const [expiryMode, setExpiryMode] = useState<Option | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [packagingDate, setPackagingDate] = useState<Date | null>(null);
  const [defaultDueDays, setDefaultDueDays] = useState<number>(0);
  const [defaultDueAfterOpen, setDefaultDueAfterOpen] = useState<number>(0);
  const [defaultDueAfterFreezing, setDefaultDueAfterFreezing] =
    useState<number>(0);
  const [defaultDueAfterThawing, setDefaultDueAfterThawing] =
    useState<number>(0);

  const initialState: State = { formErrors: [], fieldErrors: {} };
  const [state, formAction /*submitIsPending*/] = useActionState(
    quickProductFormSubmit,
    initialState,
  );

  const quantityUnitsPromise = useContext(QuantityUnitContext) as Promise<
    QuantityUnit[]
  >;
  const locationsPromise = useContext(LocationContext) as Promise<
    ProductLocation[]
  >;

  const units = use(quantityUnitsPromise);
  const locations = use(locationsPromise);

  const inputCommonStyles: string = clsx(
    "block",
    "rounded-md",
    "my-[9.5]",
    "py-[6]",
    "px-2",
    "border-1!",
    "border-[#a0a7c3]!",
    "hover:border-[#ebf2ff]!",
    "focus:border-[#c7c92c]!",
    "hover:focus:border-[#c7c92c]!",
    "focus:border-2!",
    "text-base",
    "text-left",
    "bg-[#30384f]",
    "placeholder:font-normal",
    "placeholder:text-grey-600",
    "focus:placeholder:text-red-400",
    "invalid:border-red-[#fb2c36]",
    "focus:invalid:text-yellow-300",
    "focus:invalid:placeholder:text-white-600",
    "focus:invalid:bg-[#68352c]",
    "focus:invalid:border-[#e75f5f]",
    "outline-0!",
    "min-h-[38px]",
  );

  // @ts-expect-error can't find the right type for event
  function submitHandler(event): void {
    event.preventDefault();
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedWeightUnitId(null);

    if (selectedUnitMode === "abstract") {
      setQuantity("1.0");
    } else {
      setQuantity("");
    }

    quSelectRef.current?.clear();
  }, [selectedUnitMode]);

  const calculateDueDays = useCallback(() => {
    if (expiryDate === null) return;
    if (packagingDate === null) return;
    const difference = Math.round(
      (packagingDate.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    setDefaultDueDays(Math.abs(difference));
  }, [expiryDate, packagingDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    calculateDueDays();
  }, [expiryDate, packagingDate, calculateDueDays]);

  const quSelectRef = useRef<CustomSelectHandle>(null);

// form  className="w-auto p-0 m-0"

  return (
    <form
      action={formAction}
      onSubmit={submitHandler}
      noValidate
      className="pb-25"
    >
      <div className="flex flex-col">
        <div className="flex flex-row gap-5">
          <div className="flex-auto">
            <h1 className="mb-3 inline-block text-lg font-bold text-slate-400 uppercase">
              Quick product capture
            </h1>
            <a
              className="inline-block w-10 cursor-help pl-2"
              data-tooltip-id="form-purpose-tooltip"
            >
              &nbsp;
              <InformationCircleIcon className="inline size-5 text-slate-300" />
            </a>
            <Tooltip id="form-purpose-tooltip" className="info-tooltip">
              This form captures a few essentials for a product quickly
              <br />
              without adding it to Grocy. It&apos;ll be queued for completion
              <br />
              after when you are not under pressure from not having your
              <br />
              your products refrigerated or even thawing during entry.
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-row gap-5">
          <div className="mb-4 flex-auto">
            <FormLabel htmlFor="name" title="Product name *" />
            <FormField>
              <input
                id="name"
                name="name"
                type="text"
                minLength={2}
                maxLength={64}
                placeholder="Name of the product to create, 2 to 64 characters long"
                className={clsx("w-full", "pr-3", inputCommonStyles)}
                aria-describedby="name-error"
                required
              />
            </FormField>
            <FormErrors id="name-error" errors={state.fieldErrors?.name} />
          </div>
        </div>

        <div className="flex flex-row gap-5">
          <div className="mb-4 flex-auto">
            <div className="flex flex-col">
              <FormField>
                <FormCheckbox
                  id="shouldNotBeFrozen"
                  ariaDescribedBy="should-not-be-frozen-error"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setShouldNotBeFrozen(e.target.checked)
                  }
                />
                <label htmlFor="shouldNotBeFrozen">
                  This product should not be frozen
                </label>
              </FormField>
              <FormErrors
                id="should-not-be-frozen-error"
                errors={state.fieldErrors?.shouldNotBeFrozen}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-row flex-wrap gap-x-5">
          <div className="mb-3 flex-none">
            <FormLabel htmlFor="unit-system" title="Unit system *"></FormLabel>
            <FormField>
              <UnitModeDropdown
                name="unit-system"
                className="w-45 flex-2"
                aria-describedby="unit-system-error"
                setSelectedMode={setSelectedUnitMode}
              />
            </FormField>
            <FormErrors
              id="unit-system-error"
              errors={state.fieldErrors?.unitSystem}
            />
          </div>
          <div className="mb-4 flex-none">
            <FormLabel
              htmlFor="mainQuantity"
              title={(() => {
                switch (selectedUnitMode) {
                  case "weight":
                    return "Weight *";
                  case "volume":
                    return "Volume *";
                  case "abstract":
                    return "Amount *";
                  default:
                    return "Amount *";
                }
              })()}
            ></FormLabel>
            <FormField>
              <input
                id="mainQuantity"
                name="mainQuantity"
                type="number"
                min={0.001}
                max={10000}
                step={0.001}
                placeholder="Number"
                className={clsx(
                  "hide-arrows",
                  "peer",
                  "w-30",
                  inputCommonStyles,
                  "rounded-md!",
                  "relative",
                  "top-[-1]",
                  //"focus:invalid:border-[#e75f5f]!",
                  "mb-[-3]",
                )}
                aria-describedby="main-quantity-error"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Number.parseFloat(e.target.value).toString())
                }
                required
              />
            </FormField>
            <FormErrors
              id="main-quantity-error"
              errors={state.fieldErrors?.mainQuantity}
            />
          </div>
          <div className="mb-4 grow">
            <FormLabel
              htmlFor="mainQuantityId"
              title="Weight unit *"
            ></FormLabel>
            <FormField>
              <QuantityUnitsDropdown
                ref={quSelectRef}
                name="mainQuantityId"
                units={units}
                selectedId={selectedWeightUnitId}
                className="w-46"
                mode={selectedUnitMode}
                isSearchable={false}
                aria-describedby="main-quantity-id-error"
                maxMenuHeight={1000}
                required
              />
            </FormField>
            <FormErrors
              id="main-quantity-id-error"
              errors={state.fieldErrors?.mainQuantityId}
            />
          </div>
        </div>

        <div className="flex flex-row gap-5">
          <div className="mb-4 grow">
            <FormLabel
              htmlFor="defaultProductLocationId"
              title="Default product location *"
            ></FormLabel>
            <FormField>
              <LocationDropdown
                name="defaultProductLocationId"
                units={locations}
                className="w-auto flex-2"
                aria-describedby="default-product-location-error"
                optional={false}
                noFreezers={shouldNotBeFrozen}
                required
              />
            </FormField>
            <FormErrors
              id="default-product-location-error"
              errors={state.fieldErrors?.defaultProductLocationId}
            />
          </div>
        </div>

        <div className="flex flex-row flex-wrap gap-x-5">
          <div className="mb-4 flex-none">
            <FormLabel htmlFor="dueDateType" title="Due date type"></FormLabel>
            <FormField>
              <CustomSelect
                name="dueDateType"
                options={[
                  { value: "best-before", label: "Best before" },
                  { value: "expiry-date", label: "Expires at" },
                  { value: "no-expiry", label: "Does not expire" },
                ]}
                className="w-40 flex-none"
                aria-describedby="default-shop-location-error"
                placeholder="Expiry..."
                defaultValue={expiryMode}
                required={true}
                isSearchable={false}
                onChange={(selected) => {
                  if (
                    selected !== undefined &&
                    selected !== null &&
                    selected.value !== undefined
                  ) {
                    setExpiryMode(selected);
                  }
                }}
              />
            </FormField>
            <FormErrors
              id="due-date-type-error"
              errors={state.fieldErrors?.dueDateType}
            />
          </div>

          {expiryMode !== null && expiryMode.value !== "no-expiry" && (
            <>
              <div className="mb-4 flex-none">
                <FormLabel
                  htmlFor="dueOrExpiryDate"
                  title={
                    expiryMode.value === "best-before"
                      ? "Best before *"
                      : "Expires at *"
                  }
                ></FormLabel>
                <FormField>
                  <input
                    type="date"
                    id="dueOrExpiryDate"
                    name="dueOrExpiryDate"
                    defaultValue=""
                    // defaultValue={name}
                    min={dateToISODate(addYears(new Date(), -1))}
                    max={dateToISODate(addYears(new Date(), 10))}
                    required
                    className={clsx(
                      "w-38",
                      inputCommonStyles,
                      "relative",
                      "top-[-1]",
                    )}
                    //className={"w-full peer block w-30 rounded-md py-[6] my-[9.5] px-3 text-base font-bold text-left outline-3 outline-[#bbb] focus:outline-blue-400 placeholder:text-gray-500 border-0! border-transparent"
                    aria-describedby="due-or-expiry-date-error"
                    onChange={(e) => {
                      setExpiryDate(new Date(e.target.valueAsNumber));
                    }}
                  />
                </FormField>
                <FormErrors
                  id="due-or-expiry-date-error"
                  errors={state.fieldErrors?.dueOrExpiryDate}
                />
              </div>
              <div className="mb-4 flex-none">
                <FormLabel
                  htmlFor="packagingDate"
                  title="Packaging date"
                  className="inline"
                >
                  <a
                    className="w-10 cursor-help pl-2"
                    data-tooltip-id="packaging-date-tooltip"
                  >
                    <InformationCircleIcon className="inline size-5 text-slate-300" />
                  </a>
                  <Tooltip id="packaging-date-tooltip" className="info-tooltip">
                    When you set or change both due and
                    <br />
                    packaging date, default due days will
                    <br />
                    be set to the difference between these
                    <br />
                    two dates.
                    <br />
                    <br />
                    The packaging date input has no function
                    <br />
                    other than to calculate this for you.
                  </Tooltip>
                </FormLabel>
                <FormField>
                  <input
                    type="date"
                    id="packagingDate"
                    name="packagingDate"
                    defaultValue=""
                    // defaultValue={name}
                    min={dateToISODate(addYears(new Date(), -1))}
                    max={
                      expiryDate !== null
                        ? dateToISODate(expiryDate)
                        : dateToISODate(addYears(new Date(), 10))
                    }
                    className={clsx(
                      "w-38",
                      inputCommonStyles,
                      "relative",
                      "top-[-1]",
                    )}
                    //className={"w-full peer block w-30 rounded-md py-[6] my-[9.5] px-3 text-base font-bold text-left outline-3 outline-[#bbb] focus:outline-blue-400 placeholder:text-gray-500 border-0! border-transparent"
                    aria-describedby="packaging-date-error"
                    onChange={(e) => {
                      setPackagingDate(new Date(e.target.valueAsNumber));
                    }}
                  />
                </FormField>
                <FormErrors
                  id="packaging-date-error"
                  errors={state.fieldErrors?.packagingDate}
                />
              </div>
            </>
          )}
        </div>

        {expiryMode !== null && expiryMode.value !== "no-expiry" && (
          <div className="flex flex-row flex-wrap gap-5">
            <div className="flex-1">
              <FormLabel
                htmlFor="defaultDueDays"
                className="w-46 text-xs text-wrap"
                title="Default due days *"
              ></FormLabel>
              <FormField>
                <input
                  id="defaultDueDays"
                  name="defaultDueDays"
                  type="number"
                  min={0}
                  max={10000}
                  step={1}
                  placeholder="due days"
                  value={defaultDueDays}
                  onChange={(e) =>
                    setDefaultDueDays(Number.parseInt(e.target.value))
                  }
                  className={clsx(
                    "peer",
                    "w-45",
                    inputCommonStyles,
                    "rounded-md!",
                    "relative",
                    "top-[-1]",
                    //"focus:invalid:border-[#e75f5f]!",
                    "mb-[-3]",
                  )}
                  aria-describedby="default-due-days-error"
                  // onChange={(e) => setQuantity(Number.parseFloat(e.target.value).toString())}
                  required
                />
              </FormField>
              <FormErrors
                id="default-due-days-error"
                errors={state.fieldErrors?.defaultDueDays}
              />
            </div>
            <div className="flex-1">
              <FormLabel
                htmlFor="defaultDueDaysAfterOpen"
                className="w-46 text-xs text-wrap"
                title="Default due days after open "
              ></FormLabel>
              <FormField>
                <input
                  id="defaultDueDaysAfterOpen"
                  name="defaultDueDaysAfterOpen"
                  type="number"
                  min={0}
                  max={10000}
                  step={1}
                  placeholder="days after open"
                  value={defaultDueAfterOpen}
                  onChange={(e) =>
                    setDefaultDueAfterOpen(Number.parseInt(e.target.value))
                  }
                  className={clsx(
                    "peer",
                    "w-45",
                    inputCommonStyles,
                    "rounded-md!",
                    "relative",
                    "top-[-1]",
                    //"focus:invalid:border-[#e75f5f]!",
                    "mb-[-3]",
                  )}
                  aria-describedby="default-due-days-after-open-error"
                  // onChange={(e) => setQuantity(Number.parseFloat(e.target.value).toString())}
                  required
                />
              </FormField>
              <FormErrors
                id="default-due-days-after-open-error"
                errors={state.fieldErrors?.defaultDueDaysAfterOpen}
              />
            </div>

            {!shouldNotBeFrozen && (
              <>
                <div className="flex-1">
                  <FormLabel
                    htmlFor="defaultDueDaysAfterFreezing"
                    className="w-46 text-xs text-wrap"
                    title="Default due days after freezing *"
                  ></FormLabel>
                  <FormField>
                    <input
                      id="defaultDueDaysAfterFreezing"
                      name="defaultDueDaysAfterFreezing"
                      type="number"
                      min={0}
                      max={10000}
                      step={1}
                      placeholder="days after freezing"
                      value={defaultDueAfterFreezing}
                      onChange={(e) =>
                        setDefaultDueAfterFreezing(
                          Number.parseInt(e.target.value),
                        )
                      }
                      className={clsx(
                        "peer",
                        "w-45",
                        inputCommonStyles,
                        "rounded-md!",
                        "relative",
                        "top-[-1]",
                        //"focus:invalid:border-[#e75f5f]!",
                        "mb-[-3]",
                      )}
                      aria-describedby="default-due-days-after-freezing-error"
                      // onChange={(e) => setQuantity(Number.parseFloat(e.target.value).toString())}
                      required
                    />
                  </FormField>
                  <FormErrors
                    id="default-due-days-after-freezing-error"
                    errors={state.fieldErrors?.defaultDueDaysAfterFreezing}
                  />
                </div>
                <div className="flex-1">
                  <FormLabel
                    htmlFor="defaultDueDaysAfterThawing"
                    className="w-46 text-xs text-wrap"
                    title="Default due days after thawing *"
                  ></FormLabel>
                  <FormField>
                    <input
                      id="defaultDueDaysAfterThawing"
                      name="defaultDueDaysAfterThawing"
                      type="number"
                      min={0}
                      max={10000}
                      step={1}
                      placeholder="days after thawing"
                      value={defaultDueAfterThawing}
                      onChange={(e) =>
                        setDefaultDueAfterThawing(
                          Number.parseInt(e.target.value),
                        )
                      }
                      className={clsx(
                        "peer",
                        "w-45",
                        inputCommonStyles,
                        "rounded-md!",
                        "relative",
                        "top-[-1]",
                        //"focus:invalid:border-[#e75f5f]!",
                        "mb-[-3]",
                      )}
                      aria-describedby="default-due-days-after-thawing-error"
                      // onChange={(e) => setQuantity(Number.parseFloat(e.target.value).toString())}
                      required
                    />
                  </FormField>
                  <FormErrors
                    id="default-due-days-after-thawing-error"
                    errors={state.fieldErrors?.defaultDueDaysAfterThawing}
                  />
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex flex-row gap-5">
          <div className="mt-6 flex-none">
            <Button type="submit">Create product</Button>
          </div>
        </div>
      </div>
    </form>
  );
}
