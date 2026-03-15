import { Barcode } from "@/interfaces";
import { BarcodeInfoRow } from "./barcode-info-row";
import { LocationsDropdown } from "./locations-dropdown";

export function BarcodeHeader({ barcode }: { barcode: Barcode }) {
  if (barcode.barcode == "") {
    barcode.barcode = "-- waiting for barcode scan --";
  }

  let quantity: string = "0";
  let className: string = "";

  if (barcode.quantity !== undefined && barcode.quantity >= 0) {
    quantity = barcode.quantity.toString();
  }

  if (barcode.id !== undefined && barcode.id > 0 && quantity === "0") {
    quantity = "-- not in stock --";
    className = "text-amber-500";
  }

  return (
    <form className="text-left">
      <div className="mt-3 pt-3 mb-0 sm:mb-2">
        <dl className="px-0">

          <BarcodeInfoRow heading="Name">
            <input name="product_name" defaultValue={barcode.name} />
          </BarcodeInfoRow>

          {barcode.quantity !== undefined && barcode.quantity > 0 && (
            <BarcodeInfoRow heading="Location">
              {/* <LocationsDropdown /> */}
              {/* description={barcode.location?.name?.toString()} /> */}
            </BarcodeInfoRow>
          )}

          {barcode.name !== undefined && barcode.name.length > 0 && (
            <BarcodeInfoRow heading="Stock quantity" className={className}>
              <input name="stock_quantity" defaultValue={quantity} type="number" />
            </BarcodeInfoRow>
          )}

        </dl>
      </div>
    </form>
  );
}
