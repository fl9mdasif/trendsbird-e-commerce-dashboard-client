"use client";

import React from "react";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useGetAllProductsQuery } from "@/redux/api/productApi";
import { useGetAllCategoriesQuery } from "@/redux/api/categoryApi";
import { useGetAllBrandsQuery } from "@/redux/api/brandApi";
import { useGetAllAttributesQuery } from "@/redux/api/attributeApi";
import { useGetAllMediaQuery } from "@/redux/api/mediaApi";
import { TModuleListResponse } from "@/types/common";
import {
  Package,
  Tag,
  Briefcase,
  Image as ImageIcon,
  ArrowRight,
  Sliders,
  Sparkles,
  Zap,
  CheckCircle2,
  Loader2,
  TrendingUp,
} from "lucide-react";

/**
 * Clean helper function typed with TModuleListResponse to extract count safely
 */
function getCount(res: TModuleListResponse | undefined | null): number {
  if (!res) return 0;
  if ("meta" in res && typeof res.meta?.total === "number") {
    return res.meta.total;
  }
  if ("data" in res && Array.isArray(res.data)) {
    return res.data.length;
  }
  if (Array.isArray(res)) {
    return res.length;
  }
  return 0;
}

export default function DashboardHomePage() {
  const user = useAppSelector((state) => state.auth.user);
  const displayName =
    typeof user?.fullName === "string"
      ? user.fullName
      : typeof user?.name === "string"
      ? user.name
      : typeof user?.email === "string"
      ? user.email
      : "Admin";

  // Fetch full lists for the 5 specified modules without pagination restriction
  const { data: productsRes, isLoading: pLoading } = useGetAllProductsQuery({ limit: 100 });
  const { data: categoriesRes, isLoading: cLoading } = useGetAllCategoriesQuery();
  const { data: brandsRes, isLoading: bLoading } = useGetAllBrandsQuery();
  const { data: attributesRes, isLoading: aLoading } = useGetAllAttributesQuery();
  const { data: mediaRes, isLoading: mLoading } = useGetAllMediaQuery({ limit: 100 });

  // Clean count extraction using TModuleListResponse
  const productCount = getCount(productsRes as TModuleListResponse);
  const categoryCount = getCount(categoriesRes as TModuleListResponse);
  const brandCount = getCount(brandsRes as TModuleListResponse);
  const attributeCount = getCount(attributesRes as TModuleListResponse);
  const mediaCount = getCount(mediaRes as TModuleListResponse);

  const STATS_CARDS = [
    {
      title: "Products",
      count: productCount,
      isLoading: pLoading,
      unit: "Items",
      href: "/products",
      icon: Package,
      badge: "Catalog",
      gradient: "from-indigo-500/20 via-indigo-500/10 to-transparent text-indigo-400 border-indigo-500/30",
      accent: "bg-indigo-500",
    },
    {
      title: "Categories",
      count: categoryCount,
      isLoading: cLoading,
      unit: "Categories",
      href: "/categories",
      icon: Tag,
      badge: "Catalog",
      gradient: "from-emerald-500/20 via-emerald-500/10 to-transparent text-emerald-400 border-emerald-500/30",
      accent: "bg-emerald-500",
    },
    {
      title: "Brands",
      count: brandCount,
      isLoading: bLoading,
      unit: "Brands",
      href: "/brands",
      icon: Briefcase,
      badge: "Catalog",
      gradient: "from-purple-500/20 via-purple-500/10 to-transparent text-purple-400 border-purple-500/30",
      accent: "bg-purple-500",
    },
    {
      title: "Attributes",
      count: attributeCount,
      isLoading: aLoading,
      unit: "Specifications",
      href: "/attributes",
      icon: Sliders,
      badge: "Variants",
      gradient: "from-amber-500/20 via-amber-500/10 to-transparent text-amber-400 border-amber-500/30",
      accent: "bg-amber-500",
    },
    {
      title: "Media",
      count: mediaCount,
      isLoading: mLoading,
      unit: "Files",
      href: "/media",
      icon: ImageIcon,
      badge: "Storage",
      gradient: "from-cyan-500/20 via-cyan-500/10 to-transparent text-cyan-400 border-cyan-500/30",
      accent: "bg-cyan-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 md:p-8 border border-slate-800/80 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Trends Bird Limited Admin Panel</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, <span className="text-indigo-400">{displayName}</span> 👋
            </h1>
            <p className="text-sm text-slate-300/90 leading-relaxed font-normal">
              Overview of catalog items, categories, brands, attributes, and media storage assets.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>API Active</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-950/60 border border-indigo-800/40 text-xs font-semibold text-indigo-200">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>Live System</span>
            </div>
          </div>
        </div>
      </div>

      {/* Page Section Title */}
      <PageHeader
        title="Catalog & Storage Overview"
        description="Real-time counts for Products, Categories, Brands, Attributes, and Media assets."
      />

      {/* 5 Clean Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {STATS_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.href}
              className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md hover:bg-card hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div className={cn("absolute top-0 inset-x-0 h-1 transition-all duration-300 opacity-80 group-hover:opacity-100", card.accent)} />

              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                <div className={cn("p-2.5 rounded-xl border transition-transform duration-300 group-hover:scale-105", card.gradient)}>
                  <Icon className="w-5 h-5" />
                </div>

                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold uppercase bg-muted/30 border-border/60 text-muted-foreground px-2 py-0.5"
                >
                  {card.badge}
                </Badge>
              </CardHeader>

              <CardContent className="p-4 pt-2 space-y-4">
                <div>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-2 font-mono">
                      {card.isLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                      ) : (
                        <span>{card.count.toLocaleString()}</span>
                      )}
                    </h3>

                    <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                      <TrendingUp className="w-3 h-3" />
                      <span>Live</span>
                    </div>
                  </div>

                  <CardTitle className="text-sm font-extrabold text-foreground group-hover:text-indigo-400 transition-colors mt-1">
                    {card.title}
                  </CardTitle>
                </div>

                <Link
                  href={card.href}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "w-full justify-between font-semibold text-xs rounded-xl bg-muted/40 hover:bg-indigo-600 hover:text-white transition-all duration-300 h-8 px-3 group/btn"
                  )}
                >
                  <span>View {card.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
