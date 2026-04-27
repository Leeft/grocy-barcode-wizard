import { getPendingProducts, PendingProducts } from "@/lib/product-db";
import { QueuedProductInfoButton } from "@/ui/product/queue/queued-product-info-button";

export default async function ListQueuedProducts() {
  const products: PendingProducts = await getPendingProducts();

  return (
    <ul className="py-2">
      {products.map((product) => (
        <li key={`product-row-${product.id}`} suppressHydrationWarning>
          <QueuedProductInfoButton product={product} />
        </li>
      ))}
    </ul>
  );
}
