import { GetProduct } from "@/lib/product-db";
import { QueuedProductInfoButton } from "@/ui/product/queue/queued-product-info-button";

export default async function SingleQueuedProduct({ product }: { product: GetProduct }) {
  return (
    <>
      <div className="flex flex-col gap-y-3 pb-10">
        <h1 className="text-lg mt-4 mb-1 pl-4 font-bold text-slate-200 uppercase">
          Initial product capture for{" "}
          <code className="text-bold text-1xl">{product.barcodes[0]?.barcode}</code>
        </h1>
        <QueuedProductInfoButton product={product} />
      </div>
    </>
  );
}
