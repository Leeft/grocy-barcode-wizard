//import { Button } from "../button";
import Barcode from "@/lib/barcode";
import { ProductInfo } from "./queue/ProductInfo";
import { getProduct } from "@/lib/product-db";
import { Suspense } from "react";

export default async function QueuedProduct({ barcode }: { barcode: Barcode }) {
  const product = await getProduct(barcode.queuedProductId!);

  return (
    <>
      <Suspense>
        <ProductInfo product={product} />
      </Suspense>

      {/* <div className="flex w-full pt-3 pb-15">
        <div className="flex-3.5">
          <Button type="button" className="min-h-12 cursor-pointer text-left">
            Edit queued entry and send to grocy
          </Button>
        </div>
      </div> */}
    </>
  );
}
