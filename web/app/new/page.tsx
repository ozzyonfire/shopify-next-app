

import { verifyPageSession } from "@/lib/shopify/navigation";

export default async function NewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await verifyPageSession(await searchParams);

  return (
    <div>
      <h1>New Page</h1>
    </div>
  )
}
