import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// We enable top-level for neffos to compile as it uses it
// in node environment (that we never use) but esbuild
// doesn't not differentiate between node and browser
// and it fails to compile

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		esbuildOptions: {
			supported: {
				'top-level-await': true
			}
		}
	},
	esbuild: {
		supported: {
			'top-level-await': true
		}
	}
});
