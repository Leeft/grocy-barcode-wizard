import QRCode from "@/components/qrcode";
import clsx from "clsx";
import React from "react";

export default function BarcodeActions({
  code,
  className,
  editing = false,
}: {
  code: string;
  className?: string;
  editing: boolean;
}) {
  const logoWidth: number = 135 * 0.75;
  const logoHeight: number = 135 * 0.45;

  if (code === undefined || editing) {
    return <></>;
  }

  return (
    <div className={clsx("flex", "flex-col", "gap-y-5", "tracking-normal", "py-20", className)}>
      <BarcodeAction>
        <legend className="text-spoiled ml-3 px-2 font-bold tracking-wide uppercase">Consume spoiled</legend>
        amount; transaction_type = 'consume'; spoiled = 'true'; recipe_id; location_id; exact_amount;
        allow_subproduct_substitution;
      </BarcodeAction>
      <BarcodeAction>
        <legend className="text-open ml-3 px-2 font-bold tracking-wide uppercase">Open</legend>
        amount; allow_subproduct_substitution;
      </BarcodeAction>
      <BarcodeAction>
        <legend className="text-inventory ml-3 px-2 font-bold tracking-wide uppercase">Inventory</legend>
        new_amount; best_before_date; shopping_location_id; location_id; price; stock_label_type; note;
      </BarcodeAction>
      <BarcodeAction>
        <legend className="text-shopping-list ml-3 px-2 font-bold tracking-wide uppercase">
          Add to shopping list
        </legend>
        <a target="_blank" href="http://192.168.10.54/api#/Stock/post_stock_shoppinglist_add_product">
          /shoppinglist/add_product
        </a>
        : product_id; qu_id; list_id; product_amount; note;
      </BarcodeAction>
    </div>
  );
}
// return (
//   <div className={className}>
//     <div>
//       <div className="relative flex flex-col rounded-lg">
//         <nav className="flex w-auto flex-col gap-1 p-1.5">
//           <BarcodeAction
//             qr="sho:c"
//             qrBgColor="#61e6d0"
//             logoImage={"/icons/consume.png"}
//             logoWidth={logoWidth}
//             logoHeight={logoHeight}
//             title="Consume"
//             description="Consume stock associated with the barcode"
//             disable={barcode.quantity === undefined || barcode.quantity <= 0 ? true : false}
//             ecLevel={"H"}
//           />
//           <BarcodeAction
//             qr="sho:ca"
//             qrBgColor="hsl(24, 63%, 60%)"
//             logoImage="/icons/consume_all.png"
//             logoWidth={logoWidth}
//             logoHeight={logoHeight}
//             title="Consume all"
//             description="Remove all remaining inventory as consumed"
//             disable={barcode.quantity === undefined || barcode.quantity <= 0 ? true : false}
//             ecLevel={"H"}
//           />
//           <BarcodeAction
//             qr="sho:cs"
//             qrBgColor="hsl(345, 25%, 65%)"
//             logoImage="/icons/spoiled.png"
//             logoWidth={logoWidth * 0.8}
//             logoHeight={logoHeight * 0.8}
//             title="Consume spoiled"
//             description="Remove remaining inventory and mark it as spoiled"
//             disable={barcode.quantity === undefined || barcode.quantity <= 0 ? true : false}
//             ecLevel={"Q"}
//           />
//           <BarcodeAction
//             qr="sho:p"
//             qrBgColor="hsl(121, 24%, 56%)"
//             logoImage="/icons/purchased.png"
//             logoWidth={logoWidth * 0.8}
//             logoHeight={logoHeight * 0.8}
//             title="Purchase"
//             description="Add the item to the inventory, and remove from shopping list if this is configured"
//             ecLevel={"H"}
//           />
//           <BarcodeAction
//             qr="sho:o"
//             qrBgColor="hsl(171, 55%, 78%)"
//             logoImage="/icons/open.png"
//             logoWidth={logoWidth * 0.9}
//             logoHeight={logoHeight * 0.9}
//             title="Open"
//             description="Mark item as having been opened"
//             disable={barcode.quantity === undefined || barcode.quantity <= 0 ? true : false}
//             ecLevel={"H"}
//           />
//           <BarcodeAction
//             qr="sho:i"
//             qrBgColor="hsl(281, 46%, 66%)"
//             logoImage="/icons/inventory.png"
//             logoWidth={logoWidth * 0.9}
//             logoHeight={logoHeight * 0.9}
//             title="Inventory"
//             description="Refresh inventory information"
//             ecLevel={"H"}
//           />
//           <BarcodeAction
//             qr="sho:as"
//             qrBgColor="hsl(219, 37%, 58%)"
//             logoImage="/icons/shopping_list.png"
//             logoWidth={logoWidth * 0.9}
//             logoHeight={logoHeight * 0.9}
//             title="Add to shopping list"
//             description="Add the item to the shopping list for restocking"
//             ecLevel={"H"}
//           />
//         </nav>
//       </div>
//     </div>
//   </div>
// );

function BarcodeAction({ children }: { children: React.ReactNode }) {
  return (
    <form>
      <fieldset className="rounded-lg border border-dotted px-3 py-2">{children}</fieldset>
    </form>
  );
}

function BarcodeAction2({
  qr,
  qrBgColor,
  title,
  description,
  disable,
  logoImage,
  logoWidth,
  logoHeight,
  ecLevel,
}: {
  qr: string;
  qrBgColor: string;
  title: string;
  description: string;
  disable?: boolean;
  logoImage?: string;
  logoWidth?: number;
  logoHeight?: number;
  ecLevel?: "L" | "M" | "Q" | "H";
}) {
  // QRCode is at:
  // https://github.com/gcoro/react-qrcode-logo
  return (
    <button
      role="button"
      className={
        "items-left mt-2 flex w-full rounded-md p-3 text-slate-800" +
        (disable
          ? " "
          : " items-left flex w-full cursor-pointer rounded-md bg-slate-700 text-slate-800 transition-all hover:bg-slate-100 focus:bg-slate-100 active:bg-slate-100")
      }
    >
      <div className="place-items-left mr-5 grid text-left">
        <QRCode
          id={qr}
          style={{
            width: 60,
            height: 60,
            filter: disable ? "blur(3px)" : "",
            opacity: disable ? 0.5 : 1,
          }}
          bgColor={disable ? "rgba(255, 255, 0, 0)" : qrBgColor}
          value={qr}
          quietZone={5}
          logoImage={logoImage}
          logoOpacity={1}
          logoPadding={0}
          logoWidth={logoWidth}
          logoHeight={logoHeight}
          removeQrCodeBehindLogo={false}
          ecLevel={ecLevel}
        />
      </div>
      <div className={disable ? "pr-4 line-through opacity-60" : "pr-4"}>
        <h6 className="text-left font-bold text-slate-400 uppercase">{title}</h6>
        <p className="text-left text-sm text-slate-500">{description}</p>
      </div>
    </button>
  );
}
