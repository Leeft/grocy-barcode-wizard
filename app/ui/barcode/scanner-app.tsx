"use client";

import Barcode from "@/lib/barcode";
import BarcodeScanStatus from "@/ui/barcode/scan-status";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export type ConnectionStatus = "connecting" | "connected" | "error";

export default function BarcodeScannerApp() {
  const [barcode, setBarcode] = useState<Barcode | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [retryCount, setRetryCount] = useState(0);
  const [redirect, setRedirect] = useState(false);
  const router = useRouter();
  const params = useParams();

  const debug = false;

  useEffect(() => {
    const es = new EventSource("/api/product-barcode-stream");

    if (debug) console.log("Attempting to connect...");
    window.scrollTo(0, 0);

    es.onopen = () => {
      setStatus("connected");
      console.log(`Connected to product barcode stream ${es.url}`);
      setRetryCount(0); // Reset retries on success
    };

    const main = document.getElementById("main");

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

        if (main) main.classList.add("flash");
        setTimeout(() => {
          if (main) main.classList.remove("flash");
        }, 600);

        window.scrollTo(0, 0);
        window.history.replaceState(null, "", `/scan/${barcode.barcode}`);
        setRedirect(true);
      } catch (err) {
        console.error("JSON Parse Error:", err, "from data", event.data);
      }
    };

    es.onerror = (err) => {
      console.error("EventSource failed:", err);
      setStatus("error");
      es.close();
      setTimeout(() => setRetryCount((c) => c + 1), 5000);
    };

    // 4. Cleanup function
    return () => {
      console.log("Closing product barcode stream connection");
      es.close();
    };
  }, [debug, retryCount]);

  useEffect(() => {
    if (redirect && barcode) {
      router.push(`/scan/${barcode.barcode}`);
    }
  }, [redirect, barcode]);

  useEffect(() => {
    if (
      params.barcode &&
      typeof params.barcode === "string" &&
      (!barcode || barcode.barcode != params.barcode)
    ) {
      setBarcode(new Barcode({ barcode: params.barcode }));
    } else if (params.barcode === null || params.barcode === undefined) {
      setBarcode(null);
    }
  }, [params]);

  return (
    <BarcodeScanStatus barcode={barcode} connectionStatus={status} retries={retryCount} />
  );
}
