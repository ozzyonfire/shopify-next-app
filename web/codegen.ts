import { ApiType, pluckConfig, preset } from "@shopify/api-codegen-preset";
import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "https://shopify.dev/admin-graphql-direct-proxy/2024-10",
  documents: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./providers/**/*.{js,ts,jsx,tsx}",
    "!./lib/gql/**/*.{js,ts,jsx,tsx}",
  ],
  generates: {
    "./lib/gql/": {
      preset: "client",
      plugins: [],
    },
  },
};

export default config;
