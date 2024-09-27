<script module lang="ts">
	export { default as h1 } from "./h1.svelte";
</script>

<script lang="ts">
	import type { Snippet } from "svelte";

	const { children }: { children: Snippet } = $props();
</script>

<div class="prose mx-auto max-w-4xl p-8">
	{@render children()}
</div>
