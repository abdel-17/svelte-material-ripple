import { defineConfig } from "mdsx";
import rehypePrettyCode from "rehype-pretty-code";

/** @type {import("rehype-pretty-code").Options} */
const prettyCodeOptions = {
	theme: "one-dark-pro",
};

export default defineConfig({
	extensions: [".md"],
	rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
	blueprints: {
		default: {
			path: "./src/lib/components/markdown/blueprint.svelte",
		},
	},
});
