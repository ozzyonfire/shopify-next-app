/** @type {import('next').NextConfig} */
const host = process.env.HOST;

const nextConfig = {
  env: {
    NEXT_PUBLIC_HOST: host,
    NEXT_PUBLIC_SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
  },
  allowedDevOrigins: host ? [host.replace(/^https?:\/\//, "")] : [],
};

module.exports = nextConfig;
