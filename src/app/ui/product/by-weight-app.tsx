"use client";

import React, {
  ChangeEvent,
  ChangeEventHandler,
  use,
  useActionState,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { QuantityUnitsDropdown } from "./quantity-units-dropdown";
import { QuantityUnitCalculation } from "@/app/components/quantity-unit-calculation";
import {
  Product,
  ProductGroup,
  ProductLocation,
  QuantityUnit,
  QuantityUnitConversion,
  ShoppingLocation,
} from "@/interfaces/grocy";
import { QuantityUnitContext } from "@/app/providers/quantity-unit-context";
import { ShoppingLocationContext } from "@/app/providers/shopping-location-context";
import { QuantityUnitConversionContext } from "@/app/providers/quantity-unit-conversion-context";
import {
  createByWeightProduct,
  State,
} from "@/app/lib/create-by-weight-actions";
import { Button } from "../button";
import { ProductContext } from "@/app/providers/product-context";
import { ProductDropdown } from "./product-dropdown";
import { LocationContext } from "@/app/providers/location-context";
import { LocationDropdown } from "./location-dropdown";
import { InformationCircleIcon } from "@heroicons/react/20/solid";
import { Tooltip } from "react-tooltip";
import { addYears, dateToISODate } from "@/app/lib/date";
import clsx from "clsx";
import { Option } from "@/interfaces";
import CustomSelect from "../custom-select";
import { ProductGroupContext } from "@/app/providers/product-group-context";
import { ProductGroupDropdown } from "./product-group-dropdown";

export function ByWeightApp() {
  const [selectedWeightUnitId, setselectedWeightUnitId] = useState<number>(0);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [shouldNotBeFrozen, setShouldNotBeFrozen] = useState<boolean>(false);
  const [canNotOpen, setCanNotOpen] = useState<boolean>(false);
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
    createByWeightProduct,
    initialState,
  );

  const quantityUnitsPromise = useContext(QuantityUnitContext) as Promise<
    QuantityUnit[]
  >;
  const quantityUnitConversionPromise = useContext(
    QuantityUnitConversionContext,
  ) as Promise<QuantityUnitConversion[]>;
  const productsPromise = useContext(ProductContext) as Promise<Product[]>;
  const locationsPromise = useContext(LocationContext) as Promise<
    ProductLocation[]
  >;
  const shoppingLocationsPromise = useContext(
    ShoppingLocationContext,
  ) as Promise<ShoppingLocation[]>;
  const productGroupPromise = useContext(ProductGroupContext) as Promise<
    ProductGroup[]
  >;

  const units = use(quantityUnitsPromise);
  const conversions = use(quantityUnitConversionPromise);
  const products = use(productsPromise);
  const locations = use(locationsPromise);
  const shoppingLocations = use(shoppingLocationsPromise);
  const productGroups = use(productGroupPromise);

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

  return (
    <form
      action={formAction}
      onSubmit={submitHandler}
      noValidate
      className="w-auto pt-3"
    >
      <div className="flex flex-col">
        {/* row: name */}
        <div className="flex flex-row gap-5">
          {/* name */}
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
                className={clsx(
                  "w-full",
                  "pr-3",
                  inputCommonStyles,
                  //"focus:border-[#2684ff]",
                  //"focus:bg-sky-900",
                )}
                aria-describedby="name-error"
                // defaultValue={name}
                // onChange={(e) => setQuantity(Number.parseFloat(e.target.value).toString())}
                required
              />
            </FormField>
            <FormErrors id="name-error" errors={state.fieldErrors?.name} />
          </div>
        </div>

        {/* row: product group */}
        <div className="flex flex-row gap-5">
          {/* name */}
          <div className="mb-4 flex-auto">
            <FormLabel htmlFor="product-group" title="Product group" />
            <FormField>
              <ProductGroupDropdown
                name="productGroup"
                units={productGroups}
                setSelectedId={setselectedWeightUnitId}
                insert={{ value: "0", label: " " }}
                className="w-auto flex-2"
                //                isSearchable={false}
                aria-describedby="product-group-error"
              />
            </FormField>
            <FormErrors
              id="product-group-error"
              errors={state.fieldErrors?.productGroup}
            />
          </div>
        </div>

        {/* row: form driving options */}
        <div className="flex flex-row gap-5">
          {/* should not be frozen */}
          <div className="mb-4 flex-auto">
            <FormLabel htmlFor="" title="Product options"></FormLabel>
            <div className="flex flex-col">
              {/* should not be frozen */}
              <div>
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

              {/* don't check stock */}
              <div>
                <FormField>
                  <FormCheckbox
                    id="noStockCheck"
                    ariaDescribedBy="no-stock-check-error"
                    // @ts -expect-error: Can't find a way to satisfy TS here
                    //onChange={(e: ChangeEvent) => setShouldNotBeFrozen(e.target.checked)}
                  />
                  <label htmlFor="noStockCheck" className="inline w-full">
                    Disable stock fulfillment checking for this
                    ingredient&nbsp;&nbsp;
                    <a
                      className="w-10 cursor-help pl-2"
                      data-tooltip-id="no-stock-check-tooltip"
                    >
                      <InformationCircleIcon className="inline size-5 text-slate-300" />
                    </a>
                    <Tooltip
                      id="no-stock-check-tooltip"
                      className="info-tooltip"
                    >
                      Default setting which is used only when
                      <br />
                      adding this product to a recipe.
                    </Tooltip>
                  </label>
                </FormField>
                <FormErrors
                  id="no-stock-check-error"
                  errors={state.fieldErrors?.noStockCheck}
                />
              </div>
              {/* can't be opened */}
              <div>
                <FormField>
                  <FormCheckbox
                    id="canNotOpen"
                    ariaDescribedBy="can-not-open-error"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setCanNotOpen(e.target.checked)
                    }
                  />
                  <label htmlFor="canNotOpen">
                    Product can&apos;t be opened
                  </label>
                </FormField>
                <FormErrors
                  id="can-not-open-error"
                  errors={state.fieldErrors?.canNotOpen}
                />
              </div>
              {/* move on open */}
              <div className={canNotOpen ? "hidden" : ""}>
                <FormField>
                  <FormCheckbox
                    id="moveOnOpen"
                    ariaDescribedBy="move-on-open-error"
                    // @ts -expect-error: Can't find a way to satisfy TS here
                    //onChange={(e: ChangeEvent) => setShouldNotBeFrozen(e.target.checked)}
                  />
                  <label htmlFor="moveOnOpen">
                    Move stock to &quot;consume first from&quot; location when
                    opening
                  </label>
                </FormField>
                <FormErrors
                  id="move-on-open-error"
                  errors={state.fieldErrors?.moveOnOpen}
                />
              </div>
              {/* hide from stock overview */}
              <div>
                <FormField>
                  <FormCheckbox
                    id="hideFromStock"
                    ariaDescribedBy="hide-from-stock-error"
                    // @ts -expect-error: Can't find a way to satisfy TS here
                    //onChange={(e: ChangeEvent) => setShouldNotBeFrozen(e.target.checked)}
                  />
                  <label htmlFor="hideFromStock">
                    Never show on the stock overview
                  </label>
                </FormField>
                <FormErrors
                  id="hide-from-stock-error"
                  errors={state.fieldErrors?.hideFromStock}
                />
              </div>
            </div>
          </div>
        </div>

        {/* row: weight + weight quantity unit */}
        <div className="flex flex-row gap-5">
          {/* weight quantity amount */}
          <div className="mb-4 flex-none">
            <FormLabel htmlFor="mainQuantity" title="Weight *"></FormLabel>
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
                defaultValue={quantity}
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

          {/* weight quantity unit */}
          <div className="mb-4 grow">
            <FormLabel
              htmlFor="mainQuantityId"
              title="Weight unit *"
            ></FormLabel>
            <FormField>
              <QuantityUnitsDropdown
                name="mainQuantityId"
                units={units}
                selectedId={selectedWeightUnitId}
                setSelectedId={setselectedWeightUnitId}
                setSelectedGroup={setSelectedGroup}
                className="w-auto flex-2"
                mode="weight"
                isSearchable={false}
                aria-describedby="main-quantity-id-error"
                required
              />
            </FormField>
            <FormErrors
              id="main-quantity-id-error"
              errors={state.fieldErrors?.mainQuantityId}
            />
          </div>

          {/* configured conversions preview */}
          <div className="mb-4 hidden flex-auto md:block">
            <label className={"mb-2 block text-sm font-medium text-slate-400"}>
              Configured unit conversion preview
            </label>
            <FormField>
              <QuantityUnitCalculation
                units={units}
                conversions={conversions}
                selectedUnit={selectedWeightUnitId}
                selectedGroup={selectedGroup}
                quantity={Number.parseFloat(quantity)}
                className="flex-2 pt-1.5 text-lg"
              />
            </FormField>
            <div
              id="configured-conversions-error"
              aria-live="polite"
              aria-atomic="true"
            ></div>
          </div>
        </div>

        {/* row: parent product */}
        <div className="flex flex-row gap-5">
          {/* parent product dropdown */}
          <div className="mb-4 grow">
            <FormLabel
              htmlFor="parentProductId"
              title="Optional parent product"
            ></FormLabel>
            <FormField>
              <ProductDropdown
                name="parentProductId"
                units={products}
                className="w-auto flex-2"
                aria-describedby="parent-product-id-error"
                optional={true}
                insert={{ value: "0", label: "[no parent product] " }}
              />
            </FormField>
            <FormErrors
              id="parent-product-id-error"
              errors={state.fieldErrors?.parentProductId}
            />
          </div>
        </div>

        {/* row: default location*/}
        <div className="flex flex-row gap-5">
          {/* default location dropdown */}
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

        {/* row: consume location */}
        <div className="flex flex-row gap-5">
          {/* consume location dropdown */}
          <div className="mb-4 grow">
            <FormLabel
              htmlFor="defaultConsumeLocationId"
              title='Default "consume first from" location'
            >
              <a
                className="w-10 cursor-help pl-2"
                data-tooltip-id="consume-location-tooltip"
              >
                <InformationCircleIcon className="inline size-5 text-slate-300" />
              </a>
              <Tooltip id="consume-location-tooltip" className="info-tooltip">
                Stock located in the &quot;consume first from&quot;
                <br />
                location is consumed first if no{" "}
                <em>
                  specific
                  <br />
                  stock
                </em>{" "}
                is being consumed.
              </Tooltip>
            </FormLabel>
            <FormField>
              <LocationDropdown
                name="defaultConsumeLocationId"
                units={locations}
                className="w-auto flex-2"
                aria-describedby="default-consume-location-error"
                placeholder="Stock is first taken from..."
                optional={true}
                insert={{ value: "0", label: " " }}
                noFreezers={shouldNotBeFrozen}
              />
            </FormField>
            <FormErrors
              id="default-consume-location-error"
              errors={state.fieldErrors?.defaultConsumeLocationId}
            />
          </div>
        </div>

        {/* row: default shop location */}
        <div className="flex flex-row gap-5">
          {/* default shop location dropdown */}
          <div className="mb-4 grow">
            <FormLabel
              htmlFor="defaultShopLocationId"
              title="Default shop"
            ></FormLabel>
            <FormField>
              <LocationDropdown
                name="defaultShopLocationId"
                units={shoppingLocations}
                className="w-auto flex-2"
                aria-describedby="default-shop-location-error"
                placeholder="Normally purchased from..."
                optional={false}
                insert={{ value: "0", label: " " }}
              />
            </FormField>
            <FormErrors
              id="default-shop-location-error"
              errors={state.fieldErrors?.defaultShopLocationId}
            />
          </div>
        </div>

        {/* row: due/expiry date mode */}
        <div className="flex flex-row gap-5">
          {/* due date type */}
          <div className="mb-4 flex-none">
            <FormLabel htmlFor="dueDateType" title="Due date type"></FormLabel>
            <FormField>
              {/* <div className="flex flex-shrink gap-5">
                <FormRadiobutton id="best-before" name="dueDateType" defaultValue="best-before">
                  Best before
                </FormRadiobutton>                
                <FormRadiobutton id="expiry-date" name="dueDateType" defaultValue="expiry-date">
                  Expiry date
                </FormRadiobutton>
              </div> */}
              <CustomSelect
                name="dueDateType"
                options={[
                  { value: "best-before", label: "Best before" },
                  { value: "expiry-date", label: "Expires at" },
                  { value: "no-expiry", label: "Does not expire" },
                ]}
                className="w-46 flex-none"
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
        </div>

        {/* row: due/expiry and packaging date */}
        {expiryMode !== null && expiryMode.value !== "no-expiry" && (
          <div className="flex flex-row gap-5">
            {/* due date / expiry date */}
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
            {/* packaging date */}
            <div className="mb-4 flex-none">
              <FormLabel htmlFor="packagingDate" title="Packaging date">
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
                  aria-describedby="packging-date-error"
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
          </div>
        )}

        {/* row: due days */}
        {expiryMode !== null && expiryMode.value !== "no-expiry" && (
          <div className="flex flex-col flex-wrap gap-x-5">
            <div className="flex flex-auto flex-row gap-5">
              {/* default due days */}
              <div className="flex-auto basis-1/2">
                <FormLabel
                  htmlFor="defaultDueDays"
                  className="w-full text-xs text-wrap"
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
                      "w-full",
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
              {/* default due days after opened */}
              <div className="flex-auto basis-1/2">
                <FormLabel
                  htmlFor="defaultDueDaysAfterOpen"
                  className="w-26 text-xs text-wrap"
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
                      "w-full",
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
            </div>

            {!shouldNotBeFrozen && (
              <div className="flex grow flex-row gap-5">
                {/* default due days after freezing */}
                <div className="flex-auto basis-1/2">
                  <FormLabel
                    htmlFor="defaultDueDaysAfterFreezing"
                    className="w-26 text-xs text-wrap"
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
                        "w-full",
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
                {/* default due days after thawing */}
                <div className="flex-auto basis-1/2">
                  <FormLabel
                    htmlFor="defaultDueDaysAfterThawing"
                    className="w-26 text-xs text-wrap"
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
                        "w-full",
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
              </div>
            )}
          </div>
        )}

        {/* row: form actions */}
        <div className="flex flex-row gap-5">
          {/* submit and cancel */}
          <div className="mt-6 flex-none">
            {/* -justify-end gap-4" */}
            {/* <Link
          href="/dashboard/invoices"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link> */}
            <Button type="submit">Create product</Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function FormLabel({
  htmlFor,
  className = "text-sm",
  children,
  title,
}: {
  htmlFor: string;
  className?: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <span className="inline-flex">
      <label
        htmlFor={htmlFor}
        className={`mb-2 block text-sm font-medium text-slate-400 ${className}`}
      >
        {title}
      </label>
      {children && <>&nbsp;&nbsp;{children}</>}
    </span>
  );
}
function FormField({ children }: { children: React.ReactNode }) {
  return (
    <div className={`relative mt-2 rounded-md`}>
      <div className="${className} relative">{children}</div>
    </div>
  );
}

function FormCheckbox({
  id,
  ariaDescribedBy,
  onChange,
}: {
  id: string;
  ariaDescribedBy: string;
  onChange?: ChangeEventHandler;
}): React.ReactNode {
  return (
    <input
      id={id}
      name={id}
      type="checkbox"
      // className="peer block w-30 rounded-md my-[9.5] py-[6] px-2 border-3 border-[#cccccc] text-base font-bold outline-3 outline-[#cecece] focus:outline-blue-400 placeholder:text-gray-500 border-0! border-transparent"
      className="mr-3"
      aria-describedby={ariaDescribedBy}
      defaultValue="true"
      onChange={onChange}
    />
  );
}

function FormErrors({
  id,
  errors,
}: {
  id: string;
  errors: string[] | undefined;
}) {
  if (errors === undefined) {
    return <></>;
  }
  return (
    <div id={id} aria-live="polite" aria-atomic="true">
      {errors &&
        errors?.map((error: string) => (
          <p className="mt-2 text-sm text-red-500" key={error}>
            {error}
          </p>
        ))}
    </div>
  );
}
