export type OpenFoodFactsProduct = {
  product_name_en: string;
};

export type OpenFoodFactsResult = {
  status: number;
  product: OpenFoodFactsProduct;
};

export type ReceivedBarcode = {
  barcode: string;
};