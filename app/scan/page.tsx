import Barcode from "@/lib/barcode";
import { getProductsByBarcode, ProductsByBarcode } from "@/lib/product-db";
import BarcodeScannerApp from "@/ui/barcode/scanner-app";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { code = "" } = await searchParams;

  let initialBarcode = null;

  if (code !== "") {
    try {
      const products: ProductsByBarcode = await getProductsByBarcode(code);
      if (products[0]) {
        initialBarcode = new Barcode({
          barcode: code,
          name: products[0].name,
          queuedProductId: products[0].id,
        }).toBasic();
      }
    } catch {}
  }

  return (
    <>
      <BarcodeScannerApp initialBarcode={initialBarcode} />
    </>
  );
}
