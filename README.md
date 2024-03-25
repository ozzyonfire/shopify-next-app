# Shopify App Template - Next.js App Router

This is a template for building a [Shopify app](https://shopify.dev/apps/getting-started) using Next.js and Typescript. It contains the basics for building a Shopify app on Next.js using the app router and server components.

Rather than cloning this repo, you can use your preferred package manager and the Shopify CLI with [these steps](#installing-the-template).

### Installing the template

This template can be installed using your preferred package manager:

Using pnpm (recommended):

```shell
pnpx @shopify/create-app@latest --template https://github.com/ozzyonfire/shopify-next-app.git
```

Using yarn:

```shell
yarn create @shopify/app --template https://github.com/ozzyonfire/shopify-next-app.git
```

Using npx:

```shell
npx @shopify/create-app@latest --template https://github.com/ozzyonfire/shopify-next-app.git
```

This will clone the template and install the required dependencies.

## Next.js and Shopify Embedded Apps

The goal of this template is to provide a quick and easy way to spin up a Shopify Embedded App that uses the Next.js app router platform. Some of the following information was previusly necessary for the `pages` router, so I am working on migrating some of the legacy code.

### Providers

- in `layout.tsx` we setup some providers that are necessary for the app to run.
  - **ApolloProvider**: (Optional) Sets up the Apollo context for running Graphql queries and mutations. This runs through the `/api/graphql` Next.js route and is handled by the Shopify API library.
  - **SessionProvider**: (Optional) This ensures that the user always has an active session and that the app is installed correctly. It basically redirects the user to authenticate when it needs to.

### OAuth

### Token exchange

The app template uses token exchange by default. The user gets the ID Token from the initial page load and sends it to the server where it is stored. This happens using a server action.

Also, all server actions should have the session token sent along with them, the server can then verify and exchange the token if needed.

### OAuth (old way - to be deprecated)

OAuth is handled using the `/api/auth` and `/api/auth/callback` routes. The app is setup to use both online and offline tokens, by default.

_Note that in order to use the `/api/graphql` route out of the box, you need to use **online** tokens._

### Environment Variables

There are a couple environment variables you need to set up in order for the app to run. Create a file called `.env` in the root directory (or the root of your Next.js app) and add the following lines;

```bash
DATABASE_URL= # database connection string - for connecting to prisma
POSTGRES_PASSWORD= # optional database password - when running postgres db locally through docker
```

The first two variables are automatically populated by the Shopify CLI.

## Todo

- ✅ Session saving using MongoDB
- ✅ OAuth flow for online and offline tokens
- ✅ GraphQl call using Apollo
- ✅ New router config for Next.js and App Bridge
- ✅ AppUninstalled webhook - cleanup and delete sessions
- ✅ Database sessions managed through Prisma
- ✅ Remove the APIProvider and use fetch instead
- ⬜ Prune excess leftover unused code

## Tech Stack

This template combines a number of third party open-source tools:

- [Next.js](https://nextjs.org/) builds the [React](https://reactjs.org/) frontend.

The following Shopify tools complement these third-party tools to ease app development:

- [Shopify API library](https://github.com/Shopify/shopify-api-js?tab=readme-ov-file) manages OAuth on the serverless backend. This lets users install the app and grant scope permissions.
- [App Bridge React](https://shopify.dev/apps/tools/app-bridge/getting-started/using-react) adds authentication to API requests in the frontend and renders components outside of the App’s iFrame.
- [Apollo](https://www.apollographql.com/) for interacting with the Shopify GraphQL API (Optional).
- [Polaris React](https://polaris.shopify.com/) is a powerful design system and component library that helps developers build high quality, consistent experiences for Shopify merchants.
- [Prisma](https://www.prisma.io/) for managing database connections and migrations.

## Getting started

#### Local Development

[The Shopify CLI](https://shopify.dev/apps/tools/cli) connects to an app in your Partners dashboard. It provides environment variables, runs commands in parallel, and updates application URLs for easier development.

You can develop locally using your preferred package manager.

Using pnpm:

```shell
pnpm run dev
```

You can also get up and running with Docker. This will setup and initialize the postgres database for you.

```shell
docker-compose up
pnpm run migrate
```

Open the URL generated in your console. Once you grant permission to the app, you can start development.

## Deployment

You can deploy this app to a hosting service of your choice. Here is the basic setup for deploying to Vercel:

- Create you Shopify App in the Shopify Partners Dashboard
- Create your project on Vercel and add the environment variables from your Shopify App
  - `SHOPIFY_API_KEY`
  - `SHOPIFY_API_SECRET`
  - `SCOPES`
  - `HOST`
  - Any database connection strings
- Setup your Shopify App to have the same `/api/auth/callback` and `/api/auth` routes as your Vercel deployment (with your hostname)

Vercel should be setup to build using the default Next.js build settings.

You should also be using a managed Shopify deployment. This will handle scope changes on your app.

```shell
pnpm run deploy
```

### Application Storage

This template uses Prisma to store and manage sessions. For more information on how to set up Prisma, see the [Prisma documentation](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch-typescript-postgres).

## Developer resources

- [Introduction to Shopify apps](https://shopify.dev/apps/getting-started)
- [App authentication](https://shopify.dev/apps/auth)
- [Shopify CLI](https://shopify.dev/apps/tools/cli)
- [Shopify API Library documentation](https://github.com/Shopify/shopify-api-node/tree/main/docs)
