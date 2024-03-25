/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import * as AdminTypes from './admin.types.d.ts';

export type GetShopQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type GetShopQuery = { shop: Pick<AdminTypes.Shop, 'name'> };

interface GeneratedQueryTypes {
  "\n  #graphql\n  query getShop {\n    shop {\n      name\n    }\n  }\n": {return: GetShopQuery, variables: GetShopQueryVariables},
}

interface GeneratedMutationTypes {
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
