import type { AppProps } from 'next/app'
import { AppBridgeProvider } from '../providers/AppBridgeProvider'
import { AppProvider } from '@shopify/polaris'
import translations from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/build/esm/styles.css';
import APIProvider from '../providers/APIProvider';
import ApolloProvider from '../providers/ApolloProvider';
import SessionProvider from '../providers/SessionProvider';

export default function App({ Component, pageProps }: AppProps) {
  console.log('in _app.tsx');

  return (
    <AppProvider i18n={translations}>
      <AppBridgeProvider>
        <APIProvider>
          <ApolloProvider>
            <SessionProvider>
              <Component {...pageProps} />
            </SessionProvider>
          </ApolloProvider>
        </APIProvider>
      </AppBridgeProvider>
    </AppProvider>
  )
}