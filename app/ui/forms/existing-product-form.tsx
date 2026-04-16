import Barcode from "@/lib/barcode";
import {
  baseUrl,
  fetchLocations,
  fetchProductGroups,
  fetchProducts,
  fetchQuantityUnits,
  fetchShoppingLocations,
  grocyClient,
} from "@/lib/grocy";
import { Suspense } from "react";

export async function ExistingProductForm({ barcode }: { barcode: Barcode }) {
  let quantity: string = "0";
  //let className: string = "";

  if (barcode.quantity !== undefined && barcode.quantity >= 0) {
    quantity = barcode.quantity.toString();
  }

  if (barcode.id !== undefined && barcode.id > 0 && quantity === "0") {
    quantity = "-- not in stock --";
    //className = "text-amber-500";
  }

  return (
    <form className="text-left">
      <Suspense fallback={<ExistingProductInfoPlaceholder />}>
        <ExistingProductInfo barcode={barcode} />
      </Suspense>
    </form>
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
        <dt>Location</dt>
        <dd>...</dd>
        <dt>Barcodes</dt>
        <dd>...</dd>
        <dt>Last shop</dt>
        <dd>...</dd>
        <dt>Stock</dt>
        <dd>...</dd>
      </dl>
    </>
  );
}

export async function ExistingProductInfo({ barcode }: { barcode: Barcode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toMap = (map: any, obj: any) => {
    map[obj.id] = obj;
    return map;
  };

  const units = (await fetchQuantityUnits()).reduce(toMap, {});

  const shopLocations = (await fetchShoppingLocations()).reduce(toMap, {});
  const productGroups = (await fetchProductGroups()).reduce(toMap, {});
  const products = (await fetchProducts()).reduce(toMap, {});

  const { data, error } = await grocyClient.GET(
    "/stock/products/by-barcode/{barcode}",
    {
      params: { path: { barcode: barcode.code } },
    },
  );

  if (
    data === null ||
    data === undefined ||
    data.product === null ||
    data.product === undefined ||
    !data.product.id
  ) {
    return <>Could not get product information: {error}</>;
  }

  let dueType = "Best before";
  /* @ts-expect-error not in API specification yet */
  if (data.product.due_type === 2) {
    dueType = "Expiration";
  }
  if (data.product.default_best_before_days === -1) {
    dueType = "No expiry";
  }

  const { data: stock /* error: stockError  */ } = await grocyClient.GET(
    "/stock/products/{productId}/entries",
    {
      params: {
        path: { productId: data.product.id },
        query: { include_sub_products: true },
      },
    },
  );

  return (
    <>
      {data.product.picture_file_name !== null &&
        data.product.picture_file_name && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="my-5 max-w-full rounded-xl md:max-h-100 md:max-w-100"
            alt="Photo of the product"
            src={
              baseUrl +
              "/files/productpictures/" +
              btoa(data.product.picture_file_name)
            }
          />
        )}

      <dl className="product-info">
        <dt>Name</dt>
        <dd>{data.product.name}</dd>
        <dt>Product group</dt>
        <dd>
          {data.product.product_group_id &&
            productGroups[data.product.product_group_id].name}
        </dd>
        <dt>Parent product</dt>
        <dd>
          {/* @ts-expect-error not in API specification yet */}
          {data.product.parent_product_id
            ? /* @ts-expect-error not in API specification yet */
              products[data.product.parent_product_id].name
            : "-"}
        </dd>
        <dt>Active</dt>
        {/* @ts-expect-error not in API specification yet */}
        <dd>{data.product.active ? "✓" : "✗"}</dd>
        <dt>May be frozen</dt>
        <dd>{data.product.should_not_be_frozen ? "✗" : "✓"}</dd>
        <dt>Location</dt>
        <dd>{data.location !== undefined && data.location.name}</dd>
        <dt>Barcodes</dt>
        <dd>
          {data.product_barcodes?.map((bc) => (
            <div key={bc.barcode} className="w-full">
              <code>{bc.barcode}</code> :{" "}
              {bc.qu_id
                ? (bc.amount ? bc.amount : "__") +
                  ` ` +
                  (bc.amount === 1
                    ? units[bc.qu_id].name
                    : units[bc.qu_id].name_plural) +
                  (bc.shopping_location_id
                    ? ", purchased at " +
                      shopLocations[bc.shopping_location_id].name
                    : "") +
                  (bc.last_price ? ` for last price: ${bc.last_price}` : ``)
                : "-"}
            </div>
          ))}
        </dd>
        <dt>Last shop</dt>
        <dd>
          {data.last_shopping_location_id
            ? shopLocations[data.last_shopping_location_id].name
            : "-"}
        </dd>
        {stock && (
          <>
            <dt>Stock</dt>
            <dd>
              {stock.map((se) => (
                <div key={`stock_${se.id}`} className="mb-2">
                  <FooFoo data={data} se={se} dueType={dueType} />
                  <div className="flex flex-wrap gap-x-3 text-slate-300">
                    <button
                      type="button"
                      title={`Consume stock entry ${se.stock_id}`}
                      className="mt-2 cursor-pointer rounded-md border bg-slate-700 p-1 px-2"
                    >
                      Consume
                    </button>
                    <button
                      type="button"
                      title={`Consume stock entry ${se.stock_id} as spoiled`}
                      className="mt-2 cursor-pointer rounded-md border bg-slate-700 p-1 px-2"
                    >
                      Spoiled
                    </button>
                    <button
                      type="button"
                      title={`Inventory (add or remove) stock entry ${se.stock_id}`}
                      className="mt-2 cursor-pointer rounded-md border bg-slate-700 p-1 px-2"
                    >
                      Inventory
                    </button>
                    <button
                      type="button"
                      title={`Transfer stock entry ${se.stock_id}`}
                      className="mt-2 cursor-pointer rounded-md border bg-slate-700 p-1 px-2"
                    >
                      Transfer
                    </button>
                    <button
                      type="button"
                      title={`Open stock entry ${se.stock_id}`}
                      className={
                        `mt-2 rounded-md border p-1 px-2 ` +
                        `${se.open ? "bg-slate-800" : "bg-slate-700"} ` +
                        `${se.open ? "cursor-not-allowed text-slate-500" : "cursor-pointer"}`
                      }
                      disabled={se.open ? true : false}
                    >
                      Open
                    </button>
                  </div>
                </div>
              ))}
              {stock.length === 0 && <>No stock</>}
            </dd>
          </>
        )}
      </dl>

      {false && (
        <>
          <hr />
          <pre className="text-xs">{JSON.stringify(stock, null, 2)}</pre>
          <hr />
        </>
      )}

      {false && (
        <>
          <hr />
          <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
          <hr />
        </>
      )}
    </>
  );
}

async function FooFoo({
  se,
  data,
  dueType,
}: {
  se: any;
  data: any;
  dueType: string;
}) {
  const toMap = (map: any, obj: any) => {
    map[obj.id] = obj;
    return map;
  };

  const units = (await fetchQuantityUnits()).reduce(toMap, {});
  const locations = (await fetchLocations()).reduce(toMap, {});

  return (
    <div className="w-full">
      <code className="text-xs">{se.stock_id}</code> :{" "}
      {(se.amount !== null && se.amount) || "??"}&nbsp;
      {se.amount !== null &&
      se.amount !== undefined &&
      se.amount != 1 &&
      data.product?.qu_id_stock
        ? units[data.product?.qu_id_stock].name_plural
        : units[data.product?.qu_id_stock].name}{" "}
      {se.open ? <span>(opened)</span> : ""} at{" "}
      {locations[se.location_id!].name}
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
