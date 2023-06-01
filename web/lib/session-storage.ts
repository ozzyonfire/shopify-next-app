import { Session } from "@shopify/shopify-api";
import clientPromise from "./mongodb-connect";
const DB_NAME = 'shopify-apps';
const apiKey = process.env.SHOPIFY_API_KEY || '';

export async function storeSession(session: Session) {
	const mongoClient = await clientPromise;
	const db = mongoClient.db(DB_NAME);
	try {
		await db.collection('sessions').updateOne({ id: session.id }, { $set: { ...session, apiKey } }, {
			upsert: true
		});
		return true;
	} catch (err) {
		console.log(err);
		return false;
	}
}

export async function loadSession(id: string) {
	const mongoClient = await clientPromise;
	const db = mongoClient.db(DB_NAME);
	const record = await db.collection('sessions').findOne<Session>({ id, apiKey });
	if (record) {
		return record;
	} else {
		return undefined;
	}
}

export async function deleteSession(id: string) {
	const mongoClient = await clientPromise;
	const db = mongoClient.db(DB_NAME);
	try {
		await db.collection('sessions').deleteOne({ id, apiKey });
		return true;
	} catch (err) {
		console.log(err);
		return false;
	}
}

export async function deleteSessions(ids: string[]) {
	const mongoClient = await clientPromise;
	const db = mongoClient.db(DB_NAME);
	try {
		await db.collection('sessions').deleteMany({ id: { $in: ids }, apiKey });
		return true;
	} catch (err) {
		console.log(err);
		return false;
	}
}

export async function cleanUpSession(shop: string, accessToken: string) {
	const mongoClient = await clientPromise;
	const db = mongoClient.db(DB_NAME);
	try {
		await db.collection('sessions').deleteOne({ shop, accessToken });
		return true;
	} catch (err) {
		console.log(err);
		return false;
	}
}

export async function findSessionsByShop(shop: string) {
	const mongoClient = await clientPromise;
	const db = mongoClient.db(DB_NAME);
	const records = await db.collection('sessions').find<Session>({ shop, apiKey }).toArray();
	if (records) {
		return records;
	}
	return [];
}