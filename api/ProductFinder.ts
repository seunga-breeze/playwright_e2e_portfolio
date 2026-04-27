import { Page } from '@playwright/test';
import { ProductInfo as ApiProductInfo, fetchProductInfo, searchProducts } from './ApiClient';

// Types

/** Unified product info returned to tests */
export interface ProductInfo {
  url: string;
  sku: string;
  deviceName?: string;
  stock?: string;
  color?: string;
  storage?: string;
  size?: string;
  capacity?: string;
  power?: string;
  hasTradeUp?: boolean;
  hasTradeIn?: boolean;
  productType?: string;
}

// Constants

/** Valid stock statuses */
const OK_STOCK_STATUSES = ['inStock', 'InStock', 'preOrder', 'lowStock'];

/** Product type codes */
const PRODUCT_TYPES = [
  '01010000', // smartphone
  '01020000', // tablet
  '01030000', // watch
  '01040000', // buds
];

/** Checks if a product is purchasable and in stock */
export function isValidProduct(info: ApiProductInfo): boolean {
  if (!info.purchasable || info.salesStatus !== 'PURCHASABLE') {
    return false;
  }

  if (!info.variantOptions) {
    return false;
  }

  return info.variantOptions.some((variant) => {
    const stock = variant.stock;
    if (!stock || variant.code !== info.code) {
      return false;
    }

    const stockLevel  = stock.stockLevel;
    const stockStatus = stock.stockLevelStatus;

    return OK_STOCK_STATUSES.includes(stockStatus) &&
           typeof stockLevel === 'number' &&
           stockLevel >= 3;
  });
}

/** Validates a SKU against the product API */
export async function isSKUValid(
  page: Page,
  sku: string,
  siteCode: string
): Promise<boolean> {
  try {
    const info = await fetchProductInfo(page, sku, siteCode);
    return isValidProduct(info);
  } catch (error) {
    return false;
  }
}

/** Returns true if the model is valid for selection */
function isValidModel(model: any): boolean {
  return !model.configuratorUrl &&
         model.marketingpdpYN !== 'Y' &&
         !model.modelCode?.toString().startsWith('F-');
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Finds a valid product URL by searching through available product types */
export async function getPD_IM1_Url(
  page: Page,
  siteCode: string,
  domain: string,
  existingSKU?: string
): Promise<string> {
  // Return immediately if existing SKU is still valid
  if (existingSKU && await isSKUValid(page, existingSKU, siteCode)) {
    return `${domain}/products/${existingSKU}`;
  }

  console.log(`[PD_IM1] Starting search - site: ${siteCode}`);

  for (const productType of PRODUCT_TYPES) {
    console.log(`[PD_IM1] Searching type: ${productType}`);

    try {
      const products        = await searchProducts(page, productType, siteCode, '', 10);
      const shuffledProducts = shuffleArray(products);

      for (const product of shuffledProducts) {
        const models = product.modelList;
        if (!models || models.length === 0) continue;

        const shuffledModels = shuffleArray(models);

        for (const model of shuffledModels) {
          if (!isValidModel(model)) continue;

          console.log(`[PD_IM1] Checking model: ${model.modelCode} (${model.displayName})`);

          try {
            const info = await fetchProductInfo(page, model.modelCode, siteCode);

            if (isValidProduct(info)) {
              // Normalize pdpUrl to a relative path
              let pdpPath = model.pdpUrl;

              if (pdpPath.startsWith(`/${siteCode}/`)) {
                pdpPath = pdpPath.substring(`/${siteCode}/`.length);
              } else if (pdpPath.startsWith('/')) {
                pdpPath = pdpPath.substring(1);
              }

              let url = `${domain}/${pdpPath}`;

              // Append /buy for simple PD pages
              if (product.simplePdYN === 'Y') {
                url += url.endsWith('/') ? 'buy' : '/buy';
              }

              console.log(`[PD_IM1] Valid product found: ${model.modelCode}`);
              console.log(`[PD_IM1] Generated URL: ${url}`);

              return url;
            }
          } catch (error) {
            console.log(`[PD_IM1] Model validation failed: ${model.modelCode}`, error);
            continue;
          }
        }
      }
    } catch (error) {
      console.log(`[PD_IM1] Product type ${productType} search failed:`, error);
      continue;
    }
  }

  console.log('[PD_IM1] Warning: no valid product found');
  return `${domain}/products/not-found`;
}
