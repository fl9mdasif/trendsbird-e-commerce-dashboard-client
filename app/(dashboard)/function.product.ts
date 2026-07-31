import { IProduct } from "@/types/common";

/**
 * Format currency price display for simple or variable products
 */
export function formatProductPrice(product: IProduct): {
  mainPrice: string;
  salePrice?: string | null;
} {
  if (product.hasVariants && product.variants && product.variants.length > 0) {
    const prices = product.variants.map((v) => v.salePrice || v.price).filter(Boolean);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return { mainPrice: `$${minPrice.toFixed(2)}` };
    }
    return { mainPrice: `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}` };
  }

  const price = product.price ?? 0;
  const salePrice = product.salePrice;

  return {
    mainPrice: `$${price.toFixed(2)}`,
    salePrice: salePrice ? `$${salePrice.toFixed(2)}` : null,
  };
}

/**
 * Safely extract thumbnail image URL from product media links
 */
export function extractProductThumbnail(product: IProduct): string | null {
  if (product.media && product.media.length > 0) {
    const firstMedia = product.media[0]?.media;
    if (firstMedia) {
      return firstMedia.thumbnailUrl || firstMedia.url || null;
    }
  }
  return null;
}

/**
 * Calculate total stock units across simple product or variant options
 */
export function formatProductStock(product: IProduct): { text: string; count: number; isLow: boolean } {
  if (product.hasVariants && product.variants && product.variants.length > 0) {
    const totalStock = product.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
    return {
      text: `${totalStock} in stock (${product.variants.length} variants)`,
      count: totalStock,
      isLow: totalStock < 10,
    };
  }

  const stock = product.stock ?? 0;
  return {
    text: `${stock} in stock`,
    count: stock,
    isLow: stock < 10,
  };
}

/**
 * Filter products array by search keyword
 */
export function filterProductsBySearch(products: IProduct[], term: string): IProduct[] {
  if (!term.trim()) return products;
  const lowerTerm = term.toLowerCase().trim();
  return products.filter((p) => {
    const nameMatch = p.name.toLowerCase().includes(lowerTerm);
    const skuMatch = (p.sku || "").toLowerCase().includes(lowerTerm);
    const brandMatch = (p.brand?.name || "").toLowerCase().includes(lowerTerm);
    return nameMatch || skuMatch || brandMatch;
  });
}
