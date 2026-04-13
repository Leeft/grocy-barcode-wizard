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

export default function ScanLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const quantityUnitPromise = fetchQuantityUnits();
  const quantityUnitConversionsPromise = fetchQuantityUnitConversions();
  const locationsPromise = fetchLocations();
  const productGroupsPromise = fetchProductGroups();
  const productPromise = fetchProducts();
  const shoppingLocationsPromise = fetchShoppingLocations();

  return (
    <QuantityUnitProvider promise={quantityUnitPromise}>
      <QuantityUnitConversionProvider promise={quantityUnitConversionsPromise}>
        <ProductGroupProvider promise={productGroupsPromise}>
          <ProductProvider promise={productPromise}>
            <ShoppingLocationProvider promise={shoppingLocationsPromise}>
              <LocationProvider promise={locationsPromise}>
                {children}
              </LocationProvider>
            </ShoppingLocationProvider>
          </ProductProvider>
        </ProductGroupProvider>
      </QuantityUnitConversionProvider>
    </QuantityUnitProvider>
  );
}
