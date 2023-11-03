<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { RippleController } from './RippleController';

	/**
	 * The underlying HTML element.
	 *
	 * You can bind to this prop to access the ripple element.
	 */
	export let ref: HTMLDivElement | undefined = undefined;

	/**
	 * Pass `true` to disable the ripple.
	 *
	 * @default false
	 */
	export let disabled: boolean = false;

	/**
	 * The color of the ripple when the element is hovered.
	 *
	 * @default 'currentColor'
	 */
	export let hoverColor: string | undefined = undefined;

	/**
	 * The opacity of the ripple when the element is hovered.
	 *
	 * @default 0.08
	 */
	export let hoverOpacity: string | number | undefined = undefined;

	/**
	 * The color of the ripple when the element is pressed.
	 *
	 * @default 'currentColor'
	 */
	export let pressedColor: string | undefined = undefined;

	/**
	 * The opacity of the ripple when the element is pressed.
	 *
	 * @default 0.12
	 */
	export let pressedOpacity: string | number | undefined = undefined;

	/**
	 * The easing function to use for the ripple animation.
	 *
	 * @default 'cubic-bezier(0.2, 0, 0, 1)'
	 */
	export let easing: string = 'cubic-bezier(0.2, 0, 0, 1)';

	/**
	 * The duration of the ripple animation.
	 *
	 * If a number is passed, the unit is assumed to be in ms.
	 *
	 * @default 450
	 */
	export let duration: string | number = 450;

	/**
	 * Pass `true` to disable the fallback ripple
	 * when JavaScript is not available.
	 *
	 * @default false
	 */
	export let disableFallback: boolean = false;

	/**
	 * Custom class applied to the ripple element.
	 */
	let className: string | undefined = undefined;
	export { className as class };

	let mounted = false;

	const hovered = writable(false);
	const pressed = writable(false);
	const controller = new RippleController({
		ref,
		disabled,
		hovered,
		pressed,
		easing,
		duration,
	});

	$: if (disabled) {
		$hovered = false;
		$pressed = false;
	}
	$: controller.ref = ref;
	$: controller.disabled = disabled;
	$: controller.easing = easing;
	$: controller.duration = duration;

	onMount(() => {
		mounted = true;
	});
</script>

<div
	bind:this={ref}
	aria-hidden="true"
	data-ripple
	class={className ? `surface ${className}` : 'surface'}
	class:hovered={$hovered}
	class:pressed={$pressed}
	class:fallback={!mounted && !disableFallback}
	class:disabled
	style:--ripple-hover-color={hoverColor}
	style:--ripple-hover-opacity={hoverOpacity}
	style:--ripple-pressed-color={pressedColor}
	style:--ripple-pressed-opacity={pressedOpacity}
	on:pointerenter={controller.handlePointerenter.bind(controller)}
	on:pointerleave={controller.handlePointerleave.bind(controller)}
	on:pointerup={controller.handlePointerup.bind(controller)}
	on:pointerdown={controller.handlePointerdown.bind(controller)}
	on:click={controller.handleClick.bind(controller)}
	on:pointercancel={controller.handlePointercancel.bind(controller)}
	on:contextmenu={controller.handleContextmenu.bind(controller)}
/>

<style>
	.surface {
		border-radius: inherit;
		position: absolute;
		inset: 0;
		overflow: hidden;
		-webkit-tap-highlight-color: transparent;

		--_hover-color: var(--ripple-hover-color, currentColor);
		--_hover-opacity: var(--ripple-hover-opacity, 0.08);
		--_pressed-color: var(--ripple-pressed-color, currentColor);
		--_pressed-opacity: var(--ripple-pressed-opacity, 0.12);
	}

	.surface::before,
	.surface::after {
		content: '';
		opacity: 0;
		position: absolute;
	}

	.surface::before {
		background-color: var(--_hover-color);
		inset: 0;
		transition:
			opacity 15ms linear,
			background-color 15ms linear;
	}

	.surface::after {
		transition: opacity 375ms linear;
	}

	.surface:not(.fallback)::after {
		background: radial-gradient(
			closest-side,
			var(--_pressed-color) max(100% - 70px, 65%),
			transparent 100%
		);
		transform-origin: center center;
	}

	.fallback::after {
		background-color: var(--_pressed-color);
		inset: 0;
	}

	.fallback:hover::before,
	.hovered::before {
		background-color: var(--_hover-color);
		opacity: var(--_hover-opacity);
	}

	.fallback:active::after,
	.pressed::after {
		opacity: var(--_pressed-opacity);
		transition-duration: 105ms;
	}

	.disabled {
		display: none;
	}
</style>
