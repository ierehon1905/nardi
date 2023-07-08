import { browser } from '$app/environment';
// import { page } from '$app/stores';

// console.log(
// 	'all',
// 	page.subscribe((page) => {
// 		console.log('page', page.data);
// 	})
// );

import en from './en.json';
import ru from './ru.json';
import am from './am.json';
// import { headers } from '$app/headers';

const locales: Record<string, Record<string, string | string[]>> = { en, ru, am };

let serverLocale = {
	lang: 'en'
};

export const setServerLocale = (locale: string) => {
	console.log('setServerLocale', locale);

	serverLocale = {
		lang: locale
	};
};

const getLocale = () => {
	if (browser) {
		const userLocales = navigator.languages;

		// pick first that matches en,ru,am and fallback to en
		const locale = userLocales.find((locale) => locales[locale.slice(0, 2)]) || 'en';
		return locale.slice(0, 2);
	} else {
		return serverLocale.lang || 'en';
	}
};

const COUNT_PARAM_NAME = 'count';

const pluralRulesMap: Record<Intl.LDMLPluralRule, number> = {
	zero: 0,
	one: 1,
	two: 2,
	few: 3,
	many: 4,
	other: 5
};

export type Key = keyof typeof en;

const locale = getLocale();

const pluralRules = new Intl.PluralRules(locale);

export const i18n = (key: Key, params?: Record<string, string>) => {
	return rawI18n(locale, key, params);
};

export const rawI18n = (customLocale: string, key: Key, params?: Record<string, string>) => {
	const manyRawTranslations = locales[customLocale]?.[key] || locales.en[key] || key;

	if ((!params || !(COUNT_PARAM_NAME in params)) && Array.isArray(manyRawTranslations)) {
		console.warn(`No ${COUNT_PARAM_NAME} param provided for ${key} translation`);
	}

	const rawTranslation = Array.isArray(manyRawTranslations)
		? manyRawTranslations[
				pluralRulesMap[pluralRules.select(Number(params?.[COUNT_PARAM_NAME]) ?? 1)]
		  ]
		: manyRawTranslations;

	if (!params) {
		return rawTranslation;
	}

	return Object.entries(params).reduce((acc, [key, value]) => {
		return acc.replace(new RegExp(`{{${key}}}`, 'g'), value);
	}, rawTranslation);
};
