import Barcode from "@/app/lib/barcode";

export default class ProductLookup {
  //
  lookupOpenFoodFacts(barcode: Barcode): Promise<any> {
    //
    return fetch(
      `${process.env.OPENFOODFACTS_BASE_URL}/api/v2/product/${encodeURIComponent(barcode.barcode)}?product_type=all`,
      {
        method: "GET",
        headers: {
          Authorization: "Basic " + btoa("off:off"),
          "User-Agent": "GrocyBarcodeWizard/0.1 (liannaee@gmail.com)",
        },
      },
    )
      .then((response) => response.json())
      .catch((err: Error) => {
        console.error("Couldn't look up at openfoodfacts API:", err);
      });
  }
  //
}
