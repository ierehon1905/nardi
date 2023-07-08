import type neffos from 'neffos.js';

export let client: neffos.Conn | undefined;

export const setClient = (c: neffos.Conn) => {
	client = c;
};
