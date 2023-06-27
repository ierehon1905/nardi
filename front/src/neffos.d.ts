import type * as neffos from 'neffos.js';

declare global {
	declare const neffos: typeof import('neffos').default;
}

export as namespace neffos;
export = neffos;
