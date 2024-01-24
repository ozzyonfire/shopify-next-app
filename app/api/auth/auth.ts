import shopify from "@/lib/shopify/initialize-context";
import { NextResponse } from "next/server";

export function beginAuth(shop: string, req: Request, isOnline: boolean) {
  return shopify.auth.begin({
    shop,
    callbackPath: "/api/auth/callback",
    isOnline,
    rawRequest: req,
    rawResponse: new NextResponse(),
  });
}
