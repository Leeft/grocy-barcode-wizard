import QueuedProducts from "@/ui/product/queue/QueuedProducts";
import { Suspense } from "react";

export default async function Page() {
  return (
    <div>
      <h1 className="text-lg font-bold uppercase">
        Product creation queue
      </h1>
      <p>
        These are your queued product captures. Each entry listed here is only
        stored in this database, and has not been filled out completed nor sent
        to Grocy yet. You need to open each of these and complete and upload
        them to Grocy.
      </p>
      <Suspense fallback={<QueueLoading />}>
        <QueuedProducts />
      </Suspense>
    </div>
  );
}

function QueueLoading() {
  return (
    <ul className="py-5">
      <li>
        <h1 className="text-1xl text-slate-400 uppercase">
          [[[ ... Loading ... ]]]
        </h1>
      </li>
    </ul>
  );
}
