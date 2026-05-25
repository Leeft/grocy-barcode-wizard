"use client";

import Barcode from "@/lib/barcode";
import BarcodeScanStatus from "@/ui/barcode/scan-status";
import { use, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/providers/user-context";
import { GetUser } from "@/lib/user-db";

export type ConnectionStatus = "connecting" | "connected" | "error";

export default function BarcodeScannerApp({ code }: { code?: string }) {
  const [barcode, setBarcode] = useState<Barcode | null>(
    code !== undefined ? new Barcode({ barcode: decodeURIComponent(code) }) : null,
  );
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [retryCount, setRetryCount] = useState(0);
  const [redirect, setRedirect] = useState(false);
  const router = useRouter();
  const user = use(useContext(UserContext) as Promise<GetUser>);

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
        if (debug) console.log("Received barcode data:", barcode);

        setBarcode(barcode);

        if (user.settings?.playSoundOnScan) {
          // Yeah, this is not the react way, but we need the sound to continue
          // playing, and only playing _once_. Proving to be really tricky to do
          // with proper react approaches, particularly because the layout sits
          // server side and the sound needs to be triggered client side.
          const el = document.getElementById("notificationSound") as HTMLAudioElement;
          if (el) {
            el.play();
          }
        }

        if (main) main.classList.add("flash");
        setTimeout(() => {
          if (main) main.classList.remove("flash");
        }, 600);

        window.scrollTo(0, 0);

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
  }, [debug, retryCount, router, user.settings?.playSoundOnScan]);

  useEffect(() => {
    if (redirect && barcode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRedirect(false);
      router.push(`/scan/${barcode.barcode}`);
    }
  }, [redirect, barcode, router]);

  return (
    <>
      <BarcodeScanStatus barcode={barcode} connectionStatus={status} retries={retryCount} />
    </>
  );
}
