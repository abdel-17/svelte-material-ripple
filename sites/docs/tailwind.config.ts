import typography from "@tailwindcss/typography";
import plugin from "tailwindcss/plugin";
import type { Config, PluginUtils } from "tailwindcss/types/config";

export default {
	content: ["./src/**/*.{html,js,ts,svelte,md}"],
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
				},
			},
			typography: ({ theme }: PluginUtils) => ({
				DEFAULT: {
					css: {
						"--tw-prose-code": theme("colors.primary.700"),
						code: {
							backgroundColor: theme("colors.primary.100"),
							borderRadius: theme("borderRadius.DEFAULT"),
							paddingInline: theme("spacing[1.5]"),
							paddingBlock: theme("spacing[0.5]"),
							"&::before, &::after": {
								display: "none",
							},
						},
					},
				},
			}),
		},
	},
	plugins: [
		typography,
		plugin(({ addComponents, theme }) => {
			addComponents({
				".btn": {
					position: "relative",
					height: theme("spacing.10"),
					borderRadius: "9999px",
					borderWidth: "1px",
					borderColor: "currentColor",
					paddingInline: theme("spacing.6"),
					fontWeight: "500",
					color: theme("colors.primary.600"),
					"-webkit-tap-highlight-color": "transparent",
					"&:focus-visible": {
						outlineStyle: "solid",
						outlineWidth: "2px",
						outlineOffset: "2px",
						outlineColor: theme("colors.primary.600"),
					},
				},
				".label": {
					fontSize: theme("fontSize.sm"),
					lineHeight: "1.25rem",
					fontWeight: "500",
				},
				".input": {
					height: theme("spacing.10"),
					borderRadius: theme("borderRadius.DEFAULT"),
					borderWidth: "1px",
					borderColor: theme("colors.gray.300"),
					paddingInline: theme("spacing.2"),
					"&:focus-visible": {
						outlineStyle: "solid",
						outlineWidth: "2px",
						outlineOffset: "2px",
						outlineColor: theme("colors.primary.600"),
						borderColor: theme("colors.primary.600"),
					},
				},
				".color-picker": {
					height: theme("spacing.10"),
					width: theme("spacing.10"),
					borderRadius: "9999px",
					cursor: "pointer",
					appearance: "none",
					border: "none",
					backgroundColor: "transparent",
					"&::-webkit-color-swatch-wrapper": {
						padding: "0",
					},
					"&::-webkit-color-swatch": {
						borderRadius: "9999px",
						border: "none",
					},
					"&::-moz-color-swatch": {
						borderRadius: "9999px",
						border: "none",
					},
					"&:focus-visible": {
						outlineStyle: "solid",
						outlineWidth: "2px",
						outlineOffset: "2px",
						outlineColor: theme("colors.primary.600"),
					},
				},
				".switch": {
					position: "relative",
					height: theme("spacing.7"),
					width: theme("spacing.12"),
					appearance: "none",
					borderRadius: "9999px",
					backgroundColor: theme("colors.neutral.600"),
					transition: "background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)",
					"&::before": {
						content: `""`,
						position: "absolute",
						top: "50%",
						height: theme("spacing.5"),
						width: theme("spacing.5"),
						transform: `translate(${theme("spacing.1")}, -50%)`,
						borderRadius: "9999px",
						backgroundColor: "white",
						transition: "transform 150ms cubic-bezier(0.4, 0, 0.2, 1)",
					},
					"&:checked": {
						backgroundColor: theme("colors.primary.600"),
						"&::before": {
							transform: `translate(${theme("spacing.6")}, -50%)`,
						},
					},
				},
			});
		}),
	],
} satisfies Config;
