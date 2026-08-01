"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-background text-foreground relative">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Topbar />
        
        {/* Floating Sidebar Toggle Button on main area when collapsed */}
        {isSidebarCollapsed && (
          <div className="px-6 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarCollapsed(false)}
              className="gap-2 text-xs font-semibold bg-card hover:bg-accent border-border shadow-sm text-indigo-400"
              title="Show Sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
              <span>Show Navigation Sidebar</span>
            </Button>
          </div>
        )}

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
