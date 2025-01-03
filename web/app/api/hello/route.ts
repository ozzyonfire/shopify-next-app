import { verifyRequest } from "@/lib/shopify/verify";
import { NextResponse } from "next/server";

export type APIResponse<DataType> = {
  status: "success" | "error";
  data?: DataType;
  message?: string;
};

type Data = {
  name: string;
  height: string;
};

export async function GET(req: Request) {
  // session token is located in the request headers
  const validSession = await verifyRequest(req, true); // could use middleware for this?
  console.log("validSession", validSession);

  return NextResponse.json<APIResponse<Data>>({
    status: "success",
    data: {
      name: "Luke Skywalker",
      height: "172",
    },
  });
}
