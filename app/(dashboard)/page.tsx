"use client";

import React from "react";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Package,
  Users,
  Shield,
  Tag,
  Briefcase,
  Image as ImageIcon,
  ArrowRight,
  Sliders,
  Sparkles,
  Zap,
  CheckCircle2,
} from "lucide-react";

const STATS_CARDS = [
  {
    title: "Products Catalog",
    description: "Manage simple & multi-variant items",
    href: "/products",
    icon: Package,
    badge: "Core",
    gradient: "from-blue-500/20 to-indigo-500/20 text-blue-500 border-blue-500/30",
  },
  {
    title: "Categories Tree",
    description: "Nested category hierarchy & parent selection",
    href: "/categories",
    icon: Tag,
    badge: "Catalog",
    gradient: "from-emerald-500/20 to-teal-500/20 text-emerald-500 border-emerald-500/30",
  },
  {
    title: "Brand Library",
    description: "Brands & logo media attacher",
    href: "/brands",
    icon: Briefcase,
    badge: "Catalog",
    gradient: "from-purple-500/20 to-pink-500/20 text-purple-500 border-purple-500/30",
  },
  {
    title: "Attributes & Hex Colors",
    description: "Attribute types, color pickers & inline values",
    href: "/attributes",
    icon: Sliders,
    badge: "Variants",
    gradient: "from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30",
  },
  {
    title: "Roles & Permission Matrix",
    description: "RBAC module-by-action grid & shortcuts",
    href: "/roles",
    icon: Shield,
    badge: "Security",
    gradient: "from-rose-500/20 to-red-500/20 text-rose-500 border-rose-500/30",
  },
  {
    title: "User Management",
    description: "Accounts, status toggle & self-role guard",
    href: "/users",
    icon: Users,
    badge: "Security",
    gradient: "from-indigo-500/20 to-violet-500/20 text-indigo-500 border-indigo-500/30",
  },
  {
    title: "Media Assets",
    description: "Single/multi uploader & gallery picker",
    href: "/media",
    icon: ImageIcon,
    badge: "Storage",
    gradient: "from-cyan-500/20 to-sky-500/20 text-cyan-500 border-cyan-500/30",
  },
];

export default function DashboardHomePage() {
  const user = useAppSelector((state) => state.auth.user);
  const displayName = user?.fullName || user?.name || user?.email || "Admin";

  return (
    <div className="space-y-8">
      {/* Modern Welcome Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 p-6 md:p-8 border border-indigo-900/40 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Trends Bird Limited Assessment</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, <span className="text-indigo-400">{displayName}</span> 👋
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your admin portal is fully initialized. Access permission-filtered modules below to manage users, catalog items, attributes, and role permissions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>API Active</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-900/40 border border-indigo-700/50 text-xs font-medium text-indigo-200">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>RBAC Engine</span>
            </div>
          </div>
        </div>
      </div>

      {/* Page Section Title */}
      <PageHeader
        title="Admin Modules Overview"
        description="Select a module to view, create, or update platform resources."
      />

      {/* Modern Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {STATS_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.href}
              className="group hover:border-indigo-500/40 hover:shadow-lg transition-all duration-200 bg-card/60 backdrop-blur-sm flex flex-col justify-between"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className={cn("p-2.5 rounded-xl border", card.gradient)}>
                  <Icon className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="text-[10px] font-medium tracking-wide">
                  {card.badge}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div>
                  <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {card.title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <Link
                  href={card.href}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "w-full justify-between font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200"
                  )}
                >
                  <span>Open Module</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
