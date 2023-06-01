import { ClientApplication } from "@shopify/app-bridge";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

interface VerifyResponse {
  status: "success" | "error";
  type: "token" | "scope";
  sessionType: "offline" | "online";
  message: string;
  accountOwner?: boolean;
}

export function useAuthRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = useCallback((app: ClientApplication<any>) => {
    if (!!app && !!router) {
      const embedded = searchParams?.get('embedded');
      const authUrl = `${process.env.NEXT_PUBLIC_HOST}/api/auth?${searchParams?.toString()}`;
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
  }, [searchParams, router]);

  return redirect;
}

export function useVerifySession() {
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accountOwner, setAccountOwner] = useState(false);
  const [sessionType, setSessionType] = useState<"offline" | "online">("offline");
  const [authErrorType, setAuthErrorType] = useState<"token" | "scope">("token");
  const router = useRouter();
  const searchParams = useSearchParams();
  const app = useAppBridge();

  const queryParams = useMemo(() => {
    if (router) {
      const shop = searchParams?.get('shop');
      const host = searchParams?.get('host');
      if (shop && host) {
        const queryParams = new URLSearchParams({
          shop: shop as string,
          host: host as string,
        });
        return queryParams;
      }
    }
    return null;
  }, [router, searchParams]);

  useEffect(() => {
    if (queryParams && app) {
      console.log('verifying session');
      authenticatedFetch(app)(`/api/auth/verify?${queryParams.toString()}`).then(async (response) => {
        setLoading(true);
        const body = await response.json() as VerifyResponse;
        if (body.status == 'success') {
          setVerified(true);
        } else {
          setVerified(false);
          setAuthErrorType(body.type);
          setSessionType(body.sessionType);
          if (body.accountOwner) {
            setAccountOwner(true);
          }
        }
        setLoading(false);
      }).catch(err => {
        console.log(err);
        setLoading(false);
        setVerified(false);
      });
    }
  }, [app, queryParams]);

  return {
    verified,
    loading,
    accountOwner,
    sessionType,
    authErrorType,
  };
}