import adapterNode from '@sveltejs/adapter-node';
import adapterStatic from '@sveltejs/adapter-static';

const useStaticHosting = process.env.FIREBASE_STATIC === '1';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: ({ filename }) =>
			filename.split(/[/\\]/).includes('node_modules') ? undefined : true
	},
	kit: {
		adapter: useStaticHosting
			? adapterStatic({
					fallback: 'index.html',
					strict: false
				})
			: adapterNode(),
		prerender: {
			handleUnseenRoutes: 'ignore',
			handleHttpError: ({ status, path }) => {
				if (status === 404 || status === 500) {
					console.warn(`Prerender skipped ${path} (${status})`);
					return;
				}
			}
		}
	}
};

export default config;
