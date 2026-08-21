import type { CodegenConfig } from "@graphql-codegen/cli";

const apiVersion = "2025-10";
const adminSchema = `https://shopify.dev/admin-graphql-direct-proxy/${apiVersion}`;

/** Operation documents: Next `app/` only for now */
const documents = [
  "./app/**/*.{ts,tsx}",
  "./lib/**/*.{ts,tsx}",
  "./hooks/**/*.{ts,tsx}",
  "./modules/bulk/lib/*.{ts,tsx}",
  "./modules/bulk/hooks/*.{ts,tsx}",
  "./modules/orders/lib/*.{ts,tsx}",
];

const outputDir = "./__generated__/gql/";

export default {
  overwrite: true,
  schema: adminSchema,
  documents,
  ignoreNoDocuments: true,
  generates: {
    [outputDir]: {
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        avoidOptionals: {
          field: true,
          inputValue: false,
        },
        defaultScalarType: "unknown",
        nonOptionalTypename: true,
        skipTypenameForRoot: true,
        enumsAsTypes: true,
      },
    },
  },
} satisfies CodegenConfig;
