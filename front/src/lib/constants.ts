import { PUBLIC_BACKEND_HOST } from '$env/static/public';

/**
 * Without scheme and trailing slash
 */
export const BACKEND_HOST = PUBLIC_BACKEND_HOST || 'localhost:8080';
export const DEBUG = false;
