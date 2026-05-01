import Barcode from "@/lib/barcode";
import { findProductInGrocy } from "@/lib/grocy";
import { redirect } from "next/navigation";
import { ProductTransferForm } from "@/forms/actions/product-transfer-form";

export default async function TransferPage(props: PageProps<'/scan/[barcode]/transfer'>) {
  const { barcode } = await props.params;

  const barcodeObject = new Barcode({
    barcode: barcode,
    scannedAt: new Date(),
  });

  const grocyProduct = await findProductInGrocy(barcodeObject);

  if (grocyProduct === undefined || grocyProduct === null || grocyProduct.active === 0 || grocyProduct.id === undefined) {
    redirect("/scan");
  }

  return (
    <>
      <ProductTransferForm code={barcode} product={grocyProduct} />
    </>
  );
}
