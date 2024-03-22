import { performChecks } from "@/lib/shopify/shopify-oauth";
import Home from "./components/main-page";
import { ExitClient } from "./components/exit-client";

export default async function Page({
  params,
  searchParams,
}: {
  params: any;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // we can perform some checks to see if the app has been installed and that it is still valid
  const { shop, host } = searchParams;
  if (!shop || !host) {
    return <h1>Missing Shop and Host Parameters</h1>;
  }

  const redirectUri = await performChecks(shop as string, host as string);

  if (redirectUri) {
    return <ExitClient redirectUri={redirectUri} />;
  }

  return <Home shop={shop as string} />;
}
