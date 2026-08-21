import Home from "./client.page";
import { verifyPageSession } from "@/lib/shopify/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await verifyPageSession(await searchParams);

  return <Home />;
}
