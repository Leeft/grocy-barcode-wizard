import Barcode from "@/lib/barcode";
import { getCapturedProductsByBarcode, CapturedProductsByBarcode, getProduct } from "@/lib/product-db";
import { ensureBarcodeExists } from "@/lib/barcode-db";
import { findProductInGrocy } from "@/lib/grocy";
import { Product } from "@/interfaces/grocy";
import ActionShortcuts from "@/ui/barcode/action-shortcuts";
import { StockOverview } from "@/ui/barcode/stock-overview";
import { CreateProductForm } from "@/ui/forms/create-product-form";
import { EditProductForm } from "@/ui/forms/edit-product-form";

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

  let grocyProduct: Product | undefined = undefined;

  try {
    grocyProduct = await findProductInGrocy(barcodeObject);
  } catch (err) {
    if (barcodeObject.queuedProductId !== null && barcodeObject.queuedProductId !== undefined) {
      const product = getProduct(barcodeObject.queuedProductId);
      return <EditProductForm code={barcode} product={product} />;
    }
    console.log("Product promise did not resolve:", err);
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
          {/* <BarcodeActions code={barcode} className="w-auto" editing={false} /> */}
        </>
      )}
    </>
  );
}

async function processReceivedBarcode(code: string): Promise<Product> {
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
