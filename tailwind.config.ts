import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import plugin from "tailwindcss/plugin";
import type { Config, PluginUtils } from "tailwindcss/types/config";

const config: Config = {
	content: ["./src/**/*.{html,js,md,svelte,ts}"],
	theme: {
		extend: {
			colors: {
				primary: {
					50: "#fff5ec",
					100: "#ffe9d3",
					200: "#ffcea5",
					300: "#ffac6d",
					400: "#ff7d32",
					500: "#ff590a",
					600: "#ff3e00",
					700: "#cc2902",
					800: "#a1210b",
					900: "#821e0c",
					950: "#460b04",
					DEFAULT: "#ff3e00", // 600
				},
			},
			typography: ({ theme }: PluginUtils) => ({
				DEFAULT: {
					css: {
						"--tw-prose-code": theme("colors.primary.700"),
						code: {
							...tw("rounded bg-primary-100 px-2 py-1 before:hidden after:hidden"),
						},
					},
				},
			}),
		},
	},
	plugins: [
		forms,
		typography,
		plugin(({ addComponents }) => {
			addComponents({
				".btn": {
					...tw("h-10 rounded-full border border-current px-6 font-medium text-primary"),
					"-webkit-tap-highlight-color": "transparent",
					"&:focus-visible": tw("outline-none ring-2 ring-current ring-offset-2"),
				},
				".input": {
					...tw("h-10 rounded border border-gray-300 px-2"),
					"&:focus-visible": tw("border-primary outline-none ring-2 ring-primary ring-offset-2"),
				},
				".label": tw("mb-1 text-sm font-medium"),
			});
		}),
	],
};

function tw(classes: string) {
	return { [`@apply ${classes}`]: "" };
}

export default config;
