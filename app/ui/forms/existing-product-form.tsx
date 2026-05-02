import Grocy from "@/components/icons/grocy";
import { Product } from "@/interfaces/grocy";
import {
  baseUrl,
  fetchProductDetails,
  fetchProductGroups,
  fetchProducts,
  fetchQuantityUnits,
  fetchShoppingLocations,
  grocyUrl,
} from "@/lib/grocy";
import { pluralUnit, toLookup } from "@/lib/utils";
import React, { Suspense } from "react";

export async function ExistingProductForm({ product }: { product: Product }) {
  return (
    <div className="text-left">
      <Suspense fallback={<ExistingProductInfoPlaceholder />}>
        <ExistingProductInfo product={product} />
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

export async function ExistingProductInfo({ product }: { product: Product }) {
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

  const check = (val: boolean) =>
    val ? <span className="text-green-300">✓</span> : <span className="text-red-300">✗</span>;

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
        <dd>
          <GrocyProductLink productId={product.id}>
            {product.name}
            {product.active !== 1 && <span className="text-amber-500 uppercase">&nbsp;&nbsp;[inactive]</span>}
          </GrocyProductLink>
        </dd>
        <dt>Product group</dt>
        <dd>{productGroupName}</dd>
        <dt>Parent product</dt>
        <dd>{parentProductName}</dd>
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

function GrocyProductLink({ productId, children }: { productId: number; children: React.ReactNode }) {
  return (
    <div className="static mb-[-16]">
      <a
        href={`${grocyUrl}/product/${productId}`}
        target="_bcw_grocy"
        title="Link to the product in Grocy"
        className="static mb-[-2] inline-flex underline! decoration-dashed underline-offset-3"
      >
        <Grocy className="relative top-0 ml-[-3] w-6 fill-[#4b7daa] stroke-[#467baa] pr-2 pl-0" />{" "}
        {children}
      </a>
    </div>
  );
}
