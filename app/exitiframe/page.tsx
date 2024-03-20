"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ExitIframe() {
  const searchParams = useSearchParams();
  useEffect(() => {
    const redirectUri = searchParams.get("redirectUri");
    if (redirectUri) {
      const decodedRedirectUri = decodeURIComponent(redirectUri);
      console.log("decodedRedirectUri: ", decodedRedirectUri);
      window.open(decodedRedirectUri, "_top");
    }
  }, [searchParams]);

  shopify.loading(true);

  return <div></div>;
}
