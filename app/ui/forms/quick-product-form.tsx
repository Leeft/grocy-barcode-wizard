"use client";

import {
  ChangeEvent,
  use,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
} from "react";
import { QuantityUnitsDropdown } from "../product/quantity-units-dropdown";
import { ProductLocation, QuantityUnit } from "@/interfaces/grocy";
import { QuantityUnitContext } from "@/providers/quantity-unit-context";
import { quickProductFormSubmit } from "@/forms/quick-product-form-submit";
import { QuickProductFormSchema } from "@/forms/quick-product-form-schema";
import { Button } from "../button";
import { LocationContext } from "@/providers/location-context";
import { LocationDropdown } from "../product/location-dropdown";
import { InformationCircleIcon } from "@heroicons/react/20/solid";
import { Tooltip } from "react-tooltip";
import { addYears, dateToISODate } from "@/lib/date";
import { ModeType, Option } from "@/interfaces";
import CustomSelect, { CustomSelectHandle } from "../custom-select";
import { FormLabel } from "./inputs/form-label";
import { FormField } from "./inputs/form-field";
import { FormErrors } from "./inputs/form-errors";
import { FormCheckbox } from "./inputs/form-checkbox";
import { UnitModeDropdown } from "../product/unit-mode-dropdown";
import { CameraApp } from "../camera-app";
import clsx from "clsx";
import Barcode from "@/lib/barcode";
import { useFormState } from "react-dom";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";

