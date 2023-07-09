import { browser } from '$app/environment';
import { BACKEND_HOST } from '$lib/constants';
import Cookies from 'js-cookie';

import { writable, get } from 'svelte/store';

import * as neffos from 'neffos.js';
import { setClient } from './client';

const { OnAnyEvent, OnNamespaceConnect, OnNamespaceConnected } = neffos;

let protocol = 'ws';
if (browser) {
	protocol = location.protocol === 'https:' ? 'wss' : 'ws';
}

const cleanBackendHost = new URL(BACKEND_HOST).host;

const websocketURL = `${protocol}://${cleanBackendHost}/api/ws`;

export async function initConnection() {
	const client = await neffos.dial(
		websocketURL,
		{
			default: {
				[OnAnyEvent]: (ns, msg) => {
					console.log(ns.namespace, msg.Body);
				},
				[OnNamespaceConnect]: (ns, msg) => {
					console.log(`Received OnNamespaceConnect`, ns.namespace, msg.Body);
				},
				[OnNamespaceConnected]: (ns, msg) => {
					console.log(`Received OnNamespaceConnected`, ns.namespace, msg.Body);
				},
				'game-start': (ns, msg) => {
					const room = msg.Room;

					if (get(gameState).room !== room) {
						console.warn(
							`Received game-start for room ${room} but current room is ${get(gameState).room}`
						);
						return;
					}

					gameState.update((state) => ({
						...state,
						room,
						phase: 'in-progress'
					}));
				},
				'game-move': (ns, msg) => {
					const room = msg.Room;
					console.log('game-move', JSON.parse(msg.Body));
				},
				'game-end': (ns, msg) => {
					const room = msg.Room;

					if (get(gameState).room !== room) {
						console.warn(
							`Received game-end for room ${room} but current room is ${get(gameState).room}`
						);
						return;
					}

					gameState.update((state) => ({
						...state,
						room,
						phase: 'finished'
					}));
				}
			}
		},
		{
			reconnnect: 5,
			headers: {
				npid: Cookies.get('npid') || ''
			}
		}
	);

	client.connect('default');

	setClient(client);
}

type GamePhase = 'none' | 'waiting-start' | 'in-progress' | 'finished';

type GameState = {
	room?: string;
	phase?: GamePhase;
};

export const gameState = writable({} as GameState);
