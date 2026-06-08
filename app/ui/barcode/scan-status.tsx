"use client";

import QRCode from "@/components/qrcode";
import { Libre_Barcode_39 } from "next/font/google";
import Barcode from "@/lib/barcode";
import { ConnectionStatus } from "@/ui/barcode/scanner-app";

const libreBarcode39 = Libre_Barcode_39({
  weight: '400',
  preload: false,
  fallback: ['system-ui', 'arial'],
});

export default function BarcodeScanStatus({
  connectionStatus,
  retries,
  barcode,
}: {
  connectionStatus: ConnectionStatus;
  retries: number;
  barcode: Barcode | null;
}) {
  return (
    <div className="mt-1 pb-6 transition-colors duration-250 sm:mt-0">
      <div className="text-center">
        <div className="mt-2 p-1 pt-4 sm:p-2 sm:pt-5 md:p-3 md:pt-5 lg:p-4 lg:pt-6">
          <div>
            {!barcode || (connectionStatus !== "connected" && retries > 0) ? (
              <ScannerStreamStatus status={connectionStatus} />
            ) : (
              <VisualBarcode barcode={barcode} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VisualBarcode({ barcode }: { barcode: Barcode }) {

  const isValidBarcode = /^[0-9]{8}$/.test(barcode.code) // EAN-8
    || /^[0-9]{13}$/.test(barcode.code) // EAN-13
    || /^[0-9]{6}$/.test(barcode.code); // UPC-E

  return (
    <div key={barcode.id} className="animate-in zoom-in duration-300">
      {/* Container for Barcode and Laser */}
      <div className="relative inline-block">
        {/* The Visual Barcode */}
        {barcode.type === "product" && isValidBarcode ? (
          <div
            className={`${libreBarcode39.className} md:text-6x1 text-slate-200} text-3xl leading-none tracking-normal`}
          >
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

        {/* The red scan line */}
        <div className="animate-laser bg-laser-line pointer-events-none absolute top-1/2 left-0 h-0.5 w-full" />
      </div>

      {/* The human readable barcode */}
      <div className="mt-1 font-mono text-xl text-slate-500">{barcode.barcode}</div>

      {barcode.scannedAt !== null && barcode.scannedAt !== undefined && (
        <p className="mt-4 font-mono text-xs font-bold tracking-widest text-emerald-600">
          <>SCAN SUCCESS » {barcode.scannedAt.toLocaleString()}</>
        </p>
      )}
    </div>
  );
}

function ScannerStreamStatus({ status }: { status: ConnectionStatus }) {
  return (
    <div
      className={
        "md:text-3x1 lg:text-3x1 xl:text-1x1 animate-pulse py-6 font-mono text-2xl italic decoration-solid " +
        statusColour(status)
      }
    >
      {statusInfo(status)}
    </div>
  );
}

function statusInfo(status: string): string {
  switch (status) {
    case "connecting": {
      return "ATTEMPTING CONNECTION TO BARCODE STREAM";
    }
    case "connected": {
      return "SYSTEM STANDBY; AWAITING BARCODE SCAN";
    }
    default: {
      return "CONNECTION ERROR";
    }
  }
}

function statusColour(status: string): string {
  switch (status) {
    case "connecting": {
      return "text-status-connecting";
    }
    case "connected": {
      return "text-status-connected";
    }
    default: {
      return "text-status-error";
    }
  }
}