export function QuickProductForm({ barcode }: { barcode: Barcode }) {
  const [lastResult, action, submitPending] = useFormState(
    quickProductFormSubmit,
    undefined,
  );
  
  const [form, fields] = useForm({
    // Sync the result of last submission
    lastResult,

    // Reuse the validation logic on the client
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: QuickProductFormSchema });
    },

    // Validate the form on blur event triggered
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const [quantity, setQuantity] = useState<string>("");
  const [shouldNotBeFrozen, setShouldNotBeFrozen] = useState<boolean>(false);
  const [expiryMode, setExpiryMode] = useState<Option | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [packagingDate, setPackagingDate] = useState<Date | null>(null);
  const [defaultDueDays, setDefaultDueDays] = useState<number>(0);
  const [defaultDueAfterOpen, setDefaultDueAfterOpen] = useState<number>(0);
  const quSelectRef = useRef<CustomSelectHandle>(null);

  const [defaultDueAfterFreezing, setDefaultDueAfterFreezing] =
    useState<number>(0);

  const [defaultDueAfterThawing, setDefaultDueAfterThawing] =
    useState<number>(0);

  const [selectedWeightUnitId, setSelectedWeightUnitId] = useState<
    number | null
  >(null);

  const [selectedUnitMode, setSelectedUnitMode] = useState<
    ModeType | undefined
  >(undefined);

  const units = use(useContext(QuantityUnitContext) as Promise<QuantityUnit[]>);
  const locations = use(
    useContext(LocationContext) as Promise<ProductLocation[]>,
  );

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

  const calculateDueDays = useCallback(() => {
    if (expiryDate === null) return;
    if (packagingDate === null) return;
    setDefaultDueDays(
      Math.abs(
        Math.round(
          (packagingDate.getTime() - expiryDate.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      ),
    );
  }, [expiryDate, packagingDate]);

  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;
    if (e.key === "Enter" && target.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  // Clear unit selection dropdown and amount input when the unit type is changed
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedWeightUnitId(null);
    setQuantity(selectedUnitMode === "abstract" ? "1.0" : "");
    quSelectRef.current?.clear();
  }, [selectedUnitMode]);

  // Set the due days when a packing date and due/expiry dates are set
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    calculateDueDays();
  }, [expiryDate, packagingDate, calculateDueDays]);

  return (
    <form
      id={form.id}
      onSubmit={form.onSubmit}
      action={action}
      noValidate
      onKeyDown={handleKeyDown}
      className="pb-25"
    >
      <input name="barcode" type="hidden" value={barcode.barcode} />
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
              This form captures the essentials for a product quickly
              <br />
              while you have the product at hand, only queueing it to be
              <br />
              completed and added to Grocy when your products are
              <br />
              safely back under refrigeration or freezing conditions.
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-row gap-5">
          <div className="mb-4 flex-auto">
            <FormLabel htmlFor={fields.name.name} title="Product name *" />
            <FormField>
              <input
                id={fields.name.name}
                type="text"
                key={fields.name.key}
                name={fields.name.name}
                defaultValue={fields.name.initialValue}
                minLength={2}
                maxLength={64}
                placeholder="Name of the product to create, 2 to 64 characters long"
                className={clsx("w-full", "pr-3", inputCommonStyles)}
                aria-describedby="name-error"
                required
              />
            </FormField>
            <FormErrors id="name-error" errors={fields.name.errors} />
          </div>
        </div>

        <div className="flex flex-row gap-5">
          <div className="mb-4 flex-auto">
            <div className="flex flex-col">
              <FormField>
                <FormCheckbox
                  id={fields.shouldNotBeFrozen.name}
                  ariaDescribedBy="should-not-be-frozen-error"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setShouldNotBeFrozen(e.target.checked)
                  }
                  checked={fields.shouldNotBeFrozen.initialValue ? true : false}
                />
                <label htmlFor={fields.shouldNotBeFrozen.name}>
                  This product should not be frozen
                  <a
                    className="relative top-[-3] inline-block w-10 cursor-help pl-3"
                    data-tooltip-id="not-frozen-tooltip"
                  >
                    &nbsp;
                    <InformationCircleIcon className="inline size-5 text-slate-300" />
                  </a>
                  <Tooltip id="not-frozen-tooltip" className="info-tooltip">
                    Checking this checkbox will hide some options from you,
                    <br />
                    making it a bit easier to fill out this form.
                    <br />
                    <br />
                    Note that the dropdowns may have entries that are disabled
                    <br />
                    by activating this so if you don&apos;t fill out the form in
                    order you
                    <br />
                    may need to correct the choices after.
                  </Tooltip>
                </label>
              </FormField>
              <FormErrors
                id="should-not-be-frozen-error"
                errors={fields.shouldNotBeFrozen.errors}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-row flex-wrap gap-x-5">
          <div className="mb-3 flex-none">
            <FormLabel
              htmlFor="unitSystem"
              title="Unit system *"
              className="inline"
            >
              <a
                className="relative top-[-5] inline-block w-10 cursor-help"
                data-tooltip-id="weight-mode-tooltip"
              >
                &nbsp;
                <InformationCircleIcon className="inline size-5 text-slate-300" />
              </a>
              <Tooltip id="weight-mode-tooltip" className="info-tooltip">
                For the units specify the discrete weight, volume or more
                <br />
                abstract unit you buy this product at. E.g. if you buy it in
                <br />
                a 450g package, specify just that. Or your bell peppers might
                <br />
                come in a bag of 3 without listing the weight, so you specify
                <br />
                "1 bag" as the abstract unit here. We will refine the details
                <br />
                when submitting the data to Grocy.
              </Tooltip>
            </FormLabel>
            <FormField>
              <UnitModeDropdown
                name="unitSystem"
                className="w-45 flex-2"
                aria-describedby="unit-system-error"
                setSelectedMode={setSelectedUnitMode}
              />
            </FormField>
            <FormErrors
              id="unit-system-error"
              errors={fields.unitSystem.errors}
            />
          </div>
          <div className="mb-4 flex-none">
            <FormLabel
              htmlFor={fields.mainQuantity.name}
              title={(() => {
                switch (selectedUnitMode) {
                  case "weight":
                    return "Weight *";
                  case "volume":
                    return "Volume *";
                  case "abstract":
                    return "Unit Amount *";
                  default:
                    return "Amount *";
                }
              })()}
            ></FormLabel>
            <FormField>
              <input
                id={fields.mainQuantity.name}
                name={fields.mainQuantity.name}
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
              errors={fields.mainQuantity.errors}
            />
          </div>
          <div className="mb-4 grow">
            <FormLabel
              htmlFor={fields.mainQuantityUnitId.name}
              title={(() => {
                switch (selectedUnitMode) {
                  case "weight":
                    return "Weight unit *";
                  case "volume":
                    return "Volume unit *";
                  case "abstract":
                    return "Abstract/discrete unit *";
                  default:
                    return "Unit *";
                }
              })()}
            ></FormLabel>
            <FormField>
              <QuantityUnitsDropdown
                ref={quSelectRef}
                name={fields.mainQuantityUnitId.name}
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
              errors={fields.mainQuantityUnitId.errors}
            />
          </div>
        </div>

        <div className="flex flex-row gap-5">
          <div className="mb-4 grow">
            <FormLabel
              htmlFor={fields.defaultProductLocationId.name}
              title="Initial product location *"
            ></FormLabel>
            <FormField>
              <LocationDropdown
                key={fields.defaultProductLocationId.key}
                name={fields.defaultProductLocationId.name}
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
              errors={fields.defaultProductLocationId.errors}
            />
          </div>
        </div>

        <div className="flex flex-row flex-wrap gap-x-5">
          <div className="mb-4 flex-none">
            <FormLabel
              htmlFor={fields.dueDateType.name}
              title="Due date type"
            ></FormLabel>
            <FormField>
              <CustomSelect
                name={fields.dueDateType.name}
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
              errors={fields.dueDateType.errors}
            />
          </div>

          {expiryMode !== null && expiryMode.value !== "no-expiry" && (
            <>
              <div className="mb-4 flex-none">
                <FormLabel
                  htmlFor={fields.dueOrExpiryDate.name}
                  title={
                    expiryMode.value === "best-before"
                      ? "Best before *"
                      : "Expires at *"
                  }
                ></FormLabel>
                <FormField>
                  <input
                    type="date"
                    id={fields.dueOrExpiryDate.name}
                    name={fields.dueOrExpiryDate.name}
                    defaultValue={fields.dueOrExpiryDate.initialValue}
                    min={dateToISODate(addYears(new Date(), -1))}
                    max={dateToISODate(addYears(new Date(), 10))}
                    required
                    className={clsx(
                      "w-38",
                      inputCommonStyles,
                      "relative",
                      "top-[-1]",
                    )}
                    aria-describedby="due-or-expiry-date-error"
                    onChange={(e) => {
                      setExpiryDate(new Date(e.target.valueAsNumber));
                    }}
                  />
                </FormField>
                <FormErrors
                  id="due-or-expiry-date-error"
                  errors={fields.dueOrExpiryDate.errors}
                />
              </div>
              <div className="mb-4 flex-none">
                <FormLabel
                  htmlFor={fields.packagingDate.name}
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
                    id={fields.packagingDate.name}
                    name={fields.packagingDate.name}
                    defaultValue={fields.packagingDate.initialValue}
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
                  errors={fields.packagingDate.errors}
                />
              </div>
            </>
          )}
        </div>

        {expiryMode !== null && expiryMode.value !== "no-expiry" && (
          <div className="mb-5 flex flex-row flex-wrap gap-5">
            <div className="flex-1">
              <FormLabel
                htmlFor={fields.defaultDueDays.name}
                className="w-46 text-xs text-wrap"
                title="Default due days *"
              ></FormLabel>
              <FormField>
                <input
                  id={fields.defaultDueDays.name}
                  name={fields.defaultDueDays.name}
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
                errors={fields.defaultDueDays.errors}
              />
            </div>
            <div className="flex-1">
              <FormLabel
                htmlFor={fields.defaultDueDaysAfterOpen.name}
                className="w-46 text-xs text-wrap"
                title="Default due days after open "
              ></FormLabel>
              <FormField>
                <input
                  id={fields.defaultDueDaysAfterOpen.name}
                  name={fields.defaultDueDaysAfterOpen.name}
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
                  required
                />
              </FormField>
              <FormErrors
                id="default-due-days-after-open-error"
                errors={fields.defaultDueDaysAfterOpen.errors}
              />
            </div>

            {!shouldNotBeFrozen && (
              <>
                <div className="flex-1">
                  <FormLabel
                    htmlFor={fields.defaultDueDaysAfterFreezing.name}
                    className="w-46 text-xs text-wrap"
                    title="Default due days after freezing *"
                  ></FormLabel>
                  <FormField>
                    <input
                      id={fields.defaultDueDaysAfterFreezing.name}
                      name={fields.defaultDueDaysAfterFreezing.name}
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
                      required
                    />
                  </FormField>
                  <FormErrors
                    id="default-due-days-after-freezing-error"
                    errors={fields.defaultDueDaysAfterFreezing.errors}
                  />
                </div>
                <div className="flex-1">
                  <FormLabel
                    htmlFor={fields.defaultDueDaysAfterThawing.name}
                    className="w-46 text-xs text-wrap"
                    title="Default due days after thawing *"
                  ></FormLabel>
                  <FormField>
                    <input
                      id={fields.defaultDueDaysAfterThawing.name}
                      name={fields.defaultDueDaysAfterThawing.name}
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
                    errors={fields.defaultDueDaysAfterThawing.errors}
                  />
                </div>
              </>
            )}
          </div>
        )}

        <CameraApp />

        <div className="flex flex-row gap-5">
          <div className="mt-6 flex-none">
            <Button type="submit" disabled={submitPending}>
              Create product
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
