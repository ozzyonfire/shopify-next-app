import {
	canonicalizeHeaders,
	flatHeaders,
	AdapterArgs,
	NormalizedRequest,
	NormalizedResponse,
	Headers as ShopifyHeaders,
	addHeader,
} from '@shopify/shopify-api/runtime';
import { headers as nextHeaders } from 'next/headers';
import { ShopifyError } from '@shopify/shopify-api';

interface NextAdapterArgs extends AdapterArgs {
	rawRequest: Request;
}

export async function nextConvertRequest(adapterArgs: NextAdapterArgs): Promise<NormalizedRequest> {
	const request = adapterArgs.rawRequest;
	const url = new URL(request.url);
	const headers = {};

	nextHeaders().forEach((value, key) => {
		addHeader(headers, key, value);
	});

	return {
		headers,
		method: request.method,
		url: `${url.pathname}${url.search}${url.hash}`,
	}
}

export async function nextConvertResponse(response: NormalizedResponse, adapterArgs: NextAdapterArgs): Promise<Response> {
	const newHeaders = await nextConvertHeaders(response.headers ?? {}, adapterArgs);
	return new Response(response.body, {
		status: response.statusCode,
		headers: newHeaders,
	});
}

export async function nextConvertHeaders(
	headers: ShopifyHeaders,
	_adapterArgs: NextAdapterArgs,
): Promise<Headers> {
	// this may not actually be necessary, but it's here for now
	const newHeaders = new Headers();
	Object.entries(headers).forEach(([key, value]) => {
		if (value instanceof Array) {
			value.forEach((v) => {
				newHeaders.append(key, v);
			});
		} else {
			newHeaders.append(key, value);
		}
	});

	return newHeaders;
	// return Promise.resolve(flatHeaders(headers ?? {}));
}

export async function nextFetch({
	url,
	method,
	headers = {},
	body,
}: NormalizedRequest): Promise<NormalizedResponse> {
	const response = await fetch(url, {
		method,
		headers: flatHeaders(headers),
		body,
	});

	return {
		statusCode: response.status,
		statusText: response.statusText,
		headers: canonicalizeHeaders(Object.fromEntries(response.headers.entries())),
		body: await response.text(),
	};
}


export function workerCreateDefaultStorage(): never {
	throw new ShopifyError(
		'You must specify a session storage implementation for NextJS',
	);
}

export function workerRuntimeString(): string {
	return 'NextJS App Router';
}