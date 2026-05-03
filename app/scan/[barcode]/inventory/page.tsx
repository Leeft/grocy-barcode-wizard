import Barcode from "@/lib/barcode";
import { findProductInGrocy } from "@/lib/grocy";
import { redirect } from "next/navigation";
import { ProductInventoryForm } from "@/forms/actions/product-inventory-form";

export default async function ShopPage({ params }: { params: Promise<{ barcode: string }> }) {
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
      <ProductInventoryForm code={barcode} product={grocyProduct} />
    </>
  );
}
