import { Barcode } from "@/interfaces";
import { BarcodeInfoRow } from "./barcode-info-row";

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
    <div className="text-left">
      {/* <div className="px-4 sm:px-0">
        <h1 className="text-slate-0 font-bold uppercase">
          Barcode &nbsp;&nbsp;
          <strong>
            <code className="text-lg text-amber-500">{barcode.barcode}</code>
          </strong>
        </h1>
      </div> */}
      <div className="mt-3 pt-3 mb-0 sm:mb-2">
        <dl className="px-0">
          <BarcodeInfoRow heading="Name" description={barcode.name} />
          {/* <BarcodeInfoRow
          heading="Product"
          description={barcode.productId?.toString()}
        /> */}
          {barcode.quantity !== undefined && barcode.quantity > 0 && (
            <BarcodeInfoRow heading="Location" description={barcode.location?.name?.toString()} />
          )}
          {barcode.name !== undefined && barcode.name.length > 0 && (
            <BarcodeInfoRow heading="Quantity" description={quantity} className={className} />
          )}
        </dl>
      </div>
    </div>
  );
}
