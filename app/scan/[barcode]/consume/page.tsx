import Barcode from "@/lib/barcode";
import { ensureBarcodeExists } from "@/lib/barcode-db";
import { findProductInGrocy } from "@/lib/grocy";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProductConsumeForm } from "@/forms/actions/product-consume-form";

export default async function ConsumePage(props: PageProps<'/scan/[barcode]/consume'>) {
  const { barcode } = await props.params;
  const query = await props.searchParams;

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

  if (grocyProduct === undefined || grocyProduct === null || grocyProduct.active === 0) {
    redirect("/scan");
  }

  return (
    <>
      <ProductConsumeForm code={barcode} product={grocyProduct} query={query} />
    </>
  );
}
