"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { authClient } from "@/lib/api/clients";
import { clearTokens } from "@/lib/api/client";
import { UserRole } from "@/lib/api/types";
import { Eye, EyeOff, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ADMIN_ROLES: string[] = [UserRole.STAFF, UserRole.ADMIN, UserRole.SUPERADMIN];

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await authClient.login({ identifier, password });
      if (res.success && res.data) {
        if (!ADMIN_ROLES.includes(res.data.user.role)) {
          clearTokens();
          setError("Access denied. Staff, Admin, or Superadmin role required.");
          toast.error("Access denied. Insufficient permissions.");
          setIsLoading(false);
          return;
        }
        toast.success(`Welcome back, ${res.data.user.first_name || res.data.user.username}!`);
        router.push("/dashboard");
      } else {
        setError(res.message || "Invalid credentials. Please try again.");
        toast.error(res.message || "Login failed");
      }
    } catch {
      setError("Unable to connect to server. Please try again.");
      toast.error("Connection error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0f172a] relative flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0073ae]/20 via-transparent to-[#008265]/20" />
        <div className="relative z-10">
          <Image
            src="/bocra-logo.png"
            alt="BOCRA Logo"
            width={180}
            height={60}
            priority
          />
        </div>
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Administration
            <br />
            Portal
          </h1>
          <p className="text-lg text-slate-300 max-w-md">
            Manage licensing applications, complaints, content, and users for
            the Botswana Communications Regulatory Authority.
          </p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="w-2 h-2 rounded-full bg-[#008265]" />
              Licensing
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="w-2 h-2 rounded-full bg-[#0073ae]" />
              Complaints
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="w-2 h-2 rounded-full bg-[#c60751]" />
              Content
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="w-2 h-2 rounded-full bg-[#ffd204]" />
              Analytics
            </div>
          </div>
        </div>
        <div className="relative z-10 text-sm text-slate-500">
          &copy; {new Date().getFullYear()} BOCRA. All rights reserved.
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center mb-8">
            <Image
              src="/bocra-logo.png"
              alt="BOCRA Logo"
              width={140}
              height={46}
              priority
            />
          </div>

          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0073ae]/10 text-[#0073ae] text-sm font-medium mb-4">
              <Shield className="w-4 h-4" />
              Staff Access Only
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your credentials to access the administration portal
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email or Username
              </label>
              <input
                id="identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0073ae] focus:border-transparent transition-shadow"
                placeholder="admin@bocra.org.bw"
                autoComplete="username"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0073ae] focus:border-transparent transition-shadow pr-11"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#0073ae] hover:bg-[#005f8f] text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#0073ae] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            This portal is for authorised BOCRA staff only.
            <br />
            Unauthorised access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
