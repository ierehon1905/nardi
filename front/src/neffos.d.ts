import 'neffos.js';

declare module 'neffos.js' {
	export type ConnHandler = {
		default: {
			_OnNamespaceConnect?: (nsConn: NSConn, msg: Message) => void;
			_OnNamespaceConnected?: (nsConn: NSConn, msg: Message) => void;
			_OnNamespaceDisconnect?: (nsConn: NSConn, msg: Message) => void;
			_OnRoomJoin?: (nsConn: NSConn, msg: Message) => void;
			_OnRoomJoined?: (nsConn: NSConn, msg: Message) => void;
			_OnRoomLeave?: (nsConn: NSConn, msg: Message) => void;
			_OnRoomLeft?: (nsConn: NSConn, msg: Message) => void;
			_OnAnyEvent?: (nsConn: NSConn, msg: Message) => void;
			_OnNativeMessage?: (nsConn: NSConn, msg: Message) => void;
			[customEvent: string]: undefined | ((nsConn: NSConn, msg: Message) => void);
		};
	};

	export function dial(
		endpoint: string,
		connHandler: ConnHandler,
		options?: Options
	): Promise<Conn>;
}
