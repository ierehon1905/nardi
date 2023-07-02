async function main() {
	const polka = (await import('polka')).default;
	const proxy = (await import('http-proxy-middleware')).createProxyMiddleware;

	/**
	 * @type {import('./build/handler')}
	 */
	const { handler } = await import('./handler.js');

	const app = polka();

	const proxyMiddleWare = proxy({
		target: 'http://localhost:8080',
		ws: true,
		logLevel: 'debug',
		changeOrigin: true
	});

	app.use((req, res, next) => {
		if (req.url.startsWith('/api')) {
			proxyMiddleWare(req, res, next);
		} else {
			handler(req, res, next);
		}
	});

	app.use(handler);

	app.listen(3000, (err) => {
		if (err) throw err;
		console.log(`> Running on localhost:3000`);
	});
}

module.exports = main();
