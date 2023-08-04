'use client';
import { Loading, useAppBridge } from "@shopify/app-bridge-react";
import { useEffect } from "react";
import { useAuthRedirect, useSessionCheck } from "../hooks/auth";

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const app = useAppBridge();
  // const {
  //   verified,
  //   loading
  // } = useVerifySession();
  const {
    verified,
    loading
  } = useSessionCheck();
  const authRedirect = useAuthRedirect();

  useEffect(() => {
    if (!verified && !loading) {
      console.log('redirecting to auth');
      authRedirect(app);
    }
  }, [verified, loading, app, authRedirect]);

  if (!verified || loading) {
    return <Loading />;
  }

  return <>{children}</>;
}