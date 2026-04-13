import Barcode from "@/lib/barcode";
import { OpenFoodFactsResult } from "@/interfaces/json-objects";

export default class ProductLookup {
  //
  async lookupOpenFoodFacts(barcode: Barcode): Promise<OpenFoodFactsResult> {
    const response = await fetch(
      `${process.env.OPENFOODFACTS_BASE_URL}/api/v2/product/${encodeURIComponent(barcode.barcode)}?product_type=all`,
      {
        method: "GET",
        headers: {
          Authorization: "Basic " + btoa("off:off"),
          "User-Agent": "GrocyBarcodeWizard/0.1 (liannaee@gmail.com)",
        },
      },
    );
    return await response.json();
  }
  //
}
