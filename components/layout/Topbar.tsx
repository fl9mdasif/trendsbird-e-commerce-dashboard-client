"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearSession } from "@/redux/features/authSlice";
import { removeUser, getRoleString } from "@/services/auth.services";
import { useRouter, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Shield, ChevronRight } from "lucide-react";

export const Topbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    removeUser();
    dispatch(clearSession());
    router.push("/login");
  };

  const displayName =
    typeof user?.fullName === "string"
      ? user.fullName
      : typeof user?.name === "string"
      ? user.name
      : typeof user?.email === "string"
      ? user.email
      : "Admin User";

  const userRole = getRoleString(user?.role);

  const getBreadcrumbTitle = () => {
    if (pathname === "/") return "Overview";
    const segment = pathname.split("/")[1];
    return segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : "Dashboard";
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 w-full">
      {/* Location / Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Dashboard</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
        <span className="font-semibold text-primary">{getBreadcrumbTitle()}</span>
      </div>

      {/* Right User Controls */}
      <div className="flex items-center gap-4">
        {/* System Online Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Online</span>
        </div>

        {/* Role Badge */}
        <Badge variant="outline" className="gap-1.5 py-1 px-3 capitalize font-semibold bg-accent/40">
          <Shield className="w-3.5 h-3.5 text-primary" />
          {userRole}
        </Badge>

        {/* Direct Visible Logout Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="gap-2 text-destructive hover:bg-destructive/10 border-destructive/30 font-medium"
        >
          <LogOut className="w-4 h-4 text-destructive" />
          <span className="hidden sm:inline">Log out</span>
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 p-[2px] cursor-pointer outline-none shadow-md hover:scale-105 transition-transform">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-card text-foreground font-bold text-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-1">
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none text-foreground">{displayName}</p>
                {user?.email && (
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer font-medium p-2.5">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Topbar;
