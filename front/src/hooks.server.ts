import type { Handle } from '@sveltejs/kit';
/**
 * @type {import('got')}
 */
import got from 'got';
// import ""

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/api')) {
		const origin = event.request.headers.get('Origin');

		// reject requests that don't come from the webapp, to avoid your proxy being abused.
		// if (!origin || new URL(origin).origin !== event.url.origin) {
		// 	return new Response('Request Forbidden.', { status: 403 });
		// }

		const url = new URL(event.request.url);
		url.hostname = 'localhost';
		url.port = '8080';

		// const response = await resolve({
		// 	...event,
		// 	request: new Request(url.toString(), event.request)
		// });
		// return response;
		// resolve({
		//     fetch
		// })

		// event.request.headers.delete('connection');
		console.log('request', event.request.headers);

		const response = await event.fetch(url.toString(), {
			headers: event.request.headers
		});

		console.log('response', response.headers);

		return response;

		// return new Response(response.body, response);
		// return new Response('custom response');
	}

	const response = await resolve(event);
	return response;
};

// request.url.replace(url.origin, 'http://localhost:8080' + url.pathname),
