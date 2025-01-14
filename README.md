# Shopify App Template - Next.js App Router

This is a template for building a
[Shopify app](https://shopify.dev/apps/getting-started) using Next.js and
Typescript. It contains the basics for building a Shopify app on Next.js using
the app router and server components.

## Features

- **Next.js**: Using the latest app router and server components.
- **Prisma (Optional)**: For managing database connections and migrations.
- **Tanstack Query**: For interacting with the Shopify GraphQL API.
- **App Bridge v4**: For authenticating API requests in the frontend.
- **Shopify API library**: For managing OAuth on the serverless backend.
- **Polaris React**: For building high quality, consistent experiences for
  Shopify merchants.
- **Tailwind CSS**: For fast, flexible styling and design.
- **Docker (Optional)**: For setting up the postgres database for local
  development.
- **Graphql-Codegen**: For generating types for graphql queries and mutations.

### Installing the template

This template can be installed using your preferred package manager:

Using pnpm (recommended):

```shell
pnpx @shopify/create-app@latest --template https://github.com/ozzyonfire/shopify-next-app.git
```

This will clone the template and install the required dependencies.

## Next.js and Shopify Embedded Apps

The goal of this template is to provide a quick and easy way to spin up a
Shopify Embedded App that uses the Next.js app router platform.

The template uses a couple features of app bridge v4 to make your life easier,
like authentication and session management.

### Providers

- in `layout.tsx` we setup some providers that are necessary for the app to run.
  - **ApolloProvider**: (Optional) Sets up the Apollo context for running
    Graphql queries and mutations. This runs through the `/api/graphql` Next.js
    route and is handled by the Shopify API library.
  - **SessionProvider**: (Optional) This ensures that the user always has an
    active session and that the app is installed correctly. It basically
    redirects the user to authenticate when it needs to.

### App Bridge

We use direct api mode and the new install flow so app installs are handled
automatically.

```toml
[access.admin]
direct_api_mode = "offline"
embedded_app_direct_api_access = true

[access_scopes]
# Learn more at https://shopify.dev/docs/apps/tools/cli/configuration#access_scopes
scopes = ""
use_legacy_install_flow = false
```

### Token exchange

The app template uses token exchange by default. The user gets the ID Token from
the initial page load and sends it to the server where it is stored. This
happens using a server action.

Also, all server actions should have the session token sent along with them, the
server can then verify and exchange the token if needed.

### Environment Variables

There are a couple environment variables you need to set up in order for the app
to run. Create a file called `.env` in the root directory (or the root of your
Next.js app) and add the following lines;

```bash
DATABASE_URL= # database connection string - for connecting to prisma
POSTGRES_PASSWORD= # optional database password - when running postgres db locally through docker
```

The first two variables are automatically populated by the Shopify CLI.

## Tech Stack

This template combines a number of third party open-source tools:

- [Next.js](https://nextjs.org/) builds the [React](https://reactjs.org/)
  frontend.

The following Shopify tools complement these third-party tools to ease app
development:

- [Shopify API library](https://github.com/Shopify/shopify-api-js?tab=readme-ov-file)
  manages OAuth on the serverless backend. This lets users install the app and
  grant scope permissions.
- [App Bridge React](https://shopify.dev/apps/tools/app-bridge/getting-started/using-react)
  adds authentication to API requests in the frontend and renders components
  outside of the App’s iFrame.
- [Apollo](https://www.apollographql.com/) for interacting with the Shopify
  GraphQL API (Optional).
- [Prisma](https://www.prisma.io/) for managing database connections and
  migrations. This is optional, but gives you a nice ORM to work with. The
  template is database agnostic, so you can use any database you want.

## Getting started

### Local Development

[The Shopify CLI](https://shopify.dev/apps/tools/cli) connects to an app in your
Partners dashboard. It provides environment variables, runs commands in
parallel, and updates application URLs for easier development.

You can develop locally using your preferred package manager.

Using pnpm:

```shell
pnpm run dev
```

#### Docker for local development

You can also get up and running with Docker. This will setup and initialize the
postgres database for you.

```shell
docker-compose up
pnpm run migrate
```

#### Graphql-Codegen

If you run the following command, it will generate the types for the graphql
queries and mutations.

```shell
pnpm run graphql-codegen
```

This sets up your types when using Apollo client and gives your intellisense in
your IDE.

## Deployment

You can deploy this app to a hosting service of your choice. Here is the basic
setup for deploying to Vercel:

- Create you Shopify App in the Shopify Partners Dashboard
- Create your project on Vercel and add the environment variables from your
  Shopify App
  - `SHOPIFY_API_KEY`
  - `SHOPIFY_API_SECRET`
  - `SCOPES`
  - `HOST`
  - Any database connection strings
- Setup your Shopify App to have the same `/api/auth/callback` and `/api/auth`
  routes as your Vercel deployment (with your hostname)

Vercel should be setup to build using the default Next.js build settings.

You should also be using a managed Shopify deployment. This will handle scope
changes on your app.

```shell
pnpm run deploy
```

### Application Storage

This template uses Prisma to store and manage sessions. For more information on
how to set up Prisma, see the
[Prisma documentation](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch-typescript-postgres).

## Developer resources

- [Introduction to Shopify apps](https://shopify.dev/apps/getting-started)
- [App authentication](https://shopify.dev/apps/auth)
- [Shopify CLI](https://shopify.dev/apps/tools/cli)
- [Shopify API Library documentation](https://github.com/Shopify/shopify-api-node/tree/main/docs)
