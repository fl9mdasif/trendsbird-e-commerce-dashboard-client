"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import { useCreatePermissionMutation } from "@/redux/api/permissionApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import {  showErrorToast } from "@/lib/utils";
import { ArrowLeft, Loader2, Save, Shield } from "lucide-react";

const ACTIONS = [
  { id: "read", label: "Read / Watch (View items)" },
  { id: "create", label: "Create (Add new item)" },
  { id: "update", label: "Update (Edit existing item)" },
  { id: "delete", label: "Delete (Remove item)" },
];

export default function NewPermissionGroupPage() {
  const router = useRouter();
  const [moduleName, setModuleName] = useState("");
  const [selectedActions, setSelectedActions] = useState<string[]>(["read", "create", "update", "delete"]);
  const [createPermission, { isLoading }] = useCreatePermissionMutation();

  const handleActionToggle = (actionId: string) => {
    setSelectedActions((prev) =>
      prev.includes(actionId)
        ? prev.filter((a) => a !== actionId)
        : [...prev, actionId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = moduleName.toLowerCase().trim();

    if (!cleanName) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid module name.",
        type: "error",
      });
      return;
    }

    if (selectedActions.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one action.",
        type: "error",
      });
      return;
    }

    try {
      // Generate individual permission names e.g. product:create, product:read
      const permissionNames = selectedActions.map((act) => {
        const action = act === "watch" ? "read" : act;
        return `${cleanName}:${action}`;
      });

      // Create each action permission record in the database
      let successCount = 0;
      for (const permName of permissionNames) {
        try {
          const actionWord = permName.split(":")[1] || "manage";
          await createPermission({
            name: permName,
            description: `Can ${actionWord} ${cleanName}`,
            group: cleanName,
            module: cleanName,
          }).unwrap();
          successCount++;
        } catch {
          // Ignore duplicate permission creation errors if single exists
        }
      }

      toast({
        title: "Permissions Created",
        description: `Successfully created ${successCount} permission actions for '${cleanName}'.`,
        type: "success",
      });

      router.push("/permissions");
    } catch (err: unknown) {
      showErrorToast(err, "Failed to create permission group.");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title="Create Permission Group"
        description="Add a new system module and assign applicable permission actions in one step."
      >
        <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Group Configuration
            </CardTitle>
            <CardDescription>
              Define the module name and check actions. This will produce permissions like <code className="text-primary font-mono">{moduleName || "module"}:create</code> and <code className="text-primary font-mono">{moduleName || "module"}:read</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="moduleName">Module / Feature Name *</Label>
              <Input
                id="moduleName"
                placeholder="e.g. inventory, coupon, order, analytics"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Example: Naming group <code className="font-mono text-primary">inventory</code> and selecting Read and Create produces <code className="font-mono text-primary">inventory:read</code> and <code className="font-mono text-primary">inventory:create</code>.
              </p>
            </div>

            <div className="space-y-3">
              <Label>Allowed Actions *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {ACTIONS.map((action) => {
                  const isChecked = selectedActions.includes(action.id);
                  return (
                    <div
                      key={action.id}
                      onClick={() => handleActionToggle(action.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-primary/10 border-primary text-foreground"
                          : "bg-card border-border hover:bg-accent text-muted-foreground"
                      }`}
                    >
                      <Checkbox
                        id={action.id}
                        checked={isChecked}
                        onCheckedChange={() => handleActionToggle(action.id)}
                      />
                      <Label htmlFor={action.id} className="cursor-pointer text-sm font-medium">
                        {action.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Permission Group
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
