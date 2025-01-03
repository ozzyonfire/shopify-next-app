import { graphql } from "@/lib/gql";

const GET_PRODUCTS = graphql(/* GraphQL */ `
  query getProducts($first: Int!) {
    products(first: $first) {
      id
    }
  }
`);

const STRING = /* GraphQL */ `
  query getProducts($first: Int!) {
    products(first: $first) {
      id
    }
  }
`;
