import { ICategory } from "@/types/common";

/**
 * Filter nested category tree nodes by search term recursively
 */
export function filterCategoryTree(nodes: ICategory[], searchTerm: string): ICategory[] {
  if (!searchTerm.trim()) return nodes;
  const lowerTerm = searchTerm.toLowerCase().trim();

  return nodes
    .map((node) => {
      const nameMatches = node.name.toLowerCase().includes(lowerTerm);
      const filteredChildren = node.children ? filterCategoryTree(node.children, searchTerm) : [];

      if (nameMatches || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        };
      }
      return null;
    })
    .filter((n): n is ICategory => n !== null);
}
