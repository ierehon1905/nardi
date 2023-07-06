import type { GetSessionResponse } from './types';
import { createAction, buildApi } from './utils';

const apiSchema = {
	getSession: createAction<GetSessionResponse, undefined | { name?: string }>({
		path: '/api/user-session',
		method: 'POST'
	})
};

export const api = buildApi(apiSchema);
