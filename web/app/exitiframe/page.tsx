'use client';
import { Redirect } from "@shopify/app-bridge/actions";
import { useAppBridge, Loading } from "@shopify/app-bridge-react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ExitIframe() {
  const searchParams = useSearchParams();
  const app = useAppBridge();
  useEffect(() => {
    const redirectUri = searchParams.get("redirectUri");
    if (app && redirectUri) {
      const redirect = Redirect.create(app);
      const decodedRedirectUri = decodeURIComponent(redirectUri);
      redirect.dispatch(Redirect.Action.REMOTE, decodedRedirectUri);
    }
  }, [app, searchParams]);

  return <Loading />;
}
