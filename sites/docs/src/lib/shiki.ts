import { createHighlighterCoreSync, createJavaScriptRegexEngine } from "shiki";
import svelte from "shiki/langs/svelte.mjs";
import oneDarkPro from "shiki/themes/one-dark-pro.mjs";

export const shiki = createHighlighterCoreSync({
	engine: createJavaScriptRegexEngine(),
	langs: [svelte],
	themes: [oneDarkPro],
});
