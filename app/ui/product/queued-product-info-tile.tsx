import Barcode from "@/lib/barcode";
import { QueuedProductInfoButton } from "@/ui/product/queue/queued-product-info-button";
import { GetProduct, getProduct } from "@/lib/product-db";
import { Suspense } from "react";

export default async function QueuedProductInfoTile({ barcode }: { barcode: Barcode }) {
  const product: GetProduct = await getProduct(barcode.queuedProductId!);

  return (
    <>
      <Suspense>
        <QueuedProductInfoButton product={product} />
      </Suspense>
    </>
  );
}
