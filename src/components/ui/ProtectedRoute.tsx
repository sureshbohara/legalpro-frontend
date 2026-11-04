"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, fetchUser } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        await fetchUser();
      }
      setIsChecking(false);
    };
    checkAuth();
  }, [isAuthenticated, fetchUser]);

  useEffect(() => {
    if (!isChecking && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isChecking, isAuthenticated, router, pathname]);

  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {!isAuthenticated ? "Redirecting to login..." : "Verifying Session..."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}