import { useAppSelector } from "@/redux/hooks";

export const usePermission = () => {
  const permissions = useAppSelector((state) => state.auth.permissions) || [];

  return {
    permissions,
    can: (permission: string) => permissions.includes(permission),
    canAny: (perms: string[]) => perms.some((p) => permissions.includes(p)),
    canAll: (perms: string[]) => perms.every((p) => permissions.includes(p)),
  };
};

export default usePermission;
