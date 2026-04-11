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
import clsx from "clsx";

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

  const classes = clsx(
    `relative w-auto grow bg-slate-800 p-2 text-sm max-w-240`,
    // lg:mt-4 lg:mb-20 lg:w-160 lg:rounded-lg xl:w-180`,
  );

  return (
    <div className="flex">
      <div className="hidden w-10 md:flex-auto lg:block"></div>

      <div className={classes}>
        <div className="w-full p-2">
          <QuantityUnitProvider promise={quantityUnitPromise}>
            <QuantityUnitConversionProvider
              promise={quantityUnitConversionsPromise}
            >
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
        </div>
      </div>

      <div className="hidden w-10 md:flex-auto lg:block"></div>
    </div>
  );
}
