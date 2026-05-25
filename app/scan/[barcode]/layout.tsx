import Barcode from "@/lib/barcode";
import BarcodeScannerApp from "@/ui/barcode/scanner-app";
import { ensureBarcodeExists } from "@/lib/barcode-db";
import {
  fetchProductStock,
  fetchAllQuantityUnitConversionsResolved,
  fetchQuantityUnits,
  findProductInGrocy,
} from "@/lib/grocy";
import { ExistingProductForm } from "@/ui/forms/existing-product-form";
import { prisma } from "@/lib/prisma";
import GrocyProductProvider from "@/providers/grocy-product-context";
import { Error400, Product } from "@/interfaces/grocy";
import { AmountPlusUnitProvider } from "@/providers/amount-plus-unit-context";

export default async function ScanLayout({
  params,
  children,
}: Readonly<{
  params: Promise<{ barcode: string }>;
  children: React.ReactNode;
}>) {
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

  const barcodeObject = new Barcode({
    barcode: barcode,
    scannedAt: new Date(),
  });

  const grocyProductPromise = findProductInGrocy(barcodeObject);

  type ProductOrError = Product | Error400 | object;

  async function tryFindProductInGrocy() {
    try {
      return await grocyProductPromise;
    } catch (err) {
      return err!;
    }
  }

  function isProduct(val: ProductOrError): val is Product {
    return (val as Product).id !== undefined;
  }

  let grocyProduct: ProductOrError = {
    error_message: "Not a product barcode",
  };
  if (barcodeObject.isProductBarcode()) {
    grocyProduct = await tryFindProductInGrocy();
  }

  const id: number = isProduct(grocyProduct) && grocyProduct.id !== undefined ? grocyProduct.id : 0;

  return (
    <>
      <GrocyProductProvider promise={grocyProductPromise}>
        <AmountPlusUnitProvider
          stockEntryPromise={fetchProductStock(id)}
          quantityUnitsPromise={fetchQuantityUnits()}
          resolvedQuantityUnitsConversionPromise={fetchAllQuantityUnitConversionsResolved()}
        >
          <BarcodeScannerApp code={barcode} />
          {grocyProduct !== undefined && <ExistingProductForm product={grocyProduct as Product} />}
          {children}
        </AmountPlusUnitProvider>
      </GrocyProductProvider>
    </>
  );
}
