import type { Handle } from '@sveltejs/kit';

const getLang = (headers: Headers) => {
	const rawAcceptLanguage = headers.get('accept-language');

	if (!rawAcceptLanguage) {
		return 'en';
	}

	const lang =
		rawAcceptLanguage
			.split(',')
			.filter((lang) => lang.split(';')[0].match(/^(en|ru|am)/))
			.map((lang) => {
				const pair = lang.split(';');
				const qA = pair[1] ? Number(pair[1].split('=')[1]) : 1;
				return [pair[0], qA] as const;
			})
			.sort((a, b) => {
				return b[1] - a[1];
			})
			.map((lang) => lang[0].slice(0, 2))
			.at(0) || 'en';

	return lang;
};

export const handle = (async ({ event, resolve }) => {
	const lang = getLang(event.request.headers);

	event.locals.lang = lang;

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});
}) satisfies Handle;
