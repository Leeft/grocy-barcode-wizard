import type { paths, components } from "./grocy.d"

export type Product = components["schemas"]["Product"]
export type QuantityUnit = components["schemas"]["QuantityUnit"]
export type ProductLocation = components["schemas"]["Location"]

export type ObjectByIdEndPointParams = paths["/objects/{entity}/{objectId}"]["parameters"]
export type ProductBarcodeEndPointParams = paths["/stock/products/by-barcode/{barcode}"]["parameters"]
