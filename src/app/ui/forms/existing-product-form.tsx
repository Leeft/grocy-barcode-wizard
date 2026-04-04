import Barcode from "@/app/lib/barcode";
import { BarcodeInfoRow } from "@/app/components/barcode-info-row";

export function ExistingProductForm({ barcode }: { barcode: Barcode }) {
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
      <div className="mt-3 mb-0 pt-3 sm:mb-2">
        <dl className="px-0">
          <BarcodeInfoRow heading="Name">
            <input
              name="product_name"
              key={barcode.id}
              defaultValue={barcode.name !== undefined ? barcode.name : ""}
            />
          </BarcodeInfoRow>

          {barcode.quantity !== undefined && barcode.quantity > 0 ? (
            <BarcodeInfoRow heading="Location">
              {/* <LocationDropdown selectedIndex={barcode.product?.location_id} /> */}
            </BarcodeInfoRow>
          ) : (
            ""
          )}

          {barcode.name !== undefined && barcode.name.length > 0 && (
            <BarcodeInfoRow heading="Stock quantity" className={className}>
              <input
                name="stock_quantity"
                key={barcode.id + "-stock"}
                defaultValue={quantity}
                type="number"
              />
            </BarcodeInfoRow>
          )}
        </dl>
      </div>
    </form>
  );
}
