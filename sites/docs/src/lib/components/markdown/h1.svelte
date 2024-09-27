<script lang="ts">
	import type { SvelteHTMLElements } from "svelte/elements";

	const { children, ...props }: SvelteHTMLElements["h1"] = $props();
</script>

<h1
	{...props}
	class="bg-gradient-to-b from-primary-700 to-primary-400 bg-clip-text text-transparent"
>
	{@render children?.()}
</h1>
