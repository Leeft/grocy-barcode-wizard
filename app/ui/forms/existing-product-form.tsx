import { Product, StockEntry } from "@/interfaces/grocy";
import {
  baseUrl,
  fetchLocations,
  fetchProductDetails,
  fetchProductGroups,
  fetchProducts,
  fetchQuantityUnits,
  fetchShoppingLocations,
  grocyClient,
} from "@/lib/grocy";
import { pluralUnit, toLookup } from "@/lib/utils";
import { Suspense } from "react";
import {
  ConsumeOneOfStockEntryButton,
  ConsumeSpoiledStockEntryButton,
  ConsumeStockEntryButton,
  OpenStockEntryButton,
  TransferStockEntryButton,
} from "./stock-buttons";
import { LocationDropdown } from "../product/location-dropdown";
import { MoveRight, PackageOpen, Tally1, Trash2, X } from "lucide-react";
import ActionShortcuts from "../barcode/action-shortcuts";

export async function ExistingProductForm({
  product,
  barcode,
  showShortcuts = false,
  showStock = false,
}: {
  product: Product;
  barcode: string;
  showShortcuts?: boolean;
  showStock?: boolean;
}) {
  return (
    <div className="text-left">
      <Suspense fallback={<ExistingProductInfoPlaceholder />}>
        <ExistingProductInfo product={product} />

        {showShortcuts && product.active === 1 && (
          <div className="pt-5">
            <h1 className="text-1xl my-4 font-bold uppercase">Product actions</h1>
            <ActionShortcuts barcode={barcode} />
          </div>
        )}

        {showStock && product.active === 1 && <ShowStock barcode={barcode} product={product} />}
      </Suspense>
    </div>
  );
}

export function ExistingProductInfoPlaceholder() {
  return (
    <>
      <dl className="product-info">
        <dt>Name</dt>
        <dd>...</dd>
        <dt>Product group</dt>
        <dd>...</dd>
        <dt>Parent product</dt>
        <dd>...</dd>
        <dt>Active</dt>
        <dd>...</dd>
        <dt>May be frozen</dt>
        <dd>...</dd>
        <dt>Barcodes</dt>
        <dd>...</dd>
        <dt>Last shop</dt>
        <dd>...</dd>
      </dl>
    </>
  );
}

function dueTypeToString(dueType: number, bestBeforeDays: number): string {
  let dueTypeString = "Best before";
  if (dueType === 2) {
    dueTypeString = "Expiration";
  }
  if (bestBeforeDays === -1) {
    dueTypeString = "No expiry";
  }
  return dueTypeString;
}

export async function ExistingProductInfo({
  product,
}: {
  product: Product;
}) {
  if (product === undefined || product.id === undefined) return <></>;

  const units = toLookup(await fetchQuantityUnits());
  const shopLocations = toLookup(await fetchShoppingLocations());
  const productGroups = toLookup(await fetchProductGroups());
  const products = toLookup(await fetchProducts());

  const productDetails = await fetchProductDetails(product.id);

  const parentProductName =
    product.parent_product_id !== undefined && products[product.parent_product_id] !== undefined
      ? products[product.parent_product_id]!.name
      : "-";

  const productGroupName =
    product.product_group_id !== undefined && productGroups[product.product_group_id] !== undefined
      ? productGroups[product.product_group_id]!.name
      : "-";

  const check = (val: boolean) => val ? (<span className="text-green-300">✓</span>) : (<span className="text-red-300">✗</span>);

  return (
    <>
      {product.picture_file_name !== null && product.picture_file_name && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="my-5 max-w-full rounded-xl md:max-h-100 md:max-w-100"
          alt="Photo of the product"
          src={baseUrl + "/files/productpictures/" + btoa(product.picture_file_name)}
        />
      )}
      <dl className="product-info">
        <dt>Name</dt>
        <dd>{product.name}</dd>
        <dt>Product group</dt>
        <dd>{productGroupName}</dd>
        <dt>Parent product</dt>
        <dd>{parentProductName}</dd>
        <dt>Active</dt>
        <dd>{check(product.active === 1)}</dd>
        <dt>May be frozen</dt>
        <dd>{check(product.should_not_be_frozen === 0)}</dd>
        <dt>Barcodes</dt>
        <dd>
          {productDetails.product_barcodes?.map((bc) => (
            <div key={bc.barcode} className="w-full">
              <code>{bc.barcode}</code> :{" "}
              {bc.qu_id
                ? (bc.amount ? bc.amount : "__") +
                  ` ` +
                  pluralUnit(units[bc.qu_id], bc.amount) +
                  (bc.shopping_location_id
                    ? ", purchased at " + shopLocations[bc.shopping_location_id]!.name
                    : "") +
                  (bc.last_price ? ` for last price: ${bc.last_price}` : ``)
                : "-"}
            </div>
          ))}
        </dd>
        <dt>Last shop</dt>
        <dd>
          {productDetails.last_shopping_location_id
            ? shopLocations[productDetails.last_shopping_location_id]!.name
            : "-"}
        </dd>
      </dl>
    </>
  );
}

