"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { setSession } from "@/redux/features/authSlice";
import { storeUserInfo } from "@/services/auth.services";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Store,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  PackageCheck,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
} from "lucide-react";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res: any = await api.post("/auth/login", data);
      const responseData = res?.data || res;

      const accessToken = responseData?.accessToken || responseData?.token;
      const refreshToken = responseData?.refreshToken;
      const user = responseData?.user || responseData;
      const permissions = responseData?.permissions || user?.permissions || [];

      if (accessToken) {
        storeUserInfo({ accessToken });
        dispatch(
          setSession({
            user,
            permissions: Array.isArray(permissions) ? permissions : [],
            accessToken,
            refreshToken: refreshToken || null,
          })
        );

        router.push("/");
        router.refresh();
      } else {
        setErrorMsg("Invalid response from server. Missing access token.");
      }
    } catch (err: any) {
      const message =
        err?.message || err?.errorMessages || "Invalid credentials. Please check email and password.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Left Column: Visual Brand Hero Panel */}
      <div className="lg:col-span-7 relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border-r border-slate-800/60">
        {/* Glow Effects */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Brand Bar */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/30 text-white">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-white block">Trends Bird</span>
            <span className="text-xs text-indigo-300 font-medium tracking-wide uppercase">
              Management Portal
            </span>
          </div>
        </div>

        {/* Hero Central Content */}
        <div className="relative z-10 space-y-8 my-auto max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Admin Dashboard</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Streamline your <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-300 to-pink-400">
              E-Commerce Operations
            </span>
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed">
            Manage catalog products, multi-variant combinations, media assets, users, and fine-grained role permissions with speed and efficiency.
          </p>

          {/* Feature Badges Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-2">
              <div className="p-2 w-fit rounded-lg bg-indigo-500/10 text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Role-Based Matrix</h3>
              <p className="text-xs text-slate-400">
                Granular permission assignment per module & action.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-2">
              <div className="p-2 w-fit rounded-lg bg-violet-500/10 text-violet-400">
                <PackageCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Variant Builder</h3>
              <p className="text-xs text-slate-400">
                Automated attribute matrix generator & media attachers.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-6 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} Trends Bird Limited</span>
          <span>Internal Assessment Portal</span>
        </div>
      </div>

      {/* Right Column: Modern Form Area */}
      <div className="lg:col-span-5 flex items-center justify-center p-6 md:p-12 bg-slate-950">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white block">Trends Bird</span>
              <span className="text-xs text-indigo-400 font-medium">Admin Dashboard</span>
            </div>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-white">Sign In to Dashboard</h2>
            <p className="text-sm text-slate-400">
              Enter your credentials to access the admin workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {errorMsg && (
              <Alert variant="destructive" className="bg-red-950/40 border-red-800/50 text-red-300">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@trendsbird.com"
                  {...register("email")}
                  disabled={isLoading}
                  className="pl-10 bg-slate-900/80 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500 h-11"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  disabled={isLoading}
                  className="pl-10 pr-10 bg-slate-900/80 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-indigo-600/20 transition-all rounded-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In to Portal
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
