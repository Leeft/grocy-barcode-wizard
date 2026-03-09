"use client";
import { Barcode } from "@/interfaces";
import QRCode from "react-qrcode-logo";

export default function BarcodeAction({
  qr,
  qrBgColor,
  barcode,
  title,
  description,
  disable,
}: {
  qr: string;
  qrBgColor: string;
  barcode: Barcode;
  title: string;
  description: string;
  disable?: boolean;
}) {
  const href = `/api/scan/${barcode.barcode}`;
  // QRCode is at:
  // https://github.com/gcoro/react-qrcode-logo
  return (
    <button
      role="button"
      className={disable
        ? "text-slate-800 flex w-full items-left rounded-md p-4"
        : "text-slate-800 flex w-full items-left rounded-md p-4 transition-all hover:bg-slate-100 focus:bg-slate-100 active:bg-slate-100"
      }
    >
      <div className="mr-5 grid place-items-left text-left">
        <QRCode
          style={{ width: 60, height: 60, filter: disable ? 'blur(3px)' : '', opacity: disable ? 0.5 : 1 }}
          bgColor={disable ? 'rgba(255, 255, 0, 0)' : qrBgColor}
          value={qr}
          quietZone={5}
        />
      </div>
      <div className={disable ? "opacity-60 pr-4 line-through": "pr-4"}>
        <h6 className="text-slate-800 font-bold text-left uppercase">
          {title}
        </h6>
        <p className="text-slate-500 text-sm text-left">{description}</p>
      </div>
    </button>
  );
}
