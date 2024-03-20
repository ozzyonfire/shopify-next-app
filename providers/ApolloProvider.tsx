import { useAppBridge } from "@shopify/app-bridge-react";
import {
  HttpLink,
  ApolloClient,
  InMemoryCache,
  ApolloProvider as ApolloProviderClient,
} from "@apollo/client";

export default function ApolloProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // const app = useAppBridge();
  // const token = app.idToken();
  // console.log("Token: ", token);
  const http = new HttpLink({
    credentials: "same-origin",
    uri: `/api/graphql`,
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
