"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { usePermission } from "@/hooks/usePermission";
import {
  LayoutDashboard,
  Shield,
  Users,
  User,
  Image as ImageIcon,
  Tag,
  Briefcase,
  Sliders,
  Package,
  Store,
  Sparkles,
} from "lucide-react";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/", permission: "dashboard:watch", icon: LayoutDashboard, category: "Main" },
  { label: "Products", href: "/products", permission: "product:watch", icon: Package, category: "Catalog" },
  { label: "Categories", href: "/categories", permission: "category:watch", icon: Tag, category: "Catalog" },
  { label: "Brands", href: "/brands", permission: "brand:watch", icon: Briefcase, category: "Catalog" },
  { label: "Attributes", href: "/attributes", permission: "attribute:watch", icon: Sliders, category: "Catalog" },
  { label: "Media Library", href: "/media", permission: "media:watch", icon: ImageIcon, category: "Assets" },
  { label: "Roles", href: "/roles", permission: "role:watch", icon: Users, category: "Security" },
  { label: "Permissions", href: "/permissions", permission: "permission:watch", icon: Shield, category: "Security" },
  { label: "Users", href: "/users", permission: "user:watch", icon: User, category: "Security" },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { can, permissions } = usePermission();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!permissions || permissions.length === 0) return true;
    return can(item.permission);
  });

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950 text-slate-200 flex flex-col h-screen sticky top-0 z-30 shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3 bg-slate-950/50">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20">
          <Store className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-base tracking-tight leading-none text-white">
            Trends Bird
          </span>
          <span className="text-[11px] text-indigo-400 font-semibold mt-1 tracking-wide uppercase">
            Admin Panel
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar">
        {/* Render items by category */}
        {["Main", "Catalog", "Assets", "Security"].map((cat) => {
          const itemsInCat = visibleItems.filter((i) => i.category === cat);
          if (!itemsInCat.length) return null;

          return (
            <div key={cat} className="space-y-1.5">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {cat}
              </div>
              {itemsInCat.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20"
                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />
                    )}
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                        isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer Info Badge */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="truncate font-medium">Intern Developer Assessment</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
