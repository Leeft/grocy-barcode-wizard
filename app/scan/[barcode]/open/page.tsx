import Barcode from "@/lib/barcode";
import { fetchProductStock, findProductInGrocy } from "@/lib/grocy";
import { redirect } from "next/navigation";
import { ProductOpenForm } from "@/forms/actions/product-open-form";

export default async function OpenPage(props: PageProps<"/scan/[barcode]/open">) {
  const { barcode } = await props.params;

  const barcodeObject = new Barcode({
    barcode: barcode,
    scannedAt: new Date(),
  });

  const grocyProduct = await findProductInGrocy(barcodeObject);

  if (
    grocyProduct === undefined ||
    grocyProduct === null ||
    grocyProduct.active === 0 ||
    grocyProduct.id === undefined
  ) {
    redirect("/scan");
  }

  const stock = await fetchProductStock(grocyProduct.id);

  return (
    <>
      <ProductOpenForm code={barcode} product={grocyProduct} stock={stock} />
    </>
  );
}
