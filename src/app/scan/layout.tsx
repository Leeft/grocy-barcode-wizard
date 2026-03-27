import {
  fetchLocations,
  fetchProductGroups,
  fetchProducts,
  fetchQuantityUnitConversions,
  fetchQuantityUnits,
  fetchShoppingLocations,
} from "../lib/grocy";
import QuantityUnitProvider from "@/app/providers/quantity-unit-context";
import QuantityUnitConversionProvider from "@/app/providers/quantity-unit-conversion-context";
import LocationProvider from "@/app/providers/location-context";
import ProductGroupProvider from "@/app/providers/product-group-context";
import ProductProvider from "@/app/providers/product-context";
import ShoppingLocationProvider from "@/app/providers/shopping-location-context";

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
    <div className="flex ">
      <div className="w-10 md:flex-auto hidden lg:block"></div>

      <div className="w-auto lg:w-160 xl:w-180 p-2 grow text-sm relative lg:mt-4 lg:mb-20 lg:rounded-lg bg-slate-800">
        <div className="w-full p-2">
          <QuantityUnitProvider promise={quantityUnitPromise}>
            <QuantityUnitConversionProvider promise={quantityUnitConversionsPromise}>
              <ProductGroupProvider promise={productGroupsPromise}>
                <ProductProvider promise={productPromise}>
                  <ShoppingLocationProvider promise={shoppingLocationsPromise}>
                    <LocationProvider promise={locationsPromise}>{children}</LocationProvider>
                  </ShoppingLocationProvider>
                </ProductProvider>
              </ProductGroupProvider>
            </QuantityUnitConversionProvider>
          </QuantityUnitProvider>
        </div>
      </div>

      <div className="w-10 md:flex-auto hidden lg:block"></div>
    </div>
  );
}
