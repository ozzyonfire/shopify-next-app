import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "@/lib/initialize-context";
import { AppInstallations } from "@/lib/app-installations";
import { registerWebhooks } from "@/lib/register-webhooks";
import { verifyRequest } from "@/lib/verify";
import { type NextRequest, NextResponse } from "next/server";

// force dynamic - next config
export const dynamic = "force-dynamic";

const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`;

export async function GET(req: NextRequest) {
  try {
    const shop = req.nextUrl.searchParams.get("shop");
    if (!shop) {
      return NextResponse.json({
        status: "error",
        type: "token",
        message: "Shop not provided",
      });
    }
    // check to see if the app is installed
    const sanitizedShop = shopify.utils.sanitizeShop(shop);
    if (!sanitizedShop) {
      throw new Error("Invalid shop provided");
    }
    const appInstalled = await AppInstallations.includes(sanitizedShop);
    console.log("appInstalled", appInstalled);
    if (!appInstalled) {
      return NextResponse.json({
        status: "error",
        type: "token",
        message: "App not installed",
      });
    }

    // check for offline token
    const offlineSession = await verifyRequest(req, false);
    // check for online token
    const onlineSession = await verifyRequest(req, true);

    // check for scope mismatch
    if (!shopify.config.scopes.equals(offlineSession.scope)) {
      console.log("scope mismatch - verify (offline)", offlineSession);
      return NextResponse.json({
        status: "error",
        type: "scope",
        sessionType: "offline",
        message: "Scope mismatch - offline token",
        accountOwner:
          onlineSession.onlineAccessInfo?.associated_user.account_owner,
      });
    }

    if (!shopify.config.scopes.equals(onlineSession.scope)) {
      console.log("scope mismatch - verify (online)", onlineSession);
      return NextResponse.json({
        status: "error",
        type: "scope",
        sessionType: "online",
        message: "Scope mismatch - online token",
        accountOwner:
          onlineSession.onlineAccessInfo?.associated_user.account_owner,
      });
    }

    // do a test query to make sure the session is still active
    const client = new shopify.clients.Graphql({
      session: onlineSession,
    });

    try {
      await client.query({ data: TEST_GRAPHQL_QUERY });
    } catch (err) {
      return NextResponse.json({
        status: "error",
        type: "token",
        message: "Access token is invalid",
        accountOwner:
          onlineSession.onlineAccessInfo?.associated_user.account_owner,
      });
    }

    // make sure the webhooks are registered
    try {
      await registerWebhooks(offlineSession);
    } catch (err) {
      console.log("Error registering webhooks - will be retried", err);
    }

    return NextResponse.json({
      status: "success",
    });
  } catch (err) {
    if (err instanceof GraphqlQueryError) {
      const error = err;
      console.log("Error in Verify", error.response?.errors);
      return NextResponse.json({
        status: "error",
        message: error.response?.errors,
        type: "token",
      });
    } else {
      return NextResponse.json({
        status: "error",
        message: JSON.stringify(err),
        type: "token",
      });
    }
  }
}
