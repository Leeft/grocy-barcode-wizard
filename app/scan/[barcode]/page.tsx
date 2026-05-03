import Barcode from "@/lib/barcode";
import { getCapturedProductsByBarcode, CapturedProductsByBarcode, getProduct } from "@/lib/product-db";
import { findProductInGrocy } from "@/lib/grocy";
import { Product } from "@/interfaces/grocy";
import ActionShortcuts from "@/ui/barcode/action-shortcuts";
import { StockOverview } from "@/ui/barcode/stock-overview";
import { CreateProductForm } from "@/ui/forms/create-product-form";
import SingleQueuedProduct from "@/ui/product/queue/single-queued-product";

export default async function BarcodeScannedPage({ params }: { params: Promise<{ barcode: string }> }) {
  const { barcode } = await params;

  const barcodeObject = new Barcode({
    barcode: barcode,
    scannedAt: new Date(),
  });

  const products: CapturedProductsByBarcode = await getCapturedProductsByBarcode(barcode);
  if (products[0]) {
    barcodeObject.queuedProductId = products[0].id;
    barcodeObject.name = products[0].name;
    if (products[0].grocyProductId !== null) {
      barcodeObject.grocyProductId = products[0].grocyProductId;
    }
  }

  if (products[0]) {
    const product = getProduct(products[0].id);
    if ((await product).grocyProductId === null) {
      return <SingleQueuedProduct product={await product} />;
    }
  }

  let grocyProduct: Product | undefined = undefined;

  try {
    grocyProduct = await findProductInGrocy(barcodeObject);
  } catch (err: unknown) {
    if (barcodeObject.queuedProductId !== null && barcodeObject.queuedProductId !== undefined) {
      const product = await getProduct(barcodeObject.queuedProductId);
      return <SingleQueuedProduct product={product} />;
    }

    if (
      // @ts-expect-error Can't really make TS here at all
      err.error_message !== undefined &&
      // @ts-expect-error Can't really make TS here at all
      err.error_message !== "Could not find product in grocy by id or barcode"
    ) {
      console.log("Product promise did not resolve:", err);
    }
  }

  if (grocyProduct === undefined) {
    return <CreateProductForm code={barcode} />;
  }

  return (
    <>
      {grocyProduct !== undefined && grocyProduct.active === 1 && (
        <>
          <ActionShortcuts code={barcode} />
          <StockOverview code={barcode} />
        </>
      )}
    </>
  );
}
