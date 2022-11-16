import { Loading, useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useFetcher } from "./APIProvider";

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const fetcher = useFetcher();
  const app = useAppBridge();
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!!router && !!app) {
      const {
        shop,
        host,
        embedded,
        ...other
      } = router.query;
      fetcher('/api/auth/verify').then(response => {
        setVerified(true);
      }).catch(err => {
        console.log(err);
        // an error here means we need to authenticate again
        const queryParams = new URLSearchParams({
          shop: shop as string,
          host: host as string,
          embedded: embedded as string,
          ...other
        });
        const authUrl = `${process.env.NEXT_PUBLIC_HOST}/api/auth?${queryParams.toString()}`;
        if (embedded === "1") {
          const redirect = Redirect.create(app);
          redirect.dispatch(
            Redirect.Action.REMOTE,
            authUrl
          );
        } else {
          window.location.href = authUrl;
        }
      });
    }
  }, [fetcher, router, app]);

  if (!verified) {
    return <Loading />;
  }

  return <>{children}</>;
}