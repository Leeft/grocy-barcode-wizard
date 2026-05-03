import Barcode from "@/lib/barcode";
import { findProductInGrocy } from "@/lib/grocy";
import { redirect } from "next/navigation";
import { ProductAddForm } from "@/forms/actions/product-add-form";

export default async function AddPage({ params }: { params: Promise<{ barcode: string }> }) {
  const { barcode } = await params;

  const barcodeObject = new Barcode({
    barcode: barcode,
    scannedAt: new Date(),
  });

  const grocyProduct = await findProductInGrocy(barcodeObject);

  if (grocyProduct === undefined || grocyProduct === null || grocyProduct.active === 0) {
    redirect("/scan");
  }

  return (
    <>
      <ProductAddForm code={barcode} product={grocyProduct} />
    </>
  );
}
