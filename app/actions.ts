"use server";
import {
  handleSessionToken,
  tokenExchange,
  verifyAuth,
} from "@/lib/shopify/verify";

export async function checkSession(shop: string) {
  try {
    await verifyAuth(shop);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function doServerAction(sessionIdToken: string): Promise<{
  status: "success" | "error";
}> {
  try {
    await handleSessionToken(sessionIdToken);
    return {
      status: "success",
    };
  } catch (error) {
    console.log(error);
    return {
      status: "error",
    };
  }
}

export async function doTokenExchange(
  shop: string,
  sessionToken: string,
  online?: boolean,
) {
  return tokenExchange(shop, sessionToken, online);
}
