import QuantityUnitProvider from "@/app/providers/quantity-unit-context";
import {
  fetchLocations,
  fetchProductGroups,
  fetchQuantityUnitConversions,
  fetchQuantityUnits,
} from "../lib/grocy";
import QuantityUnitConversionProvider from "../providers/quantity-unit-conversion-context";
import LocationProvider from "../providers/location-context";
import ProductGroupProvider from "../providers/product-group-context";

export default function ScanLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const quantityUnitPromise: any = fetchQuantityUnits();
  const quantityUnitConversionsPromise: any = fetchQuantityUnitConversions();
  const locationsPromise: any = fetchLocations();
  const productGroupsPromise: any = fetchProductGroups();

  return (
    <div className="flex">
      <div className="flex-auto"></div>
      <div className="w-240 relative flex flex-none rounded-lg bg-slate-800">
        <div className="w-full p-4.5">
          <QuantityUnitProvider promise={quantityUnitPromise}>
            <QuantityUnitConversionProvider promise={quantityUnitConversionsPromise}>
              <ProductGroupProvider promise={productGroupsPromise}>
                <LocationProvider promise={locationsPromise}>{children}</LocationProvider>
              </ProductGroupProvider>
            </QuantityUnitConversionProvider>
          </QuantityUnitProvider>
        </div>
      </div>
      <div className="flex-auto"></div>
    </div>
  );
}
