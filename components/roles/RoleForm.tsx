"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { showErrorToast } from "@/lib/utils";
import { useGetAllPermissionsQuery } from "@/redux/api/permissionApi";
import { useAssignPermissionMutation, useRemovePermissionMutation } from "@/redux/api/roleApi";
import { Loader2, Save, Shield, CheckSquare, Square } from "lucide-react";

export const DEFAULT_SYSTEM_MODULES = [
  "dashboard",
  "permission",
  "role",
  "user",
  "media",
  "category",
  "brand",
  "attribute",
  "product",
  "report",
];

export const MODULE_ACTIONS = ["read", "create", "update", "delete"];

interface RoleFormProps {
  initialData?: {
    _id?: string;
    id?: string;
    name?: string;
    description?: string;
    permissions?: any[];
  };
  onSubmit: (data: {
    name: string;
    description: string;
    permissions: string[];
    permissionIds?: string[];
  }) => Promise<void>;
  isLoading?: boolean;
  title: string;
  description: string;
}

export const RoleForm: React.FC<RoleFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  title,
  description,
}) => {
  const router = useRouter();
  const roleId = initialData?.id || initialData?._id;
  const isEditMode = Boolean(roleId);

  const [name, setName] = useState(initialData?.name || "");
  const [roleDescription, setRoleDescription] = useState(initialData?.description || "");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Fetch all DB permissions (limit: 100)
  const { data: permissionsRes } = useGetAllPermissionsQuery({ page: 1, limit: 100 });
  const [assignPermission] = useAssignPermissionMutation();
  const [removePermission] = useRemovePermissionMutation();

  const rawDbPermissions = permissionsRes?.data || permissionsRes || [];

  // Map name / alias to DB permission ID
  const nameToIdMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    if (Array.isArray(rawDbPermissions)) {
      rawDbPermissions.forEach((item: any) => {
        if (item && item.id && item.name) {
          map[item.name] = item.id;
          if (item.name.endsWith(":read")) {
            map[item.name.replace(":read", ":watch")] = item.id;
          } else if (item.name.endsWith(":watch")) {
            map[item.name.replace(":watch", ":read")] = item.id;
          }
        }
      });
    }
    return map;
  }, [rawDbPermissions]);

  // Extract all unique module names from DB
  const systemModules = React.useMemo(() => {
    const modulesSet = new Set<string>(DEFAULT_SYSTEM_MODULES);
    if (Array.isArray(rawDbPermissions)) {
      rawDbPermissions.forEach((item: any) => {
        const permName = typeof item === "string" ? item : item.name || item.permission;
        if (permName && typeof permName === "string" && permName.includes(":")) {
          const [mod] = permName.split(":");
          if (mod) modulesSet.add(mod.toLowerCase().trim());
        }
      });
    }
    return Array.from(modulesSet);
  }, [rawDbPermissions]);

  useEffect(() => {
    if (initialData?.permissions && Array.isArray(initialData.permissions)) {
      const formatted = initialData.permissions
        .map((p) => {
          if (typeof p === "string") return p;
          if (typeof p === "object" && p !== null) {
            if (p.permission && typeof p.permission === "object") {
              return p.permission.name || p.permission.id || p.permissionId;
            }
            return p.name || p.permission || p.id || p.permissionId || "";
          }
          return "";
        })
        .filter((p): p is string => typeof p === "string" && Boolean(p));

      setSelectedPermissions(formatted);
    }
  }, [initialData]);

  // Helper check if permission is selected
  const isPermSelected = (moduleName: string, action: string) => {
    const key1 = `${moduleName}:${action}`;
    const key2 = action === "read" ? `${moduleName}:watch` : action === "watch" ? `${moduleName}:read` : key1;

    return selectedPermissions.some((p) => {
      if (typeof p !== "string") return false;
      return p === key1 || p === key2;
    });
  };

  // Single cell toggle with instant assign/remove API call if in Edit Mode
  const togglePermission = async (moduleName: string, action: string) => {
    const permKey = `${moduleName}:${action}`;
    const altKey = action === "read" ? `${moduleName}:watch` : action === "watch" ? `${moduleName}:read` : permKey;
    const isCurrentlySelected = isPermSelected(moduleName, action);

    // Update local state
    if (isCurrentlySelected) {
      setSelectedPermissions((prev) =>
        prev.filter((p) => typeof p === "string" && p !== permKey && p !== altKey)
      );
    } else {
      setSelectedPermissions((prev) => [...prev, permKey]);
    }

    // If editing existing role, fire assign/remove API immediately
    if (isEditMode && roleId) {
      const targetPermissionId = nameToIdMap[permKey] || nameToIdMap[altKey];
      if (targetPermissionId) {
        try {
          if (isCurrentlySelected) {
            await removePermission({ roleId, permissionId: targetPermissionId }).unwrap();
            toast({
              title: "Permission Removed",
              description: `Revoked ${permKey} from role.`,
              type: "info",
            });
          } else {
            await assignPermission({ roleId, permissionId: targetPermissionId }).unwrap();
            toast({
              title: "Permission Assigned",
              description: `Granted ${permKey} to role.`,
              type: "success",
            });
          }
        } catch (err: unknown) {
          showErrorToast(err, "Failed to update permission.");
        }
      }
    }
  };

  // Row (Module) Select All Shortcut
  const isRowSelected = (moduleName: string) => {
    return MODULE_ACTIONS.every((act) => isPermSelected(moduleName, act));
  };

  const toggleRow = (moduleName: string) => {
    const rowPerms = MODULE_ACTIONS.map((act) => `${moduleName}:${act}`);
    const allSelected = isRowSelected(moduleName);

    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((p) => typeof p === "string" && !p.startsWith(`${moduleName}:`))
      );
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...rowPerms])));
    }
  };

  // Column (Action) Select All Shortcut
  const isColumnSelected = (action: string) => {
    return systemModules.every((mod) => isPermSelected(mod, action));
  };

  const toggleColumn = (action: string) => {
    const colPerms = systemModules.map((mod) => `${mod}:${action}`);
    const allSelected = isColumnSelected(action);

    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((p) => {
          if (typeof p !== "string") return false;
          const [, act] = p.split(":");
          return act !== action && (action !== "read" || act !== "watch");
        })
      );
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...colPerms])));
    }
  };

  // Master Select All Matrix Shortcut
  const allMatrixPermissions = systemModules.flatMap((mod) =>
    MODULE_ACTIONS.map((act) => `${mod}:${act}`)
  );

  const isMasterSelected = allMatrixPermissions.every((p) => {
    const [mod, act] = p.split(":");
    return isPermSelected(mod, act);
  });

  const toggleMaster = () => {
    if (isMasterSelected) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(allMatrixPermissions);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a role name.",
        type: "error",
      });
      return;
    }

    const selectedDbNamesSet = new Set<string>();
    const selectedDbIdsSet = new Set<string>();

    selectedPermissions.forEach((p) => {
      if (typeof p === "string") {
        selectedDbNamesSet.add(p);
        if (nameToIdMap[p]) {
          selectedDbIdsSet.add(nameToIdMap[p]);
        }
        if (p.length === 36 && p.includes("-")) {
          selectedDbIdsSet.add(p);
        }
      }
    });

    const finalPermissions = Array.from(selectedDbNamesSet);
    const finalPermissionIds = Array.from(selectedDbIdsSet);

    await onSubmit({
      name: name.trim(),
      description: roleDescription.trim(),
      permissions: finalPermissions,
      permissionIds: finalPermissionIds,
    });
  };

  return (
    <form onSubmit={handleSubmitForm} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Content Manager, Inventory Manager"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Role Description</Label>
              <Input
                id="description"
                placeholder="Brief description of responsibilities..."
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permission Matrix Grid Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              Permission Matrix Grid
              <Badge variant="secondary" className="font-semibold">
                {selectedPermissions.length} Selected
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              Check actions to grant permissions. Toggling a checkbox automatically calls <code className="text-primary font-mono">POST /roles/:id/permissions</code> and <code className="text-primary font-mono">DELETE /roles/:id/permissions/:pid</code>.
            </CardDescription>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleMaster}
            className="gap-2 shrink-0"
          >
            {isMasterSelected ? (
              <CheckSquare className="w-4 h-4 text-primary" />
            ) : (
              <Square className="w-4 h-4 text-muted-foreground" />
            )}
            {isMasterSelected ? "Deselect All Matrix" : "Select All Matrix"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-48 font-bold text-foreground">
                    Module / Resource
                  </TableHead>
                  {MODULE_ACTIONS.map((action) => {
                    const colSelected = isColumnSelected(action);
                    return (
                      <TableHead key={action} className="text-center font-bold">
                        <div className="flex items-center justify-center gap-2">
                          <Checkbox
                            id={`col-${action}`}
                            checked={colSelected}
                            onCheckedChange={() => toggleColumn(action)}
                          />
                          <Label
                            htmlFor={`col-${action}`}
                            className="cursor-pointer capitalize font-semibold text-xs"
                          >
                            Select {action}
                          </Label>
                        </div>
                      </TableHead>
                    );
                  })}
                  <TableHead className="text-right w-28 font-bold">Row All</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {systemModules.map((moduleName) => {
                  const rowSelected = isRowSelected(moduleName);

                  return (
                    <TableRow key={moduleName} className="hover:bg-accent/40">
                      <TableCell className="font-semibold capitalize text-foreground py-3">
                        {moduleName}
                      </TableCell>
                      {MODULE_ACTIONS.map((action) => {
                        const isChecked = isPermSelected(moduleName, action);

                        return (
                          <TableCell key={action} className="text-center py-3">
                            <div className="flex items-center justify-center">
                              <Checkbox
                                id={`${moduleName}:${action}`}
                                checked={isChecked}
                                onCheckedChange={() => togglePermission(moduleName, action)}
                              />
                            </div>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right py-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => toggleRow(moduleName)}
                          className="text-xs text-primary font-medium"
                        >
                          {rowSelected ? "Deselect" : "Select Row"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Role Permissions
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default RoleForm;
