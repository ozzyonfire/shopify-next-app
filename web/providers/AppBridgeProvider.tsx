'use client'

import { useEffect, useMemo, useState } from "react";
import { Provider } from "@shopify/app-bridge-react";
import { Banner, Layout, Page } from "@shopify/polaris";
import { AppConfigV2 } from "@shopify/app-bridge";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
declare global {
  interface Window {
    __SHOPIFY_DEV_HOST: string;
  }
}

/**
 * A component to configure App Bridge.
 * @desc A thin wrapper around AppBridgeProvider that provides the following capabilities:
 *
 * 1. Ensures that navigating inside the app updates the host URL.
 * 2. Configures the App Bridge Provider, which unlocks functionality provided by the host.
 *
 * See: https://shopify.dev/apps/tools/app-bridge/react-components
 */
export function AppBridgeProvider({ children }: { children: React.ReactNode }) {
  // The host may be present initially, but later removed by navigation.
  // By caching this in state, we ensure that the host is never lost.
  // During the lifecycle of an app, these values should never be updated anyway.
  // Using state in this way is preferable to useMemo.
  // See: https://stackoverflow.com/questions/60482318/version-of-usememo-for-caching-a-value-that-will-never-change

  const searchParams = useSearchParams();
  const router = useRouter();

  const [host, setHost] = useState(searchParams?.get('host') || '');
  const [shop, setShop] = useState(searchParams?.get('shop') || '');
  const location = usePathname() || '';
  const history = useMemo(() => {
    return {
      replace: (path: string) => {
        const params = new URLSearchParams(path.split('?')[1]);
        params.append('host', host);
        params.append('shop', shop);
        router.push(`${path}?${params.toString()}`);
      },
    };
  }, [host, shop, router]);

  // cache the query params in state for the router
  useEffect(() => {
    if (searchParams?.get('host')) {
      setHost(searchParams.get('host') as string);
    }
    if (searchParams?.get('shop')) {
      setShop(searchParams.get('shop') as string);
    }
  }, [searchParams]);

  const appBridgeConfig: AppConfigV2 = useMemo(
    () => ({
      apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || '',
      host,
      forceRedirect: true,
    }),
    [host]
  );

  if (!process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || !appBridgeConfig.host) {
    const bannerProps = !process.env.NEXT_PUBLIC_SHOPIFY_API_KEY
      ? {
        title: "Missing Shopify API Key",
        children: (
          <>
            Your app is running without the SHOPIFY_API_KEY environment
            variable. Please ensure that it is set when running or building
            your React app.
          </>
        ),
      }
      : {
        title: "Missing host query argument",
        children: (
          <>
            Your app can only load if the URL has a <b>host</b> argument.
            Please ensure that it is set, or access your app using the
            Partners Dashboard <b>Test your app</b> feature
          </>
        ),
      };

    return (
      <Page narrowWidth>
        <Layout>
          <Layout.Section>
            <div style={{ marginTop: "100px" }}>
              <Banner {...bannerProps} status="critical" />
            </div>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Provider config={appBridgeConfig} router={{
      history,
      location,
    }}>
      {children}
    </Provider>
  );
}
