import { Page } from '@playwright/test';

// Types

/** Product detail info returned by the product API */
export interface ProductInfo {
  code: string;
  name: string;
  description?: string;
  price?: {
    value: number;
    currency: string;
  };
  purchasable?: boolean;
  salesStatus?: string;
  stock?: {
    stockLevel: number;
    stockLevelStatus: string;
  };
  variantOptions?: Array<{
    code: string;
    stock?: {
      stockLevel: number;
      stockLevelStatus: string;
    };
  }>;
  addedServices?: string[];
  [key: string]: unknown;
}

/** Product entry returned by the search API */
export interface SearchProduct {
  familyRecord: string;
  familyId: string;
  modelCount: string;
  fmyMarketingName: string;
  fmyEngName: string;
  categorySubTypeCode: string;
  categorySubTypeEngName: string;
  categorySubTypeName: string;
  productGroupId: string;
  modelList: Array<{
    modelCode: string;
    modelName: string;
    displayName: string;
    pdpUrl: string;
    price?: Record<string, unknown>;
    priceDisplay?: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

/** Top-level response from the search API */
export interface SearchResponse {
  response?: {
    resultData?: {
      productList?: SearchProduct[];
    };
  };
  [key: string]: unknown;
}

/** Thrown when an API request fails */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public statusText: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

function createApiHeaders() {
  return {
    'Accept': 'application/json',
  };
}

function logApiResponse(sku: string, data: ProductInfo, url: string): void {
  console.log(`[PRODUCT_API] OK - SKU: ${sku}`);
  console.log(`[PRODUCT_API] URL: ${url}`);

  const logData: any = {
    code:                data.code,
    purchasable:         data.purchasable,
    salesStatus:         data.salesStatus,
    variantOptionsCount: data.variantOptions?.length || 0,
    addedServices:       data.addedServices,
  };

  if (data.stock) {
    logData.stock = data.stock;
  }

  console.log('[PRODUCT_API] Details:', logData);
}

/** Logs the product that was actually selected (called by external modules) */
export function logSelectedProduct(product: SearchProduct, modelIndex: number = 0): void {
  if (product.modelList && product.modelList.length > modelIndex) {
    const selectedModel = product.modelList[modelIndex];
    console.log('[SELECTED_PRODUCT] Selected product:', {
      productName:  product.fmyMarketingName,
      modelCode:    selectedModel.modelCode,
      modelName:    selectedModel.modelName,
      displayName:  selectedModel.displayName,
      pdpUrl:       selectedModel.pdpUrl,
      price:        selectedModel.price,
      priceDisplay: selectedModel.priceDisplay,
    });
  }
}

// API functions

/**
 * Fetches full product detail by SKU.
 * Calls fields=FULL to include variantOptions.
 */
export async function fetchProductInfo(
  page: Page,
  sku: string,
  siteCode: string
): Promise<ProductInfo> {
  const url = `https://api.shop.demostore.example.com/commerce/v2/${siteCode}/products/${sku}?fields=FULL`;

  console.log(`[PRODUCT_API] Fetching - SKU: ${sku}, site: ${siteCode}`);
  console.log(`[PRODUCT_API] Request URL: ${url}`);

  try {
    const response = await page.request.get(url, {
      headers: createApiHeaders(),
    });

    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
    }

    const responseData = await response.json() as ProductInfo;

    if (!responseData || typeof responseData !== 'object') {
      throw new APIError(
        `Invalid response format for SKU: ${sku}`,
        response.status(),
        'Response is not a valid JSON object'
      );
    }

    logApiResponse(sku, responseData, url);

    return responseData;
  } catch (error) {
    console.log(`[PRODUCT_API] Failed - SKU: ${sku}`, error);

    if (error instanceof SyntaxError) {
      throw new APIError(
        `JSON parsing failed for SKU: ${sku}`,
        0,
        `Invalid JSON response: ${error.message}`
      );
    }

    if (error instanceof Error) {
      throw new APIError(
        `Product information retrieval failed (SKU: ${sku})`,
        0,
        error.message
      );
    }
    throw error;
  }
}

/**
 * Searches for products using the Product Search API.
 *
 * @param page      - Playwright page object
 * @param type      - Product type code (e.g. 01010000 = smartphone)
 * @param siteCode  - Site code (e.g. uk, au)
 * @param filter    - Additional filter query string
 * @param limit     - Max number of results
 */
export async function searchProducts(
  page: Page,
  type: string,
  siteCode: string,
  filter: string = '',
  limit: number = 10
): Promise<SearchProduct[]> {
  const searchAPIPath = 'global';
  const url = `https://searchapi.demostore.example.com/v6/b2c/product/finder/${searchAPIPath}?type=${type}&siteCode=${siteCode}&start=1&num=${limit}&sort=onlineavailability&onlyFilterInfoYN=N&keySummaryYN=Y&${filter}`;

  console.log(`[SEARCH_API] Searching - type: ${type}, site: ${siteCode}, limit: ${limit}`);
  console.log(`[SEARCH_API] Request URL: ${url}`);

  try {
    const response = await page.request.get(url, {
      headers: createApiHeaders(),
    });

    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
    }

    const data = await response.json() as SearchResponse;

    console.log(`[SEARCH_API] OK - type: ${type}`);
    console.log(`[SEARCH_API] Results: ${data.response?.resultData?.productList?.length || 0} products`);

    if (data.response?.resultData?.productList) {
      const productList = data.response.resultData.productList;

      if (productList.length > 0) {
        console.log(`[SEARCH_API] Product list (${productList.length}):`);

        productList.forEach((product, index) => {
          console.log(`[SEARCH_API] #${index + 1}: ${product.fmyMarketingName} (${product.modelList?.length || 0} models)`);
          if (product.modelList && product.modelList.length > 0) {
            const firstModel = product.modelList[0];
            console.log(`[SEARCH_API]   first model: ${firstModel.modelCode} (${firstModel.displayName})`);
          }
        });

        const firstProduct = productList[0];
        if (firstProduct.modelList && firstProduct.modelList.length > 0) {
          const firstModel = firstProduct.modelList[0];
          console.log('[SEARCH_API] First product details:', {
            modelCode:    firstModel.modelCode,
            modelName:    firstModel.modelName,
            displayName:  firstModel.displayName,
            pdpUrl:       firstModel.pdpUrl,
            price:        firstModel.price,
            priceDisplay: firstModel.priceDisplay,
          });
        }
      }

      return productList;
    }

    console.log('[SEARCH_API] No products found');
    return [];
  } catch (error) {
    console.log(`[SEARCH_API] Failed - type: ${type}`, error);
    if (error instanceof Error) {
      throw new APIError(
        `Product search failed (Type: ${type})`,
        0,
        error.message
      );
    }
    throw error;
  }
}
