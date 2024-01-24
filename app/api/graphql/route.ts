import shopify from "@/lib/shopify/initialize-context";
import { verifyRequest } from "@/lib/shopify/verify";
import { GraphqlQueryError } from "@shopify/shopify-api";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await verifyRequest(req, true); // could use middleware for this
  const rawBody = await req.json();

  console.log("rawBody", rawBody);

  try {
    const response = await shopify.clients.graphqlProxy({
      rawBody: rawBody,
      session,
    });
    return NextResponse.json(response.body);
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      console.log(error.response);
      return NextResponse.json({ error: error.response }, { status: 500 });
    }
    console.log(error);
    return NextResponse.json(error, { status: 500 });
  }
}
