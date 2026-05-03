export type OpenFoodFactsProduct = {
  product_name_en: string;
};

export type OpenFoodFactsResult = {
  code: string;
  status: number;
  status_verbose: string;
  product?: OpenFoodFactsProduct;
};

export type OpenFoodFactsNotFoundResult = {
  code: string;
  status: number;
  status_verbose: string;
};

export type ReceivedBarcode = {
  barcode: string;
};
export type ReceivedApiKey = {
  apikey: string;
};
