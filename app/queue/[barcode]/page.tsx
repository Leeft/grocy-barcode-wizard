import Barcode from "@/lib/barcode";
import { getProductsByBarcode, ProductsByBarcode } from "@/lib/product-db";
import QueuedProduct from "@/ui/product/queued-product";

export default async function QueuedEntryPage({
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
      return <>Should redirect here</>;
    }

    // It does exist in the database but not in grocy. The user will
    // have to capture the essentials for this product.
    if (barcodeObject.queuedProductId) {
      return (
        <>
          <h1 className="uppercase text-3x1">Placeholder product queue entry page</h1>
          <QueuedProduct barcode={barcodeObject} />
        </>
      );
    }
  }

  return <>Oops</>;
}
