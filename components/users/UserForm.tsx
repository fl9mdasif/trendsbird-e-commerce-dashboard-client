"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useGetAllRolesQuery } from "@/redux/api/roleApi";
import { User, Mail, Lock, Shield, Loader2, Save } from "lucide-react";
import { IUser, IRole } from "@/types/common";

interface UserFormProps {
  initialData?: IUser | null;
  onSubmit: (formData: {
    name: string;
    email: string;
    password?: string;
    roleId: string;
    active: boolean;
  }) => Promise<void>;
  isLoading?: boolean;
  isEditMode?: boolean;
  title: string;
  description: string;
}

export default function UserForm({
  initialData,
  onSubmit,
  isLoading = false,
  isEditMode = false,
  title,
  description,
}: UserFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<string>(
    typeof initialData?.role === "object" && initialData?.role !== null
      ? initialData.role.id
      : initialData?.roleId || ""
  );
  const [active, setActive] = useState(initialData?.active ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch roles list for selection
  const { data: rolesResponse, isLoading: isLoadingRoles } = useGetAllRolesQuery();
  const rolesList: IRole[] = rolesResponse ?.data || rolesResponse || [];

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required";
    if (!email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Invalid email format";
    }

    if (!isEditMode && !password) {
      errs.password = "Password is required for new user";
    } else if (!isEditMode && password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }

    if (!roleId) errs.roleId = "Role selection is required";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      name: name.trim(),
      email: email.trim(),
      ...(password ? { password } : {}),
      roleId,
      active,
    });
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-md border border-border">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-500" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="font-semibold text-sm">
              Full Name *
            </Label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="pl-9"
              />
            </div>
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <Label htmlFor="email" className="font-semibold text-sm">
              Email Address *
            </Label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. john@trendsbird.com"
                className="pl-9"
              />
            </div>
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          {/* Password (Required for create, optional for edit) */}
          <div className="space-y-2">
            <Label htmlFor="password" className="font-semibold text-sm">
              {isEditMode ? "New Password (Leave blank to keep unchanged)" : "Password *"}
            </Label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditMode ? "••••••••" : "Minimum 6 characters"}
                className="pl-9"
              />
            </div>
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
          </div>

          {/* Role Picker */}
          <div className="space-y-2">
            <Label htmlFor="role" className="font-semibold text-sm">
              Assigned Role *
            </Label>
            <Select value={roleId} onValueChange={(val) => setRoleId(val || "")} disabled={isLoadingRoles}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  <SelectValue placeholder={isLoadingRoles ? "Loading roles..." : "Select user role..."} />
                </div>
              </SelectTrigger>
              <SelectContent>
                {rolesList.map((r) => {
                  const rId = r.id || r._id || "";
                  return (
                    <SelectItem key={rId} value={rId}>
                      <div className="flex flex-col">
                        <span className="font-medium capitalize">{r.name}</span>
                        {r.description && (
                          <span className="text-xs text-muted-foreground">{r.description}</span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.roleId && <p className="text-xs text-destructive mt-1">{errors.roleId}</p>}
          </div>

          {/* Active Status Switch */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/60">
            <div className="space-y-0.5">
              <Label htmlFor="active-status" className="font-semibold text-sm cursor-pointer">
                Account Status Active
              </Label>
              <p className="text-xs text-muted-foreground">
                Disabled users will not be able to log in or access the system.
              </p>
            </div>
            <Switch
              id="active-status"
              checked={active}
              onCheckedChange={setActive}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={isLoading}
              className="gap-2 px-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditMode ? "Save Changes" : "Create User"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
