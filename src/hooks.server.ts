import { spawn } from 'child_process';

console.log('server started');

// eslint-disable-next-line no-constant-condition
if (false) {
	const backedExecutable = '/Users/leon/dev/go/nardi/backend/build/gostrip';

	// const { spawn } = require('child_process');

	const backend = spawn(backedExecutable, {
		stdio: 'inherit'
	});

	let shutdownInProgress = false;
	// eslint-disable-next-line
	function shutdownGracefully(signal?: NodeJS.Signals) {
		if (shutdownInProgress) {
			return;
		}
		shutdownInProgress = true;
		console.log('server shutdown');
		backend.kill(signal);
	}

	process.title = 'nardy-server';
	process.on('SIGINT', () => shutdownGracefully('SIGINT'));
	process.on('SIGTERM', () => shutdownGracefully('SIGTERM'));

	process.on('exit', () => {
		shutdownGracefully();
	});
}
