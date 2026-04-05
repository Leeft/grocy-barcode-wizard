"use client";

import QRCode from "@/components/qrcode";
import Barcode from "@/lib/barcode";

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
    <div className="mt-1 pb-6 transition-colors duration-250 sm:mt-0">
      <div className="text-center">
        <div className="mt-2 p-1 pt-4 sm:p-2 sm:pt-5 md:p-3 md:pt-5 lg:p-4 lg:pt-6">
          {/* Subtle inner flash indicator */}
          {isFlashing && (
            <div className="pointer-events-none absolute inset-0 bg-emerald-500/10" />
          )}

          <div>
            {barcode ? (
              <div key={barcode.id} className="animate-in zoom-in duration-300">
                {/* Container for Barcode and Laser */}
                <div className="relative inline-block">
                  {/* The Visual Barcode */}
                  {barcode.type === "product" ? (
                    <div className="font-barcode md:text-6x1 text-3xl leading-none tracking-normal text-slate-200">
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
                  <div className="animate-laser pointer-events-none absolute top-1/2 left-0 h-0.5 w-full bg-red-600" />
                </div>

                {/* The Human Readable ID */}
                <div className="mt-1 font-mono text-xl text-slate-500">
                  {barcode.barcode}
                </div>

                <p className="mt-4 font-mono text-xs font-bold tracking-widest text-emerald-600">
                  SCAN_SUCCESS // {barcode.scannedAt?.getUTCDate()}
                </p>
              </div>
            ) : (
              <div
                className={
                  "text-1xl md:text-3x1 xl:text-1x1 animate-pulse py-6 font-mono text-gray-100 italic decoration-solid " +
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
