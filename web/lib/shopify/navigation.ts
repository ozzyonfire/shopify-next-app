import { headers } from "next/headers";
import { handleSessionToken } from "./verify";

export async function verifyPageSession(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const headersList = await headers();
  const token = headersList.get("Authorization")?.replace("Bearer ", "");

  if (token) {
    return handleSessionToken(token);
  }

  const idToken = searchParams.id_token;
  if (typeof idToken === "string") {
    return handleSessionToken(idToken);
  }

  throw new Error("No token or id_token found");
}
