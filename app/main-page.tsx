'use client';

import { gql, useLazyQuery } from '@apollo/client';
import { LegacyCard as Card, Page, Text } from '@shopify/polaris';
import { useState } from 'react';
import { useFetcher } from '../providers/APIProvider';

interface Data {
  name: string;
  height: string;
}

const GET_SHOP = gql`
query {
  shop {
    name
  }
}`;

interface ShopData {
  shop: {
    name: string;
  }
}

export default function Home() {
  const fetcher = useFetcher();
  const [data, setData] = useState<Data | null>(null);
  const [graphqlData, setGraphglData] = useState<ShopData | null>(null);
  const [getShop] = useLazyQuery<ShopData>(GET_SHOP, {
    fetchPolicy: 'network-only',
  });

  const handleGetAPIRequest = async () => {
    try {
      const data = await fetcher<Data>('/api/hello');
      console.log(data);
      setData(data);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <Page
      title="Home"
    >
      <Card
        sectioned
        title="NextJs API Routes"
        primaryFooterAction={{
          content: 'Call API',
          onAction: handleGetAPIRequest,
        }}
      >
        <Text as='p' variant='bodyMd'>Call a NextJS api route from within your app. The request is verified using session tokens.</Text>
        {data && (
          <Text as="h1" variant="headingSm">
            {data.name} is {data.height} tall.
          </Text>
        )}
      </Card>

      <Card
        sectioned
        title="Use Apollo Client to query Shopify GraphQL"
        primaryFooterAction={{
          content: 'GraphQL Query',
          onAction: async () => {
            try {
              const {
                data,
                error
              } = await getShop();
              if (data) {
                setGraphglData(data);
              }
              if (error) {
                console.error(error);
              }
            } catch (err) {
              console.error(err);
            }
          },
        }}
      >
        <Text as='p' variant='bodyMd'>Use Apollo Client to query Shopify&apos;s GraphQL API. The request uses online session tokens.</Text>
        <Text as='p' variant='bodyMd'>Response:</Text>
        {graphqlData && (
          <Text as="h1" variant="headingSm">
            {graphqlData.shop.name}
          </Text>
        )}
      </Card>
    </Page>
  )
}
