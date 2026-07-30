import { useAppSelector } from "@/redux/hooks";

export const usePermission = () => {
  const user = useAppSelector((state) => state.auth.user) as any;
  const permissions = useAppSelector((state) => state.auth.permissions) || [];

  const roleName =
    typeof user?.role === "string"
      ? user.role.toLowerCase()
      : typeof user?.role?.name === "string"
      ? user.role.name.toLowerCase()
      : typeof user?.role?.title === "string"
      ? user.role.title.toLowerCase()
      : "";

  const isSuperAdmin =
    roleName.includes("superadmin") ||
    roleName.includes("super_admin") ||
    roleName.includes("super admin") ||
    roleName === "admin";

  const hasSinglePermission = (perm: string) => {
    if (isSuperAdmin) return true;
    if (!permissions || permissions.length === 0) return true;
    if (permissions.includes(perm)) return true;

    // Handle equivalency between 'watch' and 'read'
    if (perm.endsWith(":watch")) {
      const readAlias = perm.replace(":watch", ":read");
      if (permissions.includes(readAlias)) return true;
    } else if (perm.endsWith(":read")) {
      const watchAlias = perm.replace(":read", ":watch");
      if (permissions.includes(watchAlias)) return true;
    }

    return false;
  };

  return {
    permissions,
    isSuperAdmin,
    can: (permission: string) => hasSinglePermission(permission),
    canAny: (perms: string[]) => {
      if (isSuperAdmin) return true;
      if (!permissions || permissions.length === 0) return true;
      return perms.some((p) => hasSinglePermission(p));
    },
    canAll: (perms: string[]) => {
      if (isSuperAdmin) return true;
      if (!permissions || permissions.length === 0) return true;
      return perms.every((p) => hasSinglePermission(p));
    },
  };
};

export default usePermission;
