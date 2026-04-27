import Barcode from "@/lib/barcode";
import { getProductsByBarcode, ProductsByBarcode } from "@/lib/product-db";
import { CreateProductForm } from "@/ui/forms/create-product-form";
import BarcodeScannerApp from "@/ui/barcode/scanner-app";
import BarcodeActions from "@/ui/product/product-actions";
import QueuedProductInfoTile from "@/ui/product/queued-product-info-tile";
import { ensureBarcodeExists } from "@/lib/barcode-db";
import { findProductInGrocy } from "@/lib/grocy";
import { ExistingProductForm } from "@/ui/forms/existing-product-form";
import { prisma } from "@/lib/prisma";

export default async function BarcodeScannedPage({ params }: { params: Promise<{ barcode: string }> }) {
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

  // Check if the product exists in the database
  if (products[0]) {
    const barcodeObject = new Barcode({
      barcode: barcode,
      name: products[0].name,
      queuedProductId: products[0].id,
      scannedAt: new Date(),
    });

    // Does it also exist in grocy? If so, can jump straight to things
    // that can be done with the barcode.
    if (products[0].grocyProductId) {
      const grocyBarcode = await findProductInGrocy(barcodeObject);
      return (
        <>
          <BarcodeScannerApp slug={barcode} />
          <ExistingProductForm barcode={grocyBarcode} showShortcuts={true} showStock={true} />
          <BarcodeActions barcode={grocyBarcode} className="w-auto" editing={false} />
        </>
      );
    }

    // It does exist in the database but not in grocy. The user will
    // have to capture the essentials for this product.
    if (barcodeObject.queuedProductId) {
      return (
        <>
          <BarcodeScannerApp slug={barcode} />
          <QueuedProductInfoTile barcode={barcodeObject} />
        </>
      );
    }
  }

  let grocyBarcode: Barcode | null = null;
  try {
    if (barcode !== "installHook.js.map") grocyBarcode = await processReceivedBarcode(barcode);
  } catch {
    console.log(`Couldn't get product from grocy by barcode: ${barcode}`);
  }

  if (grocyBarcode !== null) {
    return (
      <>
        <BarcodeScannerApp slug={grocyBarcode.code} />
        <ExistingProductForm barcode={grocyBarcode} />
        <BarcodeActions barcode={grocyBarcode} className="w-auto" editing={false} />
      </>
    );
  }

  return (
    <>
      <BarcodeScannerApp slug={barcode} />
      <CreateProductForm code={barcode} />
    </>
  );
}

async function processReceivedBarcode(code: string): Promise<Barcode> {
  let barcode: Barcode;

  try {
    barcode = new Barcode({ barcode: code, scannedAt: new Date() });
  } catch {
    throw new Error("Not a valid barcode");
  }

  if (barcode.isSpecialBarcode()) {
    throw new Error("Can not handle special barcodes here");
  }

  // Make sure the barcode is known in the database, so state can
  // be stored for it.
  try {
    const model = await ensureBarcodeExists(code);
    if (model.productId !== undefined && model.productId !== null) {
      barcode.queuedProductId = model.productId;
    }
  } catch (e) {
    console.error("Could not store/update barcode in database:", e);
  }

  return findProductInGrocy(barcode);
}