async function ShowStock({ barcode, product }: { barcode: string; product: Product }) {
  const { data: stock /* error: stockError  */ } = await grocyClient.GET(
    "/stock/products/{productId}/entries",
    {
      params: {
        path: { productId: product.id! },
        query: { include_sub_products: true },
      },
    },
  );

  if (stock === undefined) return <></>;

  <ActionShortcuts barcode={barcode} />;
  return (
    <>
      <div className="flex flex-col gap-y-3">
        <h1 className="text-1xl mt-4 mb-1 font-bold uppercase">Stock overview</h1>
        {stock.map((se: StockEntry) => (
          <StockEntryRow key={`stock-entry-row-${se.id}`} barcode={barcode} se={se} product={product} />
        ))}
        {stock.length === 0 && (
          <h2 className="text-amber-500">
            This product is currently out of stock. Purchase some more.
          </h2>
        )}
      </div>
    </>
  );
}

async function StockEntryRow({
  barcode,
  se,
  product,
}: {
  barcode: string;
  se: StockEntry;
  product: Product;
}) {
  const locations = await fetchLocations();

  //const [showTransferOptions, setShowTransferOptions] = useState<boolean>(false);

  return (
    <form>
      <fieldset
        key={`stock_${se.id}`}
        className="mb-2 rounded-2xl border border-dashed border-yellow-300 p-2 tracking-[0.9]"
      >
        <legend className="ml-3 px-3 text-slate-300">
          <DisplayStockActionButtons product={product} se={se} />
        </legend>
        <div className="flex flex-col gap-y-2 divide-y-2 divide-dotted divide-slate-600">
          <div className="mx-3 flex flex-row flex-wrap gap-x-3 gap-y-2 py-3 text-slate-300">
            <input type="hidden" name="productId" value={se.product_id} />
            <input type="hidden" name="stockId" value={se.stock_id} />
            <input type="hidden" name="stockAmount" value={se.amount} />
            <input type="hidden" name="barcode" value={barcode} />
            <input type="hidden" name="fromLocationId" value={se.location_id} />
            <input type="hidden" name="transferAmount" value={se.amount} />

            <OpenStockEntryButton
              disabled={se.open || product.disable_open ? true : false}
              title={`Open stock entry ${se.stock_id}`}
            >
              <PackageOpen className="mr-2 size-5" /> Open
            </OpenStockEntryButton>

            <ConsumeOneOfStockEntryButton title={`Consume all of this stock entry ${se.stock_id}`}>
              <Tally1 className="mr-0 ml-1 size-5" /> Consume one
            </ConsumeOneOfStockEntryButton>

            <ConsumeStockEntryButton title={`Consume all of this stock entry ${se.stock_id}`}>
              <X className="mr-2 size-5" /> Consume all
            </ConsumeStockEntryButton>

            <ConsumeSpoiledStockEntryButton
              title={`Consume all of this stock entry ${se.stock_id} as spoiled`}
            >
              <Trash2 className="mr-2 size-5" /> Spoiled
            </ConsumeSpoiledStockEntryButton>

            {/* <button
                        type="button"
                        title={`Inventory (add or remove) stock entry ${se.stock_id}`}
                        className="mt-2 inline-flex cursor-pointer rounded-md border bg-slate-700 p-1 px-2"
                      >
                        Inventory <ChevronUp size={24} />
                      </button> */}
          </div>
          <div className="mx-3 mt-2 flex flex-row flex-wrap gap-x-2 gap-y-1 pb-3 text-slate-300">
            <LocationDropdown
              name="toLocationId"
              units={locations}
              className="h-6! w-50 border-slate-300! bg-slate-700 text-sm/4 tracking-[0.8] md:w-68"
              noFreezers={product.should_not_be_frozen ? true : false}
              firstOptionTitle="Transfer to ..."
              disableOption={se.location_id?.toString()}
            />
            <TransferStockEntryButton
              disabled={product.enable_tare_weight_handling ? true : false}
              title={`Transfer stock entry ${se.stock_id}`}
            >
              <MoveRight className="mr-2 size-5" /> Transfer
            </TransferStockEntryButton>
          </div>
        </div>
      </fieldset>
    </form>
  );
}

async function DisplayStockActionButtons({ se, product }: { se: StockEntry; product: Product }) {
  const units = toLookup(await fetchQuantityUnits());
  const locations = toLookup(await fetchLocations());
  const dueType = dueTypeToString(product.due_type!, product.default_best_before_days);

  if (product === undefined) {
    return <></>;
  }

  return (
    <div className="w-full">
      <code className="text-xs">{se.stock_id}</code> : {(se.amount !== null && se.amount) || "??"}&nbsp;
      {se.amount !== null && se.amount !== undefined && se.amount != 1 && product?.qu_id_stock
        ? units[product.qu_id_stock!]!.name_plural
        : units[product.qu_id_stock!]!.name}{" "}
      {se.open ? <span>(opened)</span> : ""} at {locations[se.location_id!]!.name}
      {dueType !== "No expiry" && (
        <>
          ; {dueType} date is <code>{se.best_before_date}</code>{" "}
        </>
      )}
      {se.note && (
        <>
          {" "}
          -- note: <em>{se.note}</em>
        </>
      )}
    </div>
  );
}
