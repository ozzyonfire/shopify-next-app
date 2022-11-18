import { Loading, useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthRedirect, useVerifySession } from "../hooks/auth";
import { useFetcher } from "./APIProvider";

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  // const fetcher = useFetcher();
  const app = useAppBridge();
  const {
    verified,
    loading
  } = useVerifySession();
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