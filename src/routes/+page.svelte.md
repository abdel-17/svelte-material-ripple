<script>
	import { Installation, RippleDemo } from '$docs/components';
	import { Ripple } from '$lib';
</script>

<h1 class="relative bg-gradient-to-br from-primary-400 to-primary-700 bg-clip-text text-transparent">
	Svelte Material Ripple
</h1>

Svelte Material Ripple is a library for adding ripple effects to elements. Its implementation is based on the official [md-ripple] web component.

## Installation

Install the package from npm using your preferred package manager.

<Installation />

## Usage

Import the `Ripple` component and place it in a `position: relative` container.

```svelte
<script>
	import { Ripple } from "svelte-material-ripple";
</script>

<button class="relative">
	<Ripple />
</button>

<style>
	.relative {
		position: relative;
	}
</style>
```

<div class="flex justify-center mt-4">
	<button class="btn relative">
		<Ripple />
		<span>Click</span>
	</button>
</div>

In the spirit of progressive enhancment, ripples use a simpler CSS-based implementation when JavaScript is not available.

## Theming

Ripples support theming using CSS variables.

| Token                      | Default        |
| -------------------------- | -------------- |
| `--ripple-hover-color`     | `currentColor` |
| `--ripple-hover-opacity`   | `0.08`         |
| `--ripple-pressed-color`   | `currentColor` |
| `--ripple-pressed-opacity` | `0.12`         |

### Example

```svelte
<script>
	import { Ripple } from "svelte-material-ripple";
</script>

<button
	class="relative"
	style:--ripple-hover-color="red"
	style:--ripple-hover-opacity="0.1"
	style:--ripple-pressed-color="red"
	style:--ripple-pressed-opacity="0.2"
>
	<Ripple />
</button>

<style>
	.relative {
		position: relative;
	}
</style>
```

<div class="flex justify-center mt-4">
	<button
		style:--ripple-hover-color="red"
		style:--ripple-hover-opacity="0.1"
		style:--ripple-pressed-color="red"
		style:--ripple-pressed-opacity="0.2"
		class="btn relative"
	>
		<Ripple />
		<span>Click</span>
	</button>
</div>

Ripples also support theming using props.

<!-- prettier-ignore -->
```svelte
<Ripple
	hoverColor="red"
	hoverOpacity={0.1}
	pressedColor="red"
	pressedOpacity={0.2}
/>
```

## Interactive Demo

<RippleDemo />

## API

### `ref: HTMLDivElement`

The underlying HTML element.

You can bind to this prop to access the ripple element.

### `disabled: boolean`

Pass `true` to disable the ripple.

@default `false`

### `hoverColor: string`

The color of the ripple when the element is hovered.

@default `'currentColor'`

### `hoverOpacity: string | number`

The opacity of the ripple when the element is hovered.

@default `0.08`

### `pressedColor: string`

The color of the ripple when the element is pressed.

@default `'currentColor'`

### `pressedOpacity: string | number`

The opacity of the ripple when the element is pressed.

@default `0.12`

### `easing: string`

The easing function to use for the ripple animation.

@default `'cubic-bezier(0.2, 0, 0, 1)'`

### `duration: string | number`

The duration of the ripple animation.

If a number is passed, the unit is assumed to be in ms.

@default `450`

### `disableFallback: boolean`

Pass `true` to disable the fallback ripple when JavaScript is not available.

@default `false`

### `class: string`

Custom class applied to the ripple element.

<style lang="postcss">
	h3 > code,
	td:nth-child(1) > code {
		@apply bg-neutral-200 text-neutral-800;
	}
</style>

[md-ripple]: https://github.com/material-components/material-web/tree/main/ripple
