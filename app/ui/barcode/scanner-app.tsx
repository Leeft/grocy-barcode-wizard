"use client";

import Barcode, { BasicBarcode } from "@/lib/barcode";
import BarcodeActions from "@/ui/product/actions";
import BarcodeScanStatus from "@/ui/barcode/scan-status";
import { ExistingProductForm } from "@/ui/forms/existing-product-form";
import { useEffect, useState } from "react";
import { QuickProductForm } from "@/ui/forms/quick-product-form";
import { queueBarcode } from "@/lib/barcode-db";
import QueuedProduct from "../product/queued-product";
import { useSearchParams } from "next/navigation";

type ConnectionStatus = "connecting" | "connected" | "error";

export default function BarcodeScannerApp({
  initialBarcode,
}: {
  initialBarcode: BasicBarcode | null;
}) {
  const [editing /*setEditing*/] = useState(false);
  const [barcode, setBarcode] = useState<Barcode | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [retryCount /*setRetryCount*/] = useState(3);
  const searchParams = useSearchParams();

  const debug = false;

  if (initialBarcode !== null && barcode === null) {
    const newBarcode = new Barcode({
      barcode: initialBarcode.barcode,
      queuedProductId: initialBarcode.queuedProductId,
    });
    setBarcode(newBarcode);
  }

  useEffect(() => {
    const es = new EventSource("/api/product-barcode-stream");

    if (debug) console.log("Attempting to connect...");
    window.scrollTo(0, 0);

    es.onopen = () => {
      setStatus("connected");
      console.log(`Connected to product barcode stream ${es.url}`);
    };

    const main = document.getElementById('main');

    es.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        const barcode = Barcode.fromJSON(data);
        if (debug)
          console.log(
            "Received barcode data:",
            event.data,
            "barcode:",
            barcode,
          );
        setBarcode(barcode);
        //setIsFlashing(true);
        if (main) main.classList.add("flash");

        window.scrollTo(0, 0);
        //setTimeout(() => setIsFlashing(false), 1500);
        setTimeout(() => {
          if (main) main.classList.remove("flash");
        }, 600);

        const params = new URLSearchParams(searchParams.toString());
        const codeParam = params.get("code");
        if (!codeParam || codeParam !== barcode.barcode) {
          params.set("code", barcode.barcode);
          window.history.replaceState(null, "", `?${params.toString()}`);
        }

        if (barcode) {
          const basic = barcode.toBasic();
          await queueBarcode(basic);
        }
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
  }, [debug, retryCount, searchParams]); // Only re-run if we manually trigger a retry

  return (
    <div className={`w-auto`}>
      <BarcodeScanStatus barcode={barcode} connectionStatus={status} />
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
        ) : typeof barcode.queuedProductId === "number" ? (
          <QueuedProduct barcode={barcode} />
        ) : (
          <QuickProductForm barcode={barcode} />
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
