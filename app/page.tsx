import { performChecks } from "@/lib/shopify/shopify-oauth";
import Home from "./main-page";

export default async function Page({
  params,
  searchParams,
}: {
  params: any;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // we can perform some checks to see if the app has been installed and that it is still valid
  const { shop, host, embedded } = searchParams;
  if (!shop || !host) {
    return <h1>Missing Shop and Host Parameters</h1>;
  }

  await performChecks(shop as string, host as string, embedded as string);

  return <Home shop={shop as string} />;
}
