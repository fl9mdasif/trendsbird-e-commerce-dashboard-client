import { ICategory } from "@/types/common";

/**
 * Builds a strict multi-level hierarchical tree structure from categories array.
 * Recursively flattens any pre-nested or flat inputs and attaches children to their true parentId.
 */
export function buildTreeFromCategories(items: ICategory[]): ICategory[] {
  if (!items || items.length === 0) return [];

  const map = new Map<string, ICategory>();

  // Flatten any pre-existing nested structures to rebuild pure tree references
  const registerNodes = (nodes: ICategory[]) => {
    nodes.forEach((node) => {
      const id = node.id || node._id || "";
      if (id && !map.has(id)) {
        map.set(id, { ...node, children: [] });
      }
      if (node.children && node.children.length > 0) {
        registerNodes(node.children);
      }
    });
  };

  registerNodes(items);

  const roots: ICategory[] = [];

  map.forEach((node) => {
    const parentId = node.parentId;
    if (parentId && map.has(parentId)) {
      const parent = map.get(parentId)!;
      if (!parent.children) parent.children = [];
      const exists = parent.children.some(
        (c) => (c.id || c._id) === (node.id || node._id)
      );
      if (!exists) {
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}

/**
 * Filter nested category tree nodes by search term recursively
 */
export function filterCategoryTree(nodes: ICategory[], searchTerm: string): ICategory[] {
  if (!searchTerm.trim()) return nodes;
  const lowerTerm = searchTerm.toLowerCase().trim();

  return nodes.reduce<ICategory[]>((acc, node) => {
    const nameMatches = node.name.toLowerCase().includes(lowerTerm);
    const filteredChildren = node.children ? filterCategoryTree(node.children, searchTerm) : [];

    if (nameMatches || filteredChildren.length > 0) {
      acc.push({
        ...node,
        children: filteredChildren,
      });
    }
    return acc;
  }, []);
}
