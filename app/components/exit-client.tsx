"use client";

import { Card, Frame, Page, Text } from "@shopify/polaris";
import { useEffect } from "react";

export function ExitClient(props: { redirectUri: string }) {
  const { redirectUri } = props;
  useEffect(() => {
    if (redirectUri) {
      const decodedRedirectUri = decodeURIComponent(redirectUri);
      console.log("decodedRedirectUri: ", decodedRedirectUri);
      window.open(decodedRedirectUri, "_top");
    }
  }, [redirectUri]);

  useEffect(() => {
    if (shopify) {
      shopify.loading(true);
    }
  }, []);

  return (
    <Frame>
      <Page>
        <Card>
          <Text as="h1" variant="headingMd">
            Getting session tokens...
          </Text>
        </Card>
      </Page>
    </Frame>
  );
}
