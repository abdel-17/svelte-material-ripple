<script lang="ts">
	import bun from '$docs/assets/bun.svg?raw';
	import npm from '$docs/assets/npm.svg?raw';
	import pnpm from '$docs/assets/pnpm.svg?raw';
	import yarn from '$docs/assets/yarn.svg?raw';
	import { Ripple } from '$lib';
	import { createTabs, melt } from '@melt-ui/svelte';

	const {
		elements: { root, list, content, trigger },
	} = createTabs({
		defaultValue: 'npm',
	});

	const packageManagers = [
		{ name: 'npm', svg: npm },
		{ name: 'pnpm', svg: pnpm },
		{ name: 'yarn', svg: yarn },
		{ name: 'bun', svg: bun },
	];

	function code(name: string) {
		return globalThis.Prism.highlight(
			`${name} add -D svelte-material-ripple`,
			globalThis.Prism.languages.bash,
			'bash',
		);
	}
</script>

<div use:melt={$root} class="flex flex-col">
	<div use:melt={$list} class="-m-1 mb-2 flex gap-3 overflow-x-auto p-1">
		{#each packageManagers as { name, svg }}
			<button
				use:melt={$trigger(name)}
				style:-webkit-tap-highlight-color="transparent"
				class="
					relative flex h-10 items-center justify-center rounded-md border px-3
					focus-visible:border-current
					focus-visible:outline-none
					focus-visible:ring-2
					focus-visible:ring-current
					focus-visible:ring-offset-2
					data-[state='active']:border-current
					data-[state='active']:data-[value='bun']:text-rose-700
					data-[state='active']:data-[value='npm']:text-red-700
					data-[state='active']:data-[value='pnpm']:text-amber-700
					data-[state='active']:data-[value='yarn']:text-cyan-700
					[&_svg]:h-6
					[&_svg]:w-6
				"
			>
				{@html svg}
				<span class="ml-2">{name}</span>
				<Ripple />
			</button>
		{/each}
	</div>

	{#each packageManagers as { name }}
		<div use:melt={$content(name)}>
			<pre class="language-bash">{@html code(name)}</pre>
		</div>
	{/each}
</div>
