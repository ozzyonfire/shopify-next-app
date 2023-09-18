import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge/utilities";
import { HttpLink, ApolloClient, InMemoryCache, ApolloProvider as ApolloProviderClient } from '@apollo/client';

export default function ApolloProvider({ children }: { children: React.ReactNode }) {

  const app = useAppBridge();
  const http = new HttpLink({
    credentials: 'same-origin',
    uri: `/api/graphql`,
    fetch: authenticatedFetch(app),
  });

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: http,
  });

  return (
    <ApolloProviderClient client={client}>
      {children}
    </ApolloProviderClient>
  )
}