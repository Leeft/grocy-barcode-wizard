"use client";

import QRCode from "@/app/components/qrcode";
import Barcode from "@/app/lib/barcode";

export default function BarcodeScanStatus({
  connectionStatus,
  barcode,
  isFlashing,
}: {
  connectionStatus: string;
  barcode: Barcode | null;
  isFlashing: boolean;
}) {
  return (
    <div className="pb-6 mt-1 sm:mt-0 transition-colors duration-250">
      <div className="text-center">
        <div className="mt-2 p-1 pt-4 sm:p-2 sm:pt-5 md:p-3 md:pt-5 lg:p-4 lg:pt-6">
          {/* Subtle inner flash indicator */}
          {isFlashing && <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />}

          <div>
            {barcode ? (
              <div key={barcode.id} className="animate-in zoom-in duration-300">
                {/* Container for Barcode and Laser */}
                <div className="relative inline-block">
                  {/* The Visual Barcode */}
                  {barcode.type === "product" ? (
                    <div className="font-barcode text-3xl md:text-6x1 leading-none text-slate-200 tracking-normal">
                      {`*${barcode.barcode}*`}
                    </div>
                  ) : (
                    <QRCode
                      id={barcode.barcode}
                      style={{ width: 70, height: 70 }}
                      value={barcode.barcode}
                      quietZone={5}
                      ecLevel={"L"}
                    />
                  )}

                  {/* The Red Laser Line */}
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-600 animate-laser pointer-events-none" />
                </div>

                {/* The Human Readable ID */}
                <div className="mt-1 text-xl font-mono text-slate-500">{barcode.barcode}</div>

                <p className="mt-4 text-emerald-600 text-xs font-mono font-bold tracking-widest">
                  SCAN_SUCCESS // {barcode.scannedAt?.getUTCDate()}
                </p>
              </div>
            ) : (
              <div
                className={
                  "py-6 font-mono text-1xl md:text-3x1 xl:text-1x1 text-gray-100 italic animate-pulse decoration-solid " +
                  statusColour(connectionStatus)
                }
              >
                {statusInfo(connectionStatus)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function statusInfo(status: string): string {
  switch (status) {
    case "connecting": {
      return "ATTEMPTING CONNECTION TO BARCODE STREAM";
    }
    case "connected": {
      return "SYSTEM_READY; AWAITING_BARCODE_SCAN";
    }
    default: {
      return "CONNECTION ERROR";
    }
  }
}

function statusColour(status: string): string {
  switch (status) {
    case "connecting": {
      return "text-orange-300";
    }
    case "connected": {
      return "text-green-300";
    }
    default: {
      return "text-red-500";
    }
  }
}
