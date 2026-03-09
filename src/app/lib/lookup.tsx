import { Barcode } from "@/interfaces";
import { globalEvents } from "./events";

export default class ProductLookup {
  lookupOpenFoodFacts(barcode: Barcode) {
    fetch(`${process.env.OPENFOODFACTS_BASE_URL}/api/v2/product/${encodeURIComponent(barcode.barcode)}?product_type=all`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + btoa("off:off"),
        "User-Agent": "GrocyWizard/0.1 (liannaee@gmail.com)",
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          barcode.name = json.product.product_name_en;
          console.log(`found openfoodfacts product as ${json.product.product_name_en}`);
          globalEvents.emit("product-match", barcode); // Notify all connected SSE clients
          //console.log( barcode );
          //console.log( JSON.stringify(json) );
          //console.log(json);
        } else {
          console.log(`barcode ${barcode.barcode} not found at openfoodfacts API`);
        }
      });
  }
}
