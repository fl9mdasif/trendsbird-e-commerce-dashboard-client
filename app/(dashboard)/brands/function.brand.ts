import { IBrand } from "@/types/common";

/**
 * Filter brands list by search term
 */
export function filterBrandsBySearch(brandsList: IBrand[], searchTerm: string): IBrand[] {
  if (!searchTerm.trim()) return brandsList;
  const term = searchTerm.toLowerCase().trim();
  return brandsList.filter((b) => b.name.toLowerCase().includes(term));
}
