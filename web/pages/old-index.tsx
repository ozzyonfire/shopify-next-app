import { Button, LegacyCard as Card, Page, Text } from '@shopify/polaris'
import { GetServerSidePropsContext } from 'next';
import { useState } from 'react';
import { useFetcher } from '../providers/APIProvider';
import { gql, useLazyQuery, useQuery } from '@apollo/client';
import { performChecks } from '../utils/shopify-oauth';
import Link from 'next/link';

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
  const [getShop] = useLazyQuery<ShopData>(GET_SHOP);

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
      <Button>
        <Link href="/new">
          New Page old
        </Link>
      </Button>
    </Page>
  )
}

/**
 * This is needed on the page that the user hits when first installing the app.
 * The redirect will not work properly if it is done client side.
 */
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const result = await performChecks(context);
  return result;
}
