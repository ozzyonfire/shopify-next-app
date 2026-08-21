"use server";
import { handleSessionToken } from "@/lib/shopify/verify";

/**
 * Do the server action and return the status
 */
export async function doServerAction(sessionIdToken: string): Promise<{
  status: "success" | "error";
  data?: {
    shop: string;
  };
}> {
  try {
    const {
      session: { shop },
    } = await handleSessionToken(sessionIdToken);

    return {
      status: "success",
      data: {
        shop,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      status: "error",
    };
  }
}

/**
 * Store the session (and access token) in the database
 */
export async function storeToken(sessionToken: string) {
  await handleSessionToken(sessionToken, false, true);
}
