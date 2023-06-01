'use client';
import { Redirect } from "@shopify/app-bridge/actions";
import { useAppBridge, Loading } from "@shopify/app-bridge-react";
import { useEffect } from "react";

export default function ExitIframe({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const app = useAppBridge();
  const {
    redirectUri
  } = searchParams;

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
