import { IPermission } from "@/types/common";

export interface IFormattedModule {
  module: string;
  actions: string[];
}

export const DEFAULT_MODULES: IFormattedModule[] = [
  { module: "dashboard", actions: ["watch", "read"] },
  { module: "permission", actions: ["watch", "read", "create", "update", "delete"] },
  { module: "role", actions: ["watch", "read", "create", "update", "delete"] },
  { module: "user", actions: ["watch", "read", "create", "update", "delete"] },
  { module: "media", actions: ["watch", "read", "create", "update", "delete", "upload"] },
  { module: "category", actions: ["watch", "read", "create", "update", "delete"] },
  { module: "brand", actions: ["watch", "read", "create", "update", "delete"] },
  { module: "attribute", actions: ["watch", "read", "create", "update", "delete"] },
  { module: "product", actions: ["watch", "read", "create", "update", "delete"] },
];

/**
 * Format flat permissions list into grouped modules with unique actions
 */
export function formatPermissionsToModules(permissionsList: IPermission[]): IFormattedModule[] {
  if (!permissionsList || permissionsList.length === 0) return DEFAULT_MODULES;

  const groups: Record<string, string[]> = {};

  permissionsList.forEach((item) => {
    const name = item.name;
    if (name && typeof name === "string") {
      if (name.includes(":")) {
        const [mod, act] = name.split(":");
        const cleanMod = mod.toLowerCase().trim();
        const cleanAct = act.toLowerCase().trim();
        if (!groups[cleanMod]) groups[cleanMod] = [];
        if (!groups[cleanMod].includes(cleanAct)) groups[cleanMod].push(cleanAct);
      } else {
        const cleanMod = name.toLowerCase().trim();
        if (!groups[cleanMod]) groups[cleanMod] = [];
        if (!groups[cleanMod].includes("read")) groups[cleanMod].push("read");
      }
    }
  });

  const allModulesSet = new Set([
    ...DEFAULT_MODULES.map((m) => m.module),
    ...Object.keys(groups),
  ]);

  return Array.from(allModulesSet).map((mod) => {
    const dbActions = groups[mod] || [];
    const defaultActions = DEFAULT_MODULES.find((m) => m.module === mod)?.actions || [];
    const mergedActions = Array.from(new Set([...dbActions, ...defaultActions]));

    return {
      module: mod,
      actions: mergedActions,
    };
  });
}

/**
 * Filter formatted modules by search term
 */
export function filterFormattedModules(modules: IFormattedModule[], searchTerm: string): IFormattedModule[] {
  if (!searchTerm.trim()) return modules;
  const term = searchTerm.toLowerCase().trim();
  return modules.filter((m) => m.module.toLowerCase().includes(term));
}

/**
 * Filter raw permissions list by search term
 */
export function filterRawPermissions(permissionsList: IPermission[], searchTerm: string): IPermission[] {
  if (!searchTerm.trim()) return permissionsList;
  const term = searchTerm.toLowerCase().trim();
  return permissionsList.filter((item) => (item.name || "").toLowerCase().includes(term));
}
