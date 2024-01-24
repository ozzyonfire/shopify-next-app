import {
	setAbstractFetchFunc,
	setAbstractConvertRequestFunc,
	setAbstractConvertResponseFunc,
	setAbstractRuntimeString,
	setAbstractConvertHeadersFunc,
} from '@shopify/shopify-api/runtime';

import {
	nextConvertRequest,
	nextConvertResponse,
	nextFetch,
	nextConvertHeaders,
	workerRuntimeString
} from './next-adapter';

setAbstractFetchFunc(nextFetch);
setAbstractConvertRequestFunc(nextConvertRequest);
setAbstractConvertResponseFunc(nextConvertResponse);
setAbstractConvertHeadersFunc(nextConvertHeaders);
setAbstractRuntimeString(workerRuntimeString);