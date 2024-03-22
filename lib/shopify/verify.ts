import { AppInstallations } from "@/lib/db/app-installations";
import shopify from "@/lib/shopify/initialize-context";
import { registerWebhooks } from "@/lib/shopify/register-webhooks";
import {
  findSessionsByShop,
  loadSession,
  storeSession,
} from "@/lib/db/session-storage";
import { headers } from "next/headers";
import { SessionNotFoundError as NotFoundDBError } from "@/lib/db/session-storage";
import { RequestedTokenType } from "@shopify/shopify-api";

const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`;

export class AppNotInstalledError extends Error {
  constructor() {
    super("App not installed");
    this.name = "AppNotInstalledError";
  }
}

export class SessionNotFoundError extends Error {
  isOnline: boolean;
  constructor(isOnline: boolean) {
    super("Session not found");
    this.name = "SessionNotFoundError";
    this.isOnline = isOnline;
  }
}

export class ScopeMismatchError extends Error {
  isOnline: boolean;
  accountOwner: boolean;
  constructor(isOnline: boolean, accountOwner: boolean) {
    super("Scope mismatch");
    this.name = "ScopeMismatchError";
    this.isOnline = isOnline;
    this.accountOwner = accountOwner;
  }
}

export class ExpiredTokenError extends Error {
  isOnline: boolean;
  constructor(isOnline: boolean) {
    super(`Token expired - ${isOnline ? "online" : "offline"}`);
    this.name = "ExpiredTokenError";
    this.isOnline = isOnline;
  }
}

export async function verifyAuth(shop: string, online?: boolean) {
  // check to see if the app is installed
  const sanitizedShop = shopify.utils.sanitizeShop(shop);
  if (!sanitizedShop) {
    throw new Error("Invalid shop provided");
  }
  const appInstalled = await AppInstallations.includes(sanitizedShop);
  if (!appInstalled) {
    throw new AppNotInstalledError();
  }

  const sessions = await findSessionsByShop(sanitizedShop);

  if (online) {
    const onlineSession = sessions.find((session) => session.isOnline === true);

    if (!onlineSession) {
      throw new SessionNotFoundError(true);
    }

    // we used to check for a scope mismatch here, but if we deploy our app with shopify it will take care of this for us

    // do a test query to make sure the session is still active
    const client = new shopify.clients.Graphql({
      session: onlineSession,
    });

    try {
      await client.request(TEST_GRAPHQL_QUERY);
    } catch (err) {
      throw new ExpiredTokenError(true);
    }

    if (onlineSession.expires && onlineSession.expires.getTime() < Date.now()) {
      throw new ExpiredTokenError(true);
    }

    return onlineSession;
  }

  const offlineSession = sessions.find((session) => session.isOnline === false);

  if (!offlineSession) {
    console.log("No offline session found");
    throw new SessionNotFoundError(false);
  }

  // register webhooks
  await registerWebhooks(offlineSession);

  // don't need to check for scope mismatch - see above

  return offlineSession;
}

export async function verifyRequest(req: Request, isOnline: boolean) {
  const bearerPresent = headers().get("authorization")?.startsWith("Bearer ");
  const sessionId = await shopify.session.getCurrentId({
    rawRequest: req,
    isOnline,
  });

  if (!sessionId) {
    if (bearerPresent) {
      const token = headers().get("authorization")?.replace("Bearer ", "");
      if (!token) {
        throw new Error("No token present");
      }
      return handleSessionToken(token, isOnline);
    } else {
      console.log("No session id found and no bearerPresent");
      throw new SessionNotFoundError(isOnline);
    }
  }

  try {
    const session = await loadSession(sessionId);
    if (
      session.isOnline &&
      session.expires &&
      session.expires.getTime() < Date.now()
    ) {
      throw new ExpiredTokenError(isOnline);
    }
    return session;
  } catch (err) {
    if (err instanceof NotFoundDBError || err instanceof ExpiredTokenError) {
      if (bearerPresent && shopify.config.isEmbeddedApp) {
        const token = headers().get("authorization")?.replace("Bearer ", "");
        if (!token) {
          throw new Error("No token present");
        }
        return handleSessionToken(token, isOnline);
      } else {
        console.log("Session not found and no bearerPresent");
        throw new SessionNotFoundError(isOnline);
      }
    }
    throw err;
  }
}

export async function tokenExchange(
  shop: string,
  sessionToken: string,
  online?: boolean,
) {
  const response = await shopify.auth.tokenExchange({
    shop,
    sessionToken,
    requestedTokenType: online
      ? RequestedTokenType.OnlineAccessToken
      : RequestedTokenType.OfflineAccessToken,
  });

  const { session } = response;
  await storeSession(session);
}

/**
 * @description Do all the necessary steps, to validate the session token and refresh it if it needs to.
 * @param sessionToken The session token from the request headers or directly sent by the client
 * @param online
 * @returns The session object
 */
export async function handleSessionToken(
  sessionToken: string,
  online?: boolean,
) {
  const payload = await shopify.session.decodeSessionToken(sessionToken);
  const shop = payload.dest.replace("https://", "");
  try {
    const validSession = await verifyAuth(shop, online);
    return validSession;
  } catch (error) {
    if (
      error instanceof ExpiredTokenError ||
      error instanceof SessionNotFoundError
    ) {
      await tokenExchange(shop, sessionToken, online);
      return verifyAuth(shop, online);
    } else {
      console.log("Can't do anything about this error:");
      throw error;
    }
  }
}
