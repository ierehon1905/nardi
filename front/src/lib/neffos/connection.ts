import { browser } from '$app/environment';
import { BACKEND_HOST } from '$lib/constants';
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
					console.log(`Received game-start`, ns.namespace, msg.Body);
				}
			}
		},
		{
			reconnnect: 5
		}
	);

	client.connect('default');

	setClient(client);
}
