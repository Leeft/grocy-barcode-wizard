import Barcode from "@/lib/barcode";
import { findProductInGrocy } from "@/lib/grocy";
import { redirect } from "next/navigation";
import { AddBarcodeToProductForm } from "@/forms/actions/add-barcode-to-product-form";

export default async function AddBarcodeToProduct({ params }: { params: Promise<{ barcode: string }> }) {
  const { barcode } = await params;

  const barcodeObject = new Barcode({
    barcode: barcode,
    scannedAt: new Date(),
  });

  let grocyProduct;
  try {
    grocyProduct = await findProductInGrocy(barcodeObject);
    console.log(grocyProduct);
  } catch {}
  if (grocyProduct !== undefined ) {
    redirect(`/scan/${encodeURIComponent(barcode)}`);
  }

  return <AddBarcodeToProductForm code={barcode} />;
}
