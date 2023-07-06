import { BACKEND_HOST } from '$lib/constants';

type ApiDefinition<ApiResponse, ApiRequest> = {
	path: string;
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	body?: any;
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

const cleanBackendHost = BACKEND_HOST.endsWith('/') ? BACKEND_HOST.slice(0, -1) : BACKEND_HOST;

export function buildApi<T extends { [key: string]: ApiDefinition<any, any> }>(
	apiSchema: T
): Api<T> {
	return Object.keys(apiSchema).reduce((acc, key) => {
		const { path, method } = apiSchema[key as keyof typeof apiSchema];
		acc[key] = (body?: any) => {
			console.log('fetching', path, method, body);
			const url = `${cleanBackendHost}${path}`;
			return fetch(url, {
				method,
				body: body ? JSON.stringify(body) : undefined,
				credentials: 'include'
			}).then((res) => res.json());
		};
		return acc;
	}, {} as any) as Api<T>;
}
