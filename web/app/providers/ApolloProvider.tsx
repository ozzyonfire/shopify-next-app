import {
  ApolloClient,
  ApolloProvider as ApolloProviderClient,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";

export default function ApolloProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const url = `shopify:admin/api/2024-10/graphql.json`;
  const http = new HttpLink({
    credentials: "same-origin",
    uri: url,
    fetch: fetch,
  });

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: http,
  });

  return (
    <ApolloProviderClient client={client}>{children}</ApolloProviderClient>
  );
}
