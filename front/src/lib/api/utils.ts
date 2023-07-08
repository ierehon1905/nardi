import { BACKEND_HOST } from '$lib/constants';

type ApiDefinition<ApiResponse, ApiRequest> = {
	path: (params: ApiRequest) => string;
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	body?: (params: ApiRequest) => object;
};

export function createAction<ApiResponse = undefined, ApiRequest = undefined>(
	definition: ApiDefinition<ApiResponse, ApiRequest>
) {
	return definition;
}

type Api<T> = {
	[key in keyof T]: T[key] extends ApiDefinition<infer ApiResponse, infer ApiRequest>
		? (body?: ApiRequest) => Promise<ApiResponse>
		: unknown;
};

const protocol = new URL(BACKEND_HOST).protocol;
const cleanBackendHost = new URL(BACKEND_HOST).host;

export function buildApi<T extends { [key: string]: ApiDefinition<any, any> }>(
	apiSchema: T
): Api<T> {
	return Object.keys(apiSchema).reduce((acc, key) => {
		const { path, method, body } = apiSchema[key as keyof typeof apiSchema];
		acc[key] = (params?: any) => {
			const compiledPath = path(params);

			const url = `${protocol}//${cleanBackendHost}${compiledPath}`;

			const compiledBody = body ? body(params) : undefined;
			const rawBody = compiledBody ? JSON.stringify(compiledBody) : undefined;

			return fetch(url, {
				method,
				body: rawBody,
				credentials: 'include'
			}).then((res) => {
				const contentType = res.headers.get('content-type');
				if (contentType && contentType.includes('application/json')) {
					return res.json();
				}
				return res.text();
			});
		};
		return acc;
	}, {} as any) as Api<T>;
}
