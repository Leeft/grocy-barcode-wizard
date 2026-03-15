"use client";

import { Barcode } from "@/interfaces";
import React, { useEffect, useState } from "react";
import QRCode from "./qrcode";

type ConnectionStatus = "connecting" | "connected" | "error";

export default function BarcodeScanStream({
  barcode,
  editing,
  debug,
  changeBarcode,
  onShow,
  children,
}: {
  barcode: Barcode | null;
  editing: boolean;
  debug: boolean;
  changeBarcode: Function;
  onShow: Function;
  children: React.ReactNode;
}) {
  const [isFlashing, setIsFlashing] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // 1. Clear any existing connection immediately
    const es = new EventSource("/api/product-stream");

    if (debug) console.log("Attempting to connect..."); // Debug log

    es.onopen = () => {
      if (debug) console.log("Connected to SSE");
      setStatus("connected");
    };

    es.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        // console.log("Received data:", data); // Debug log

        // 2. Update state
        changeBarcode(data);

        // 3. Trigger Flash
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 800);
      } catch (err) {
        console.error("JSON Parse Error:", err);
      }
    };

    es.onerror = (err) => {
      console.error("EventSource failed:", err);
      setStatus("error");
      es.close();
    };

    // 4. Cleanup function
    return () => {
      console.log("Closing connection");
      es.close();
    };
  }, [retryCount]); // Only re-run if we manually trigger a retry

  return (
    <div className="pb-6 mt-1 sm:mt-0 transition-colors duration-250">
      <div className={`text-center ${isFlashing} ? "animate-flash" : ""`}>
        {/* <StatusBadge
            status={status}
            onRetry={() => {  }}
          /> */}

        <div className="mt-2 p-1 pt-4 sm:p-2 sm:pt-5 md:p-3 md:pt-5 lg:p-4 lg:pt-6 rounded-2xl bg-gray-800 relative overflow-hidden">
          {/* Subtle inner flash indicator */}
          {isFlashing && <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />}

          {/* <div className="mt-10 p-8 border-2 rounded-2xl bg-white shadow-2xl relative overflow-hidden"> */}
          <div>
            {barcode ? (
              <div key={barcode.timestamp} className="animate-in zoom-in duration-300">
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
                  SCAN_SUCCESS //{" "}
                  {new Date(barcode.timestamp !== undefined ? barcode.timestamp : Date.now()).toLocaleTimeString()}
                </p>
              </div>
            ) : (
              <div className="py-6 font-mono text-1xl md:text-3x1 xl:text-1x1 text-gray-100 italic animate-pulse decoration-solid">
                SYSTEM_READY; AWAITING_BARCODE_SCAN
              </div>
            )}

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, onRetry }: { status: ConnectionStatus; onRetry: () => void }) {
  if (status === "connecting") return <span className="text-amber-500 text-xs font-bold uppercase">● Connecting</span>;
  if (status === "error")
    return (
      <button onClick={onRetry} className="text-red-500 text-xs font-bold uppercase underline">
        ● Disconnected - Retry?
      </button>
    );
  return <span className="text-emerald-500 text-xs font-bold uppercase">● Live System</span>;
}
