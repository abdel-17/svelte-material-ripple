<script lang="ts">
	import { Ripple as RippleCore } from "./core.svelte.js";
	import type { RippleProps } from "./types.js";

	let {
		element = $bindable(),
		disabled = false,
		for: htmlFor,
		easing = "cubic-bezier(0.2, 0, 0, 1)",
		theme,
		class: className,
	}: RippleProps = $props();

	let hovered = $state(false);
	let pressed = $state(false);

	function ripple(element: HTMLElement) {
		new RippleCore(element, {
			get disabled() {
				return disabled;
			},
			get for() {
				return htmlFor;
			},
			get easing() {
				return easing;
			},
			onHoveredChange(value) {
				hovered = value;
			},
			onPressedChange(value) {
				pressed = value;
			},
		});
	}
</script>

<div
	bind:this={element}
	aria-hidden="true"
	data-ripple
	class={className ? `ripple ${className}` : "ripple"}
	class:hovered
	class:pressed
	style:--ripple-hover-color={theme?.hover?.color}
	style:--ripple-hover-opacity={theme?.hover?.opacity}
	style:--ripple-pressed-color={theme?.pressed?.color}
	style:--ripple-pressed-opacity={theme?.pressed?.opacity}
	use:ripple
></div>

<style>
	.ripple {
		pointer-events: none;
		border-radius: inherit;
		position: absolute;
		inset: 0;
		overflow: hidden;
		isolation: isolate; /* Fix ripple overflow on iOS safari */
		-webkit-tap-highlight-color: transparent;

		--hover-color: var(--ripple-hover-color, currentColor);
		--hover-opacity: var(--ripple-hover-opacity, 0.08);
		--pressed-color: var(--ripple-pressed-color, currentColor);
		--pressed-opacity: var(--ripple-pressed-opacity, 0.12);
	}

	.ripple::before,
	.ripple::after {
		content: "";
		opacity: 0;
		position: absolute;
	}

	.ripple::before {
		background-color: var(--hover-color);
		inset: 0;
		transition:
			opacity 15ms linear,
			background-color 15ms linear;
	}

	.ripple::after {
		background: radial-gradient(
			closest-side,
			var(--pressed-color) max(100% - 70px, 65%),
			transparent 100%
		);
		transform-origin: center center;
		transition: opacity 375ms linear;
	}

	.hovered::before {
		background-color: var(--hover-color);
		opacity: var(--hover-opacity);
	}

	.pressed::after {
		opacity: var(--pressed-opacity);
		transition-duration: 105ms;
	}

	.disabled {
		display: none;
	}

	@media (forced-colors: active) {
		.ripple {
			display: none;
		}
	}
</style>
