import shopify from "@/lib/shopify/initialize-context";
import { verifyRequest } from "@/lib/shopify/verify";
import { GraphqlQueryError } from "@shopify/shopify-api";
import { NextResponse } from "next/server";

// export const runtime = "edge";
// export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await verifyRequest(req, true);
  const text = await req.json();
  if (!session) {
    throw new Error("No sesssion found.");
  }

  try {
    const response = await shopify.clients.graphqlProxy({
      rawBody: text,
      session,
    });

    return Response.json(response.body as any, {
      headers: response.headers as any,
    });
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      console.log(JSON.stringify(error.response));
      return new NextResponse(
        JSON.stringify({ errors: error.body?.errors.graphQLErrors }),
        {
          status: 200,
          headers: error.headers as any,
        },
      );
    } else if (error instanceof Error) {
      return new Response(JSON.stringify(error.message), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      console.error("Unknown error", error);
      return new Response(JSON.stringify("Unknown error"), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  }
}
