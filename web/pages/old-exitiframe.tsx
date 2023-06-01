import { Redirect } from "@shopify/app-bridge/actions";
import { useAppBridge, Loading } from "@shopify/app-bridge-react";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function ExitIframe() {
  const app = useAppBridge();
  const router = useRouter();
  const {
    redirectUri
  } = router.query;

  console.log(redirectUri);

  useEffect(() => {
    if (!!app && !!redirectUri) {
      const redirect = Redirect.create(app);
      const decodedRedirectUri = decodeURIComponent(redirectUri as string);
      redirect.dispatch(
        Redirect.Action.REMOTE,
        decodedRedirectUri
      );
    }
  }, [app, redirectUri]);

  return <Loading />;
}
