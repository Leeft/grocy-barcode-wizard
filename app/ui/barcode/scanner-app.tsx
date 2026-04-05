"use client";

import Barcode from "@/lib/barcode";
import BarcodeActions from "@/ui/product/actions";
import BarcodeScanStatus from "@/ui/barcode/scan-status";
import { ExistingProductForm } from "@/ui/forms/existing-product-form";
import { useEffect, useState } from "react";
import { QuickProductForm } from "@/ui/forms/quick-product-form";

type ConnectionStatus = "connecting" | "connected" | "error";

export default function BarcodeScannerApp() {
  const [editing /*setEditing*/] = useState(false);
  const [barcode, setBarcode] = useState<Barcode | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [isFlashing, setIsFlashing] = useState(false);
  const [retryCount /*setRetryCount*/] = useState(3);

  const debug = true;

  useEffect(() => {
    const es = new EventSource("/api/product-barcode-stream");

    if (debug) console.log("Attempting to connect...");
    window.scrollTo(0, 0);

    es.onopen = () => {
      setStatus("connected");
      console.log(`Connected to product barcode stream ${es.url}`);
    };

    es.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (debug) console.log("Received barcode data:", data);
        setBarcode(Barcode.fromJSON(data));
        setIsFlashing(true);
        window.scrollTo(0, 0);
        setTimeout(() => setIsFlashing(false), 1500);
      } catch (err) {
        console.error("JSON Parse Error:", err, "from data", event.data);
      }
    };

    es.onerror = (err) => {
      console.error("EventSource failed:", err);
      setStatus("error");
      es.close();
    };

    // 4. Cleanup function
    return () => {
      console.log("Closing product barcode stream connection");
      es.close();
    };
  }, [debug, retryCount]); // Only re-run if we manually trigger a retry

  return (
    <div className={`w-auto`}>
      <BarcodeScanStatus
        barcode={barcode}
        isFlashing={isFlashing}
        connectionStatus={status}
      />
      {barcode &&
        (barcode !== null && barcode?.product !== undefined ? (
          <>
            <ExistingProductForm barcode={barcode} />
            <BarcodeActions
              barcode={barcode}
              className="w-auto"
              editing={editing}
            />
          </>
        ) : (
          <QuickProductForm />
        ))}
    </div>
  );
}

// function StatusBadge({ status, onRetry }: { status: ConnectionStatus; onRetry: () => void }) {
//   if (status === "connecting")
//     return <span className="text-amber-500 text-xs font-bold uppercase">● Connecting</span>;
//   if (status === "error")
//     return (
//       <button onClick={onRetry} className="text-red-500 text-xs font-bold uppercase underline">
//         ● Disconnected - Retry?
//       </button>
//     );
//   return <span className="text-emerald-500 text-xs font-bold uppercase">● Live System</span>;
// }
