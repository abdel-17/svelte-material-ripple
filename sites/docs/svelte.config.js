import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsx } from "mdsx";
import mdsxConfig from "./mdsx.config.js";

/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: [mdsx(mdsxConfig), vitePreprocess()],
	extensions: [".svelte", ...mdsxConfig.extensions],
	kit: {
		adapter: adapter(),
		typescript: {
			config(config) {
				return {
					...config,
					include: [...config.include, "../src/markdown.d.ts"],
				};
			},
		},
	},
};
