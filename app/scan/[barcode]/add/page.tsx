import Barcode from "@/lib/barcode";
import { getProductsByBarcode, ProductsByBarcode } from "@/lib/product-db";
import BarcodeScannerApp from "@/ui/barcode/scanner-app";
import { ensureBarcodeExists } from "@/lib/barcode-db";
import { findProductInGrocy, grocyClient } from "@/lib/grocy";
import { ExistingProductForm } from "@/ui/forms/existing-product-form";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProductAddForm } from "@/forms/actions/product-add-form";
import { Product } from "@/interfaces/grocy";

export default async function AddPage({ params }: { params: Promise<{ barcode: string }> }) {
  const { barcode } = await params;

  try {
    await ensureBarcodeExists(barcode);
    await prisma.barcode.update({
      where: { barcode: barcode },
      data: { queued: true },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Couldn't update barcode status:", err);
  }

  const products: ProductsByBarcode = await getProductsByBarcode(barcode);

  if (!products[0]) {
    redirect("/scan");
  }

  // Does it also exist in grocy? If so, can jump straight to things
  // that can be done with the barcode.
  if (products[0].grocyProductId) {
    const barcodeObject = new Barcode({
      barcode: barcode,
      name: products[0].name,
      queuedProductId: products[0].id,
      scannedAt: new Date(),
    });

    const {
      data, // only present if 2XX response
      error, // only present if 4XX or 5XX response
    } = await grocyClient.GET("/stock/products/{productId}", {
      params: { path: { productId: products[0].grocyProductId } },
    });

    const product = data!.product as Product;

    const grocyBarcode = await findProductInGrocy(barcodeObject);

    return (
      <>
        <BarcodeScannerApp slug={barcode} />
        <ExistingProductForm barcode={grocyBarcode} />
        <ProductAddForm code={barcode} product={product} />
      </>
    );
  }

  // It does exist in the database but not in grocy. The user will
  // first have to capture the essentials for this product.
  redirect(`/scan/${barcode}`);
}
