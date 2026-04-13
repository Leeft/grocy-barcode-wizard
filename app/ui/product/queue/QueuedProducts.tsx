import { getPendingProducts, PendingProducts } from "@/lib/product-db";
import { ProductInfo } from "@/ui/product/queue/ProductInfo";

export default async function QueuedProducts() {
  const products: PendingProducts = await getPendingProducts();

  return (
    <ul className="py-2">
      {products.map((product) => (
        <li
          key={`product-row-${product.id}`}
          className=""
          suppressHydrationWarning
        >
          <ProductInfo product={product} />
        </li>
      ))}
    </ul>
  );
}
