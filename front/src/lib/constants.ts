import { PUBLIC_BACKEND_HOST } from '$env/static/public';

export const BACKEND_HOST = PUBLIC_BACKEND_HOST || 'http://localhost:8080';
export const DEBUG = false;
