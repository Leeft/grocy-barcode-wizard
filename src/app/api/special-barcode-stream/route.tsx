import { SerialisedBarcode } from "@/app/lib/barcode";
import { globalEvents } from "@/app/lib/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // Ensure we aren't using "edge" if using globalEvents

export async function GET(req: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Flip the client status to 'connected' immediately
      controller.enqueue(encoder.encode(": ok\n\n"));

      const specialHandler = (data: SerialisedBarcode) => {
        try {
          // Check if the controller is still open before enqueuing
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
          );
        } catch ( e ) {
          // If enqueuing fails, the controller is likely closed
          console.error("Stream controller closed, removing special listener", e);
          globalEvents.off("special-barcode-stream", specialHandler);
        }
      };      

      // 2. Listen for the event
      globalEvents.on("special-barcode-stream", specialHandler);

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(": ping\n\n"));
      }, 30000);

      // And clear it on abort
      req.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        globalEvents.off("special-barcode-stream", specialHandler);
      });

      // 3. IMPORTANT: The "cancel" method is called when the client disconnects
      // This is the primary way to prevent memory leaks/errors
    },
    cancel() {
      // This logic needs access to 'productHandler', so we often wrap it
      // or handle cleanup via a dedicated signal.
      console.log("Client disconnected from SSE");
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
