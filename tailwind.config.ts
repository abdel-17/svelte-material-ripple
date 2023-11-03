import typography from '@tailwindcss/typography';
import plugin from 'tailwindcss/plugin';
import type { Config, PluginUtils } from 'tailwindcss/types/config';

const config: Config = {
	content: ['./src/**/*.{html,js,md,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: {
					'50': '#fff5ec',
					'100': '#ffe9d3',
					'200': '#ffcea5',
					'300': '#ffac6d',
					'400': '#ff7d32',
					'500': '#ff590a',
					'600': '#ff3e00',
					'700': '#cc2902',
					'800': '#a1210b',
					'900': '#821e0c',
					'950': '#460b04',
				},
			},
			typography: ({ theme }: PluginUtils) => ({
				DEFAULT: {
					css: {
						'--tw-prose-code': theme('colors.primary.700'),
						code: {
							...twApply(
								'bg-primary-100 rounded px-2 py-1 before:hidden after:hidden',
							),
						},
						'p > code': twApply('mx-1'),
					},
				},
			}),
		},
	},
	plugins: [
		typography,
		plugin(({ addComponents }) => {
			addComponents({
				'.btn': {
					...twApply(
						'h-10 rounded-full px-6 font-medium border border-current text-primary-600',
					),
					'-webkit-tap-highlight-color': 'transparent',
					'&:focus-visible': twApply('outline-none ring-2 ring-current ring-offset-2'),
				},
			});
		}),
	],
};

function twApply(classes: string) {
	return { [`@apply ${classes}`]: '' };
}

export default config;
