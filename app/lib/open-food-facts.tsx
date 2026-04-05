import { OpenFoodFactsProduct, OpenFoodFactsResult } from "@/interfaces/json-objects";
import Barcode from "./barcode";
import * as JsonDecoder from "ts.data.json";
import ProductLookup from "@/lib/lookup";
import { globalEvents } from "./events";

const openFoodFactsProductDecoder = JsonDecoder.object<OpenFoodFactsProduct>(
  {
    product_name_en: JsonDecoder.string(),
  },
  "OpenFoodFactsProduct",
);

const openFoodFactsDecoder = JsonDecoder.object<OpenFoodFactsResult>(
  {
    status: JsonDecoder.number(),
    product: openFoodFactsProductDecoder,
  },
  "OpenFoodFactsResult",
);

export function findProductInOpenFoodFacts(barcode: Barcode): void {
  openFoodFactsDecoder
    .decodePromise(new ProductLookup().lookupOpenFoodFacts(barcode))
    .then((openFoodFactsResult: OpenFoodFactsResult) => {
      if (openFoodFactsResult.status) {
        const foundBarcode: Barcode = new Barcode({
          barcode: barcode.barcode,
          name: openFoodFactsResult.product.product_name_en,
        });
        console.log(`Found openfoodfacts product as ${foundBarcode.name}`);
        globalEvents.emit("product-barcode-stream", foundBarcode);
      } else {
        console.log(
          `Barcode ${barcode.barcode} was not found at openfoodfacts API`,
        );
      }
    })
    .catch((error) => {
      console.error("Could not decode openfoodfacts response:", error);
    });
}

