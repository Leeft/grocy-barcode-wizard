import Barcode from "@/lib/barcode";

export default class ExternalLookup {
  async lookupOpenFoodFacts(barcode: Barcode) {
    const uriBarcode = encodeURIComponent(barcode.code.trim());
    if ( uriBarcode.length < 8 ) {
      return;
    }

    console.log(`Doing OFF lookup for ${uriBarcode}`);
    
    return fetch(`${process.env.OPENFOODFACTS_BASE_URL}/api/v2/product/${uriBarcode}?product_type=all`, {
      method: "GET",
      cache: "force-cache",
      headers: {
        Authorization: "Basic " + btoa("off:off"),
        "User-Agent": "GrocyBarcodeWizard/0.1 (liannaee@gmail.com)",
      },
      next: {
        revalidate: 86400,
      },
    });
  }
}
