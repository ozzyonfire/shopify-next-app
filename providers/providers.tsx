'use client';

import { AppProvider } from '@shopify/polaris'
import translations from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/build/esm/styles.css';
import { AppBridgeProvider } from './AppBridgeProvider';
import APIProvider from './APIProvider';
import ApolloProvider from './ApolloProvider';
import SessionProvider from './SessionProvider';

export default function Providers({
	children
}: {
	children: React.ReactNode
}) {
	return (
		<AppProvider i18n={translations}>
			<AppBridgeProvider>
				<APIProvider>
					<ApolloProvider>
						<SessionProvider>
							{children}
						</SessionProvider>
					</ApolloProvider>
				</APIProvider>
			</AppBridgeProvider>
		</AppProvider>
	)
}

export function ExitProvider({
	children
}: {
	children: React.ReactNode
}) {
	return (
		<AppProvider i18n={translations}>
			<AppBridgeProvider>
				{children}
			</AppBridgeProvider>
		</AppProvider>
	)
}