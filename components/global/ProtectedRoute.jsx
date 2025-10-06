"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'nextjs-toploader/app';
import { useAuth } from "@/providers/AuthContext";
import { toast } from "sonner";

export default function ProtectedRoute({ children, allowedRoutes = [] }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    const currentPath = window.location.pathname;
    const isAllowed = allowedRoutes.includes(currentPath);

    if (!user && !isAllowed) {
      toast.warning("you must be logged in to access this page");
      router.replace("/");
    } else {
      setIsAuthorized(true);
    }
  }, [user, loading, router]);
  if (loading || !isAuthorized) {
    return null;
  }

  return children;
}
