import {
  OpenFoodFactsNotFoundResult,
  OpenFoodFactsProduct,
  OpenFoodFactsResult,
} from "@/interfaces/json-objects";
import Barcode from "./barcode";
import * as JsonDecoder from "ts.data.json";
import ExternalLookup from "@/lib/external-lookup";
import { globalEvents } from "./events";

const openFoodFactsProductDecoder = JsonDecoder.object<OpenFoodFactsProduct>(
  {
    product_name_en: JsonDecoder.string(),
  },
  "OpenFoodFactsProduct",
);

const openFoodFactsDecoder = JsonDecoder.object<OpenFoodFactsResult>(
  {
    code: JsonDecoder.string(),
    status: JsonDecoder.number(),
    status_verbose: JsonDecoder.string(),
    product: openFoodFactsProductDecoder,
  },
  "OpenFoodFactsResult",
);

const openFoodFactsNotFoundDecoder = JsonDecoder.object<OpenFoodFactsNotFoundResult>(
  {
    code: JsonDecoder.string(),
    status: JsonDecoder.number(),
    status_verbose: JsonDecoder.string(),
  },
  "OpenFoodFactsNotFoundResult",
);

export async function findProductInOpenFoodFacts(barcode: Barcode) {
  const startTime = performance.now();
  const i_promise = await (await new ExternalLookup().lookupOpenFoodFacts(barcode)).json();

  openFoodFactsNotFoundDecoder.decodePromise(i_promise).then((result) => {
    if (result.status !== 0) {
      openFoodFactsDecoder
        .decodePromise(result)
        .then((openFoodFactsResult: OpenFoodFactsResult) => {
          if (openFoodFactsResult.status) {
            const foundBarcode: Barcode = new Barcode({
              barcode: barcode.barcode,
              name: openFoodFactsResult.product?.product_name_en,
              queuedProductId: barcode.queuedProductId,
            });
            const endTime = performance.now();
            const timeDiff = (endTime - startTime) / 1000;
            console.log(`Found openfoodfacts product as ${foundBarcode.name} after ${timeDiff}`);
            globalEvents.emit("product-barcode-stream", foundBarcode);
          } else {
            const endTime = performance.now();
            const timeDiff = (endTime - startTime) / 1000;
            console.log(`Barcode ${barcode.barcode} was not found at openfoodfacts API after ${timeDiff}`);
          }
        })
        .catch((error) => {
          console.error("Could not decode openfoodfacts response:", error);
        });
    } else {
      const endTime = performance.now();
      const timeDiff = (endTime - startTime) / 1000;
      console.log(`OpenFoodFacts has no product for barcode ${barcode} after ${timeDiff}s`);
    }
  });
}
