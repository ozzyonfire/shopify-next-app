import { ClientApplication, createApp } from "@shopify/app-bridge";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useFetcher } from "../providers/APIProvider";

export function useAuthRedirect() {
  const router = useRouter();

  const redirect = useCallback((app: ClientApplication<any>) => {
    if (!!app && !!router) {
      const {
        shop,
        host,
        embedded,
        ...other
      } = router.query;
      const queryParams = new URLSearchParams({
        shop: shop as string,
        host: host as string,
        embedded: embedded as string,
        ...other
      });
      const authUrl = `${process.env.NEXT_PUBLIC_HOST}/api/auth?${queryParams.toString()}`;
      if (embedded === "1") {
        console.log('redirecting using app');
        const redirect = Redirect.create(app);
        redirect.dispatch(
          Redirect.Action.REMOTE,
          authUrl
        );
      } else {
        console.log('redirecting using window');
        window.location.href = authUrl;
      }
    } else {
      console.log('app or router not defined');
    }
  }, [router]);

  return redirect;
}

export function useVerifySession() {
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!!router) {
      const {
        shop,
        host,
      } = router.query;
      if (!!shop && !!host) {
        const app = createApp({
          apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || '',
          host: host as string,
          forceRedirect: true,
        });
        const queryParams = new URLSearchParams({
          shop: shop as string,
          host: host as string,
        });
        authenticatedFetch(app)(`/api/auth/verify?${queryParams.toString()}`).then(async (response) => {
          const body = await response.json();
          if (body.status == 'success') {
            setVerified(true);
          } else {
            setVerified(false);
          }
          setLoading(false);
        }).catch(err => {
          console.log(err);
          setLoading(false);
          setVerified(false);
        });
      }
    }
  }, [router]);

  return {
    verified,
    loading,
  };
}