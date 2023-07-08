import type { GetSessionResponse } from './types';
import { createAction, buildApi } from './utils';

const apiSchema = {
	getSession: createAction<GetSessionResponse, undefined | { name?: string }>({
		path: () => '/api/user-session',
		method: 'POST'
	}),
	ping: createAction({
		path: () => '/api/ping',
		method: 'GET'
	}),
	getGame: createAction<any, { id: string }>({
		path: ({ id }) => `/api/game/${id}`,
		method: 'GET'
	}),
	getGames: createAction<any, undefined>({
		path: () => '/api/game',
		method: 'GET'
	}),
	logout: createAction({
		path: () => '/api/logout',
		method: 'GET'
	})
};

export const api = buildApi(apiSchema);
