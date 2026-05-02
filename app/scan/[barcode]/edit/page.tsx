import { getCapturedProductsByBarcode, CapturedProductsByBarcode, getProduct } from "@/lib/product-db";
import { EditProductForm } from "@/ui/forms/edit-product-form";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function EditCapturedBarcode({ params }: { params: Promise<{ barcode: string }> }) {
  const { barcode } = await params;

  const products: CapturedProductsByBarcode = await getCapturedProductsByBarcode(barcode);

  if (products[0]) {
    if (products[0].grocyProductId === null && products[0].id ) {
      const product = getProduct(products[0].id);
      if ((await product).grocyProductId === null) {
        return <EditProductForm code={barcode} product={product} />;
      }
    }
  }

  revalidatePath(`/scan/${barcode}`);
  redirect(`/scan/${barcode}`);
}
