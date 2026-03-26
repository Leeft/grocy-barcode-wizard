import QuantityUnitProvider from "@/app/providers/quantity-unit-context";
import {
  fetchLocations,
  fetchProductGroups,
  fetchProducts,
  fetchQuantityUnitConversions,
  fetchQuantityUnits,
  fetchShoppingLocations,
} from "../lib/grocy";
import QuantityUnitConversionProvider from "../providers/quantity-unit-conversion-context";
import LocationProvider from "../providers/location-context";
import ProductGroupProvider from "../providers/product-group-context";
import ProductProvider from "../providers/product-context";
import ShoppingLocationProvider from "../providers/shopping-location-context";

export default function ScanLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const quantityUnitPromise: any = fetchQuantityUnits();
  const quantityUnitConversionsPromise: any = fetchQuantityUnitConversions();
  const locationsPromise: any = fetchLocations();
  const productGroupsPromise: any = fetchProductGroups();
  const productPromise: any = fetchProducts();
  const shoppingLocationsPromise: any = fetchShoppingLocations();

  return (
    <div className="flex ">
      <div className="w-10 md:flex-auto hidden lg:block"></div>

      <div className="w-auto lg:w-160 xl:w-180 p-2 flex-grow text-sm relative lg:mt-4 lg:mb-20 lg:rounded-lg bg-slate-800">
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
