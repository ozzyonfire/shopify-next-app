import request from "graphql-request";
import { type TypedDocumentNode } from "@graphql-typed-document-node/core";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
const url = `shopify:admin/api/2024-10/graphql.json`;

export function useGraphQL<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): UseQueryResult<TResult> {
  return useQuery({
    queryKey: [(document.definitions[0] as any).name.value, variables],
    queryFn: async ({ queryKey }) =>
      request(url, document, queryKey[1] ? queryKey[1] : undefined),
  });
}
