import Barcode from "@/app/lib/barcode";
import QRCode from "@/app/components/qrcode";
import { Suspense } from "react";

export default function BarcodeActions({
  barcode,
  className,
  editing,
}: {
  barcode: Barcode;
  className?: string;
  editing: boolean;
}) {
  const logoWidth: number = 135 * 0.75;
  const logoHeight: number = 135 * 0.45;

  if (barcode.product === undefined) {
    return <></>;
  }

  return (
    <div className={className}>
      <div>
        <div className="relative flex flex-col rounded-lg">
          <nav className="flex w-auto flex-col gap-1 p-1.5">
            <BarcodeAction
              qr="sho:c"
              qrBgColor="#61e6d0"
              logoImage={"http://192.168.10.48:3000/icons/consume.png"}
              logoWidth={logoWidth}
              logoHeight={logoHeight}
              title="Consume"
              barcode={barcode}
              description="Consume stock associated with the barcode"
              disable={barcode.quantity === undefined || barcode.quantity <= 0 ? true : false}
              ecLevel={"H"}
            />
            <BarcodeAction
              qr="sho:ca"
              qrBgColor="hsl(24, 63%, 60%)"
              logoImage="/icons/consume_all.png"
              logoWidth={logoWidth}
              logoHeight={logoHeight}
              title="Consume all"
              barcode={barcode}
              description="Remove all remaining inventory as consumed"
              disable={barcode.quantity === undefined || barcode.quantity <= 0 ? true : false}
              ecLevel={"H"}
            />
            <BarcodeAction
              qr="sho:cs"
              qrBgColor="hsl(345, 25%, 65%)"
              logoImage="/icons/spoiled.png"
              logoWidth={logoWidth * 0.8}
              logoHeight={logoHeight * 0.8}
              title="Consume spoiled"
              barcode={barcode}
              description="Remove remaining inventory and mark it as spoiled"
              disable={barcode.quantity === undefined || barcode.quantity <= 0 ? true : false}
              ecLevel={"Q"}
            />
            <BarcodeAction
              qr="sho:p"
              qrBgColor="hsl(121, 24%, 56%)"
              logoImage="/icons/purchased.png"
              logoWidth={logoWidth * 0.8}
              logoHeight={logoHeight * 0.8}
              title="Purchase"
              barcode={barcode}
              description="Add the item to the inventory, and remove from shopping list if this is configured"
              ecLevel={"H"}
            />
            <BarcodeAction
              qr="sho:o"
              qrBgColor="hsl(171, 55%, 78%)"
              logoImage="/icons/open.png"
              logoWidth={logoWidth * 0.9}
              logoHeight={logoHeight * 0.9}
              title="Open"
              barcode={barcode}
              description="Mark item as having been opened"
              disable={barcode.quantity === undefined || barcode.quantity <= 0 ? true : false}
              ecLevel={"H"}
            />
            <BarcodeAction
              qr="sho:i"
              qrBgColor="hsl(281, 46%, 66%)"
              logoImage="/icons/inventory.png"
              logoWidth={logoWidth * 0.9}
              logoHeight={logoHeight * 0.9}
              title="Inventory"
              barcode={barcode}
              description="Refresh inventory information"
              ecLevel={"H"}
            />
            <BarcodeAction
              qr="sho:as"
              qrBgColor="hsl(219, 37%, 58%)"
              logoImage="/icons/shopping_list.png"
              logoWidth={logoWidth * 0.9}
              logoHeight={logoHeight * 0.9}
              title="Add to shopping list"
              barcode={barcode}
              description="Add the item to the shopping list for restocking"
              ecLevel={"H"}
            />
          </nav>
        </div>
      </div>
    </div>
  );
}

function BarcodeAction({
  qr,
  qrBgColor,
  barcode,
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
  barcode: Barcode;
  title: string;
  description: string;
  disable?: boolean;
  logoImage?: string;
  logoWidth?: number;
  logoHeight?: number;
  ecLevel?: "L" | "M" | "Q" | "H";
}) {
  const href = `/api/scan/${barcode.barcode}`;
  // QRCode is at:
  // https://github.com/gcoro/react-qrcode-logo
  return (
    <button
      role="button"
      className={
        "text-slate-800 flex w-full items-left rounded-md p-3 mt-2" +
        (disable
          ? " "
          : " text-slate-800 flex w-full items-left rounded-md transition-all bg-slate-700 hover:bg-slate-100 focus:bg-slate-100 active:bg-slate-100 cursor-pointer")
      }
    >
      <div className="mr-5 grid place-items-left text-left">
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
      <div className={disable ? "opacity-60 pr-4 line-through" : "pr-4"}>
        <h6 className="text-slate-400 font-bold text-left uppercase">{title}</h6>
        <p className="text-slate-500 text-sm text-left">{description}</p>
      </div>
    </button>
  );
}
