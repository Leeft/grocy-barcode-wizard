import Barcode from "@/lib/barcode";
import { fetchShoppingLists, findProductInGrocy } from "@/lib/grocy";
import { redirect } from "next/navigation";
import { ProductShopForm } from "@/forms/actions/product-shop-form";
import ShoppingListProvider from "@/providers/shopping-list-context";

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
      <ShoppingListProvider promise={fetchShoppingLists()}>
        <ProductShopForm code={barcode} product={grocyProduct} />
      </ShoppingListProvider>
    </>
  );
}
