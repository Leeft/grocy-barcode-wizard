import Barcode from "@/lib/barcode";
import BarcodeScannerApp from "@/ui/barcode/scanner-app";
import { ensureBarcodeExists } from "@/lib/barcode-db";
import { fetchProductStock, fetchQuantityUnitConversionsResolved, findProductInGrocy } from "@/lib/grocy";
import { ExistingProductForm } from "@/ui/forms/existing-product-form";
import { prisma } from "@/lib/prisma";
import GrocyProductProvider from "@/providers/grocy-product-context";
import ProductStockProvider from "@/providers/product-stock-context";
import { Product } from "@/interfaces/grocy";
import QuantityUnitConversionResolvedProvider from "@/providers/quantity-unit-conversion-resolved-context";

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

  type ProductOrError = Product | { error_message: string } | {};

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

  const grocyProduct: ProductOrError = await tryFindProductInGrocy();

  const id: number = isProduct(grocyProduct) && grocyProduct.id !== undefined ? grocyProduct.id : 0;

  return (
    <>
      <GrocyProductProvider promise={grocyProductPromise}>
        <ProductStockProvider promise={fetchProductStock(id)}>
          <QuantityUnitConversionResolvedProvider promise={fetchQuantityUnitConversionsResolved(id)}>
            <BarcodeScannerApp slug={barcode} />
            {grocyProduct !== undefined && <ExistingProductForm product={grocyProduct as Product} />}
            {children}
          </QuantityUnitConversionResolvedProvider>
        </ProductStockProvider>
      </GrocyProductProvider>
    </>
  );
}
