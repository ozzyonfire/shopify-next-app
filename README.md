# Shopify App Template - Next.js

This is a template for building a [Shopify app](https://shopify.dev/apps/getting-started) using Next.js and Typescript. It contains the basics for building a Shopify app. This template was modified from the original example node app to use a single Next.js native application.

Rather than cloning this repo, you can use your preferred package manager and the Shopify CLI with [these steps](#installing-the-template).

## Next.js and Shopify Embedded Apps

The goal of this template is to provide a quick and easy way to spin up a Shopify Embedded App that uses the Next.js platform. There a couple key points to be aware of when diving into the project:

### Providers

- in _app.tsx there are a number of Providers which are needed to get everything established for an Embedded App
  - **AppBridgeProvider**: This sets up AppBridge and resolves the host (from next/router) and API Key (from environment variables).
  - **APIProvider**: This is just an optional helper for accessing the API routes with session tokens from Shopify.
  - **ApolloProvider**: Sets up the Apollo context for running Graphql queries and mutations. This runs through the `/api/graphql` Next.js route and is handled by the Shopify API library.
  - **SessionProvider**: This ensures that the user always has an active session and that the app is installed correctly. It basically redirects the user to authenticate when it needs to.
    - In order to accomplish this, a request is sent to `/api/auth/verify` on every page load (client side). This was done client side to preserve the [Automatic Static Optimization](https://nextjs.org/docs/advanced-features/automatic-static-optimization) features in Next.js (only for pages that aren't the install page)
    - This route checks for online and offline tokens existing, validating online tokens and scope mismatches. 

### OAuth

OAuth is handled using the `/api/auth` and `/api/auth/callback` routes. The app is setup to use both online and offline tokens, by default. 

*Note that in order to use the `/api/graphql` route out of the box, you need to use **online** tokens.*

The install page, i.e. `/index.tsx`, must use getServerSideProps to handle the initial visit to the app and redirect users to OAuth from the server. 

*For some reason, I couldn't get client side redirects to work... If someone can do this please submit a pull request!*

### Environment Variables
There are a couple environment variables you need to set up in order for the app to run. Create a file called `.env.local` in the `/web` directory (or the root of your Next.js app) and add the following lines;

```bash
MONGODB_URI= # mongoDB uri goes here
```

The first two variables are automatically populated by the Shopify CLI.

## Todo

- ✅ Session saving using MongoDB
- ✅ OAuth flow for online and offline tokens
- ✅ GraphQl call using Apollo
- ❌ ~~Remove getServerSideProps from index.tsx~~
- ✅ New router config for Next.js and App Bridge
- ✅ AppUninstalled webhook - cleanup and delete sessions
- ⬜ Content-Security-Policy header (set in next.config.js? Currently this is set in getServerSideProps)
- ⬜ Billing checks in `/api/auth/verify`
- ⬜ Add the Shopify types for Graphql and Typescript (using graphql-codegen)
- ⬜ Prune excess leftover unused code
- ⬜ Remove the exitiframe.tsx page (unused)
- ⬜ Update project to use the new `/apps` directory from Next.js

## Benefits


Shopify apps are built on a variety of Shopify tools to create a great merchant experience. The [create an app](https://shopify.dev/apps/getting-started/create) tutorial in our developer documentation will guide you through creating a Shopify app using this template.

The Node app template comes with the following out-of-the-box functionality:

- OAuth: Installing the app and granting permissions
- GraphQL Admin API: Querying or mutating Shopify admin data
- REST Admin API: Resource classes to interact with the API
- Shopify-specific tooling:
  - AppBridge
  - Polaris
  - Webhooks

## Tech Stack

This template combines a number of third party open-source tools:

- [Next.js](https://nextjs.org/) builds the [React](https://reactjs.org/) frontend.

The following Shopify tools complement these third-party tools to ease app development:

- [Shopify API library](https://github.com/Shopify/shopify-node-api) adds OAuth to the Express backend. This lets users install the app and grant scope permissions.
- [App Bridge React](https://shopify.dev/apps/tools/app-bridge/getting-started/using-react) adds authentication to API requests in the frontend and renders components outside of the App’s iFrame.
- [Axios](https://axios-http.com/) for simple http requests for interacting with the API (Shopify or Custom API routes through Next API Pages).
- [Apollo](https://www.apollographql.com/) for interacting with the Shopify GraphQL API.
- [Polaris React](https://polaris.shopify.com/) is a powerful design system and component library that helps developers build high quality, consistent experiences for Shopify merchants.
- [Custom hooks](https://github.com/Shopify/shopify-frontend-template-react/tree/main/hooks) make authenticated requests to the Admin API.

## Getting started

### Requirements

1. You must [download and install Node.js](https://nodejs.org/en/download/) if you don't already have it.
1. You must [create a Shopify partner account](https://partners.shopify.com/signup) if you don’t have one.
1. You must [create a development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) if you don’t have one.

### Installing the template

This template can be installed using your preferred package manager:

Using yarn:

```shell
yarn create @shopify/app --template https://github.com/ozzyonfire/shopify-next-app.git
```

Using npx:

```shell
npx @shopify/create-app@latest --template https://github.com/ozzyonfire/shopify-next-app.git
```

This will clone the template and install the required dependencies.

#### Local Development

[The Shopify CLI](https://shopify.dev/apps/tools/cli) connects to an app in your Partners dashboard. It provides environment variables, runs commands in parallel, and updates application URLs for easier development.

You can develop locally using your preferred package manager. Run one of the following commands from the root of your app.

Using yarn:

```shell
yarn dev
```

Using npm:

```shell
npm run dev
```

Using pnpm:

```shell
pnpm run dev
```

Open the URL generated in your console. Once you grant permission to the app, you can start development.

## Deployment

### Application Storage

This template uses MongoDB for accessing and managing sessions. It uses a custom written solution to handle connections to the MongoDB database in the Next.js development and production environment. 

The database that works best for you depends on the data your app needs and how it is queried. You can run your database of choice on a server yourself or host it with a SaaS company. Here’s a short list of databases providers that provide a free tier to get started:

| Database   | Type             | Hosters                                                                                                                                                                                                                               |
| ---------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MySQL      | SQL              | [Digital Ocean](https://www.digitalocean.com/try/managed-databases-mysql), [Planet Scale](https://planetscale.com/), [Amazon Aurora](https://aws.amazon.com/rds/aurora/), [Google Cloud SQL](https://cloud.google.com/sql/docs/mysql) |
| PostgreSQL | SQL              | [Digital Ocean](https://www.digitalocean.com/try/managed-databases-postgresql), [Amazon Aurora](https://aws.amazon.com/rds/aurora/), [Google Cloud SQL](https://cloud.google.com/sql/docs/postgres)                                   |
| Redis      | Key-value        | [Digital Ocean](https://www.digitalocean.com/try/managed-databases-redis), [Amazon MemoryDB](https://aws.amazon.com/memorydb/)                                                                                                        |
| MongoDB    | NoSQL / Document | [Digital Ocean](https://www.digitalocean.com/try/managed-databases-mongodb), [MongoDB Atlas](https://www.mongodb.com/atlas/database)                                                                                                  |

To use one of these, you need to change your session storage configuration. To help, here’s a list of [SessionStorage adapters](https://github.com/Shopify/shopify-api-node/tree/main/src/auth/session/storage).

### Build

The frontend is a single page app. It requires the `SHOPIFY_API_KEY`, which you can find on the page for your app in your partners dashboard. Paste your app’s key in the command for the package manager of your choice:

Using yarn:

```shell
cd web/frontend/ && SHOPIFY_API_KEY=REPLACE_ME yarn build
```

Using npm:

```shell
cd web/frontend/ && SHOPIFY_API_KEY=REPLACE_ME npm run build
```

Using pnpm:

```shell
cd web/frontend/ && SHOPIFY_API_KEY=REPLACE_ME pnpm run build
```

### I can't get past the ngrok "Visit site" page

When you’re previewing your app or extension, you might see an ngrok interstitial page with a warning:

```text
You are about to visit <id>.ngrok.io: Visit Site
```

If you click the `Visit Site` button, but continue to see this page, then you should run dev using an alternate tunnel URL that you run using tunneling software.
We've validated that [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/run-tunnel/trycloudflare/) works with this template.

To do that, you can [install the `cloudflared` CLI tool](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/), and run:

```shell
# Note that you can also use a different port
cloudflared tunnel --url http://localhost:3000
```

In a different terminal window, navigate to your app's root and call:

```shell
# Using yarn
yarn dev --tunnel-url https://tunnel-url:3000
# or using npm
npm run dev --tunnel-url https://tunnel-url:3000
# or using pnpm
pnpm dev --tunnel-url https://tunnel-url:3000
```

## Developer resources

- [Introduction to Shopify apps](https://shopify.dev/apps/getting-started)
- [App authentication](https://shopify.dev/apps/auth)
- [Shopify CLI](https://shopify.dev/apps/tools/cli)
- [Shopify API Library documentation](https://github.com/Shopify/shopify-api-node/tree/main/docs)
