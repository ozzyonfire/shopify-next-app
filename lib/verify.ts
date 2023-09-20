import { AppInstallations } from "@/lib/app-installations";
import shopify from "@/lib/initialize-context";
import { registerWebhooks } from "@/lib/register-webhooks";
import { findSessionsByShop, loadSession } from "@/lib/session-storage";
import { headers } from "next/headers";

const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`;

export class AppNotInstalledError extends Error {
	constructor() {
		super('App not installed');
		this.name = 'AppNotInstalledError';
	}
}

export class SessionNotFoundError extends Error {
	isOnline: boolean;
	constructor(isOnline: boolean) {
		super('Session not found');
		this.name = 'SessionNotFoundError';
		this.isOnline = isOnline;
	}
}

export class ScopeMismatchError extends Error {
	isOnline: boolean;
	accountOwner: boolean;
	constructor(isOnline: boolean, accountOwner: boolean) {
		super('Scope mismatch');
		this.name = 'ScopeMismatchError';
		this.isOnline = isOnline;
		this.accountOwner = accountOwner;
	}
}

export class ExpiredTokenError extends Error {
	isOnline: boolean;
	constructor(isOnline: boolean) {
		super('Token expired');
		this.name = 'ExpiredTokenError';
		this.isOnline = isOnline;
	}
}

export async function verifyAuth(shop: string) {
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
	const offlineSession = sessions.find((session) => session.isOnline === false);
	const onlineSession = sessions.find((session) => session.isOnline === true);

	if (!offlineSession) {
		console.log('No offline session found');
		throw new SessionNotFoundError(false);
	}

	// register webhooks
	await registerWebhooks(offlineSession);

	// check for scope mismatch
	if (!shopify.config.scopes.equals(offlineSession.scope)) {
		throw new ScopeMismatchError(false, onlineSession?.onlineAccessInfo?.associated_user.account_owner ?? false);
	}

	if (!onlineSession) {
		throw new SessionNotFoundError(true);
	}

	if (!shopify.config.scopes.equals(onlineSession?.scope)) {
		throw new ScopeMismatchError(true, onlineSession?.onlineAccessInfo?.associated_user.account_owner ?? false);
	}

	// do a test query to make sure the session is still active
	const client = new shopify.clients.Graphql({
		session: onlineSession,
	});

	try {
		await client.query({ data: TEST_GRAPHQL_QUERY });
	} catch (err) {
		throw new ExpiredTokenError(true);
	}

	if (onlineSession.expires && onlineSession.expires.getTime() < Date.now()) {
		throw new ExpiredTokenError(true);
	}
}

export async function verifyRequest(req: Request, isOnline: boolean) {
	const sessionId = await shopify.session.getCurrentId({
		rawRequest: req,
		isOnline,
	});

	if (!sessionId) {
		throw new SessionNotFoundError(isOnline);
	}

	const session = await loadSession(sessionId);

	if (!session) {
		throw new SessionNotFoundError(isOnline);
	}

	const bearerPresent = headers().get('authorization')?.startsWith('Bearer ');
	if (bearerPresent && shopify.config.isEmbeddedApp) {
		const token = headers().get('authorization')?.replace('Bearer ', '');
		if (!token) {
			throw new Error('No token present');
		}
		const payload = await shopify.session.decodeSessionToken(token);
		const shop = payload.dest.replace('https://', '');
		if (shop !== session.shop) {
			throw new Error('The current request is for a different shop. Redirect gracefully.');
		}
	}

	if (session.isOnline && session.expires && session.expires.getTime() < Date.now()) {
		throw new ExpiredTokenError(true);
	}

	return session;
}