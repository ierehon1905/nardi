const BACKEND_URL = 'http://localhost:8080';

async function main() {
	const polka = (await import('polka')).default;
	const proxy = (await import('http-proxy-middleware')).createProxyMiddleware;

	/**
	 * @type {import('./build/handler')}
	 */
	const { handler } = await import('./handler.js');

	const app = polka();

	// proxy all requests to /api to the backend
	app.use(
		'/api',
		proxy('/api', {
			target: BACKEND_URL
		})
	);

	app.use(handler);

	app.listen(3000, (err) => {
		if (err) throw err;
		console.log(`> Running on localhost:3000`);
	});
}

module.exports = main();
