import Barcode from "@/lib/barcode";
import { getProduct, getCapturedProductsByBarcode, CapturedProductsByBarcode, getProductPhoto } from "@/lib/product-db";
import { EditProductForm } from "@/ui/forms/edit-product-form";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function QueuedEntryPage({ params }: { params: Promise<{ barcode: string }> }) {
  const { barcode } = await params;

  const products: CapturedProductsByBarcode = await getCapturedProductsByBarcode(barcode);

  // Check if the product exists in the database
  if (products[0]) {
    const barcodeObject = new Barcode({
      barcode: barcode,
      name: products[0].name,
      queuedProductId: products[0].id,
    });

    if (barcodeObject.queuedProductId === undefined || isNaN(barcodeObject.queuedProductId)) {
      redirect("/queue");
    }

    // Does it also exist in grocy? If so, can jump straight to things
    // that can be done with the barcode.
    if (products[0].grocyProductId) {
      // FIXME: Redirect to a better place
      redirect("/queue");
    }

    // It does exist in the database but not in grocy. The user will
    // have to capture the essentials for this product.
    const product = getProduct(barcodeObject.queuedProductId);

    const awaitedProduct = await product;

    const productPhoto = getProductPhoto(awaitedProduct.productPhoto ? awaitedProduct.productPhoto.id : 0);

    return (
      <Suspense>
        <EditProductForm code={barcode} product={product} photo={productPhoto} date={new Date()} />
      </Suspense>
    );
  }

  return <>Oops</>;
}
