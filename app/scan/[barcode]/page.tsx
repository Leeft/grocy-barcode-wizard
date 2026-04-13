import Barcode from "@/lib/barcode";
import { getProductsByBarcode, ProductsByBarcode } from "@/lib/product-db";
import { ExistingProductForm } from "@/ui/forms/existing-product-form";
import { QuickProductForm } from "@/ui/forms/quick-product-form";
import BarcodeActions from "@/ui/product/actions";
import QueuedProduct from "@/ui/product/queued-product";

export default async function BarcodePage({
  params,
}: {
  params: Promise<{ barcode: string }>;
}) {
  const { barcode } = await params;

  const products: ProductsByBarcode = await getProductsByBarcode(barcode);

  // Check if the product exists in the database
  if (products[0]) {
    const barcodeObject = new Barcode({
      barcode: barcode,
      name: products[0].name,
      queuedProductId: products[0].id,
    });

    // Does it also exist in grocy? If so, can jump straight to things
    // that can be done with the barcode.
    if (products[0].grocyProductId) {
      return (
        <>
          {/* <ExistingProductForm barcode={barcodeObject} /> */}
          <BarcodeActions
            barcode={barcodeObject}
            className="w-auto"
            editing={false}
          />
        </>
      );
    }

    // It does exist in the database but not in grocy. The user will
    // have to capture the essentials for this product.
    if (barcodeObject.queuedProductId) {
      return <QueuedProduct barcode={barcodeObject} />;
    }
  }

  return <QuickProductForm code={barcode} />;
}
