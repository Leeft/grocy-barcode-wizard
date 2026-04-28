import Barcode from "@/lib/barcode";
import BarcodeScannerApp from "@/ui/barcode/scanner-app";
import { ensureBarcodeExists } from "@/lib/barcode-db";
import { findProductInGrocy } from "@/lib/grocy";
import { ExistingProductForm } from "@/ui/forms/existing-product-form";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProductAddForm } from "@/forms/actions/product-add-form";

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

  const barcodeObject = new Barcode({
    barcode: barcode,
    name: "",
    scannedAt: new Date(),
  });

  const grocyProduct = await findProductInGrocy(barcodeObject);

  if (grocyProduct === undefined || grocyProduct === null || grocyProduct.active === 0 ) {
    redirect("/scan");
  }

  return (
    <>
      <BarcodeScannerApp slug={barcode} />
      <ExistingProductForm barcode={barcode} product={grocyProduct} />
      <ProductAddForm code={barcode} product={grocyProduct} />
    </>
  );
}
