import {
  fetchConfig,
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
import GrocyConfigProvider from "@/providers/grocy-config-context";

export default function ScanLayout({
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
                <GrocyConfigProvider promise={fetchConfig()}>
                  {children}
                </GrocyConfigProvider>
              </LocationProvider>
            </ShoppingLocationProvider>
          </ProductProvider>
        </ProductGroupProvider>
      </QuantityUnitConversionProvider>
    </QuantityUnitProvider>
  );
}
