"use client";

import { Product, ProductLocation, StockEntry } from "@/interfaces/grocy";
import { LocationDropdown } from "../product/location-dropdown";
import { FoldVertical, MoveRight, PackageOpen, Tally1, Trash2, UnfoldVertical, X } from "lucide-react";
import {
  ConsumeOneOfStockEntryButton,
  ConsumeSpoiledStockEntryButton,
  ConsumeStockEntryButton,
  OpenStockEntryButton,
  TransferStockEntryButton,
} from "@/ui/forms/stock-buttons";
import { use, useContext, useState } from "react";
import { GrocyProductContext } from "@/providers/grocy-product-context";
import { LocationContext } from "@/providers/location-context";
import { ProductStockContext } from "@/providers/product-stock-context";
import { StockEntrySummary } from "../stock-entry-summary";
import { clsx } from "clsx";

export function StockOverview({ code }: { code: string }) {
  const stock = use(useContext(ProductStockContext) as Promise<StockEntry[]>);
  const product = use(useContext(GrocyProductContext) as Promise<Product>);

  if (stock === undefined || product.active === 0) return <></>;

  return (
    <>
      <div className="flex flex-col gap-y-3 pb-10">
        <h1 className="text-1xl mt-4 mb-1 pl-4 font-bold text-slate-200 uppercase">
          Quick inventory management
        </h1>
        {stock.map((se: StockEntry) => (
          <StockEntryRow key={`stock-entry-row-${se.id}`} barcode={code} se={se} product={product} />
        ))}
        {stock.length === 0 && (
          <h2 className="text-out-of-stock">This product is currently out of stock. Purchase some more.</h2>
        )}
      </div>
    </>
  );
}

function StockEntryRow({ barcode, se, product }: { barcode: string; se: StockEntry; product: Product }) {
  const locations = use(useContext(LocationContext) as Promise<ProductLocation[]>);

  //const [showTransferOptions, setShowTransferOptions] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState<boolean>(true);

  return (
    <form>
      <fieldset
        key={`stock_${se.id}`}
        className="border-stock-buttons-border mb-2 rounded-2xl border border-dashed p-2 tracking-[0.9]"
      >
        <legend className="ml-3 inline-flex px-3 text-slate-300">
          <button
            className={clsx(
              "border-form-input-border/20",
              collapsed ? "focus:border-form-focused" : "focus:border-form-focused/50",
              "static",
              "inline-flex",
              "cursor-pointer",
              "rounded-lg",
              "border-2",
              "border-dotted",
              "p-2",
              "outline-0",
              "focus:border-2",
              "focus:border-solid",
            )}
            onClick={(e) => {
              setCollapsed(!collapsed);
              e.preventDefault();
            }}
          >
            {!collapsed ? (
              <FoldVertical className="text-form-close-fold mt-0 mr-2 ml-0 size-7" />
            ) : (
              <UnfoldVertical className="text-form-open-fold mt-0 mr-2 ml-0 size-7" />
            )}{" "}
            <StockEntrySummary product={product} se={se} className="text-left leading-6" />
          </button>
        </legend>
        {!collapsed ? (
          <div className="divide-stock-buttons-border/60 flex flex-col gap-y-2 divide-y-2 divide-dotted">
            <div className="mx-3 flex flex-row flex-wrap gap-x-3 gap-y-2 py-3 pb-5 text-slate-300">
              <input type="hidden" name="productId" value={se.product_id} />
              <input type="hidden" name="stockId" value={se.stock_id} />
              <input type="hidden" name="stockAmount" value={se.amount} />
              <input type="hidden" name="barcode" value={barcode} />
              <input type="hidden" name="fromLocationId" value={se.location_id} />
              <input type="hidden" name="transferAmount" value={se.amount} />

              <OpenStockEntryButton
                disabled={se.open || product.disable_open ? true : false}
                title={`Open one unit of stock entry ${se.stock_id}`}
              >
                <PackageOpen className="mt-0.5 mr-2 size-5" /> Open one
              </OpenStockEntryButton>

              <ConsumeOneOfStockEntryButton title={`Consume 1 unit of this stock entry ${se.stock_id}`}>
                <Tally1 className="mt-0.5 mr-0 ml-1 size-5" /> Consume one
              </ConsumeOneOfStockEntryButton>

              <ConsumeStockEntryButton title={`Consume all of this stock entry ${se.stock_id}`}>
                <X className="mt-0.5 mr-2 size-5" /> Consume all
              </ConsumeStockEntryButton>

              <ConsumeSpoiledStockEntryButton
                title={`Consume all of this stock entry ${se.stock_id} as spoiled`}
              >
                <Trash2 className="mt-0.5 mr-2 size-5" /> Spoiled
              </ConsumeSpoiledStockEntryButton>

              {/* <button
                        type="button"
                        title={`Inventory (add or remove) stock entry ${se.stock_id}`}
                        className="mt-2 inline-flex cursor-pointer rounded-md border bg-slate-700 p-1 px-2"
                      >
                        Inventory <ChevronUp size={24} />
                      </button> */}
            </div>
            <div className="mx-3 mt-2 flex flex-row flex-wrap gap-x-2 gap-y-1 pt-2 pb-3 text-slate-300">
              <LocationDropdown
                name="toLocationId"
                units={locations}
                className="border-transfer! bg-transfer/10 text-transfer border-1.5! h-6! w-50 text-sm/4 tracking-[0.8] md:w-68"
                noFreezers={product.should_not_be_frozen ? true : false}
                firstOptionTitle="Transfer to ..."
                disableOption={se.location_id?.toString()}
              />
              <TransferStockEntryButton
                disabled={product.enable_tare_weight_handling ? true : false}
                title={`Transfer stock entry ${se.stock_id}`}
              >
                <MoveRight className="mt-0.5 mr-2 size-5" /> Transfer
              </TransferStockEntryButton>
            </div>
          </div>
        ) : (
          <div className="min-h-3 pl-3 opacity-50">. . . . . . . . . . . . . . . </div>
        )}
      </fieldset>
    </form>
  );
}
