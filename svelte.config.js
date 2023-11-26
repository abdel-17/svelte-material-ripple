import { preprocessMeltUI } from "@melt-ui/pp";
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/kit/vite";
import { mdsvex } from "mdsvex";
import sequence from "svelte-sequential-preprocessor";
import mdsvexConfig from "./mdsvex.config.js";

/** @type {import('@sveltejs/kit').Config}*/
const config = {
	extensions: [".svelte", ...mdsvexConfig.extensions],
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: sequence([vitePreprocess({}), mdsvex(mdsvexConfig), preprocessMeltUI()]),
	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		alias: {
			$docs: "./src/docs",
		},
	},
};

export default config;
