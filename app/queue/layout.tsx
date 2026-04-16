import {
  fetchLocations,
  fetchProductGroups,
  fetchProducts,
  fetchQuantityUnitConversions,
  fetchQuantityUnits,
  fetchShoppingLocations,
} from "../lib/grocy";
import QuantityUnitProvider from "@/providers/quantity-unit-context";
import QuantityUnitConversionProvider from "@/providers/quantity-unit-conversion-context";
import LocationProvider from "@/providers/location-context";
import ProductGroupProvider from "@/providers/product-group-context";
import ProductProvider from "@/providers/product-context";
import ShoppingLocationProvider from "@/providers/shopping-location-context";

export default function QueueLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QuantityUnitProvider promise={fetchQuantityUnits()}>
      <QuantityUnitConversionProvider promise={fetchQuantityUnitConversions()}>
        <ProductGroupProvider promise={fetchProductGroups()}>
          <ProductProvider promise={fetchProducts()}>
            <ShoppingLocationProvider promise={fetchShoppingLocations()}>
              <LocationProvider promise={fetchLocations()}>
                {children}
              </LocationProvider>
            </ShoppingLocationProvider>
          </ProductProvider>
        </ProductGroupProvider>
      </QuantityUnitConversionProvider>
    </QuantityUnitProvider>
  );
}
