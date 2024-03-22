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
  const { shop, host, hmac, embedded } = searchParams;
  if (!shop || !host) {
    return <h1>Missing Shop and Host Parameters</h1>;
  }

  // verify hmac if we are doing an install
  const redirectUri = await performChecks(shop as string, host as string);

  if (redirectUri) {
    console.log("Redirecting to: ", redirectUri);
    return <ExitClient redirectUri={redirectUri} />;
  }

  return <Home shop={shop as string} />;
}
