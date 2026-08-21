import { type TypedDocumentNode } from "@graphql-typed-document-node/core";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { print } from "graphql";

const url = "shopify:admin/api/2025-10/graphql.json";

type VariablesArg<TVariables> =
  TVariables extends Record<string, never>
    ? [variables?: TVariables]
    : [variables: TVariables];

type GraphQLResponse<TResult> = {
  data?: TResult;
  errors?: Array<{ message: string }>;
};

export function useGraphQL<TResult, TVariables extends Record<string, unknown>>(
  document: TypedDocumentNode<TResult, TVariables>,
  ...[variables]: VariablesArg<TVariables>
): UseQueryResult<TResult> {
  return useQuery({
    queryKey: ["shopify-admin-graphql", print(document), variables],
    queryFn: async () => {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: print(document), variables }),
      });

      if (!response.ok) {
        throw new Error(`Shopify GraphQL request failed: ${response.status}`);
      }

      const result = (await response.json()) as GraphQLResponse<TResult>;
      if (result.errors?.length) {
        throw new Error(result.errors.map((error) => error.message).join("\n"));
      }
      if (!result.data) {
        throw new Error("Shopify GraphQL response did not include data.");
      }

      return result.data;
    },
  });
}
