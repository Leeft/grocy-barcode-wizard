"use client";

import { Barcode } from "@/interfaces";
import { useEffect, useState } from "react";

type ConnectionStatus = "connecting" | "connected" | "error";

export default function BarcodeScanStream({
  barcode,
  editing,
  debug,
  changeBarcode,
  onShow,
}: {
  barcode: Barcode | null;
  editing: boolean;
  debug: boolean;
  changeBarcode: Function;
  onShow: Function;
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
      <div className={`pb-5 transition-colors duration-500 ${isFlashing ? "" : ""}`}>
        <div className={`max-w-xl pt-10 text-center ${isFlashing} ? "animate-flash" : ""`}>
          {/* <StatusBadge
            status={status}
            onRetry={() => {  }}
          /> */}

          <div className="mt-10 p-8 border-2 rounded-2xl bg-white shadow-2xl relative overflow-hidden">
            {/* Subtle inner flash indicator */}
            {isFlashing && <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />}

            {/* <div className="mt-10 p-8 border-2 rounded-2xl bg-white shadow-2xl relative overflow-hidden"> */}
            <div>
              {barcode ? (
                <div key={barcode.timestamp} className="animate-in zoom-in duration-300">
                  {/* Container for Barcode and Laser */}
                  <div className="relative inline-block">
                    {/* The Visual Barcode */}
                    <div className="font-barcode text-6xl leading-none text-black tracking-widest">
                      {`*${barcode.barcode}*`}
                    </div>

                    {/* The Red Laser Line */}
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-600 animate-laser pointer-events-none" />
                  </div>

                  {/* The Human Readable ID */}
                  <div className="mt-1 text-xl font-mono font-black text-slate-700">{barcode.barcode}</div>

                  <p className="mt-4 text-emerald-600 text-xs font-mono font-bold tracking-widest">
                    SCAN_SUCCESS //{" "}
                    {new Date(
                      barcode.timestamp !== undefined ? barcode.timestamp : Date.now(),
                    ).toLocaleTimeString()}
                  </p>
                </div>
              ) : (
                <div className="py-10 text-gray-600 italic font-mono animate-pulse">
                  SYSTEM_READY; AWAITING_BARCODE_SCAN
                </div>
              )}
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
