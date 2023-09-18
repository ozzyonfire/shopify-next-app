'use server';
import { verifyAuth } from "@/lib/verify";

export async function checkSession(shop: string) {
	try {
		await verifyAuth(shop);
		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
}