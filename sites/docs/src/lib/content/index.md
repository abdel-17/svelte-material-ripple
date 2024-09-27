<script lang="ts">
	import { Ripple } from "svelte-material-ripple";
	import InteractiveDemo from "$lib/components/InteractiveDemo.svelte";
</script>

# Svelte Material Ripple

Svelte Material Ripple is a library for adding ripple effects to interactive elements.

<div class="mx-auto w-fit">
	<button class="btn">
		Try it out!
		<Ripple />
	</button>
</div>

## Installation

```sh
npm install -D svelte-material-ripple
```

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

By default, the ripple is attached to the parent element, but some elements like `<input>` don't accept children. You can attach the ripple to a reference element by passing the id of that element to the `for` prop.

```svelte
<div class="parent">
	<input id="checkbox" type="checkbox" />
	<Ripple for="checkbox" class="ripple" />
</div>
```

You can also just pass the element directly to the `for` prop.

```svelte
<script lang="ts">
	let input = $state<HTMLInputElement>();
</script>

<div class="parent">
	<input bind:this={input} type="checkbox" />
	<Ripple for={input} />
</div>
```

### Checkbox Example

```svelte
<div class="parent">
	<input id="checkbox" type="checkbox" />
	<Ripple for="checkbox" class="ripple" />
</div>

<style>
	.parent {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.ripple {
		inset: unset;
		height: 32px;
		width: 32px;
		border-radius: 9999px;
	}
</style>
```

<div class="mx-auto w-fit mb-10">
	<div class="relative flex items-center justify-center">
		<input id="checkbox-example" type="checkbox" class="accent-primary-600">
		<Ripple for="checkbox-example" class="!inset-[unset] size-8 !rounded-full text-primary-600" />
	</div>
</div>

## Theming

Ripples can be customized globally using CSS variables.

<table>
	<thead>
		<tr>
			<th>Token</th>
			<th>Description</th>
			<th>Default</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><code>--ripple-hover-color</code></td>
			<td>The color of the ripple when hovered</td>
			<td><code>currentColor</code></td>
		</tr>
		<tr>
			<td><code>--ripple-hover-opacity</code></td>
			<td>The opacity of the ripple when hovered</td>
			<td><code>0.08</code></td>
		</tr>
		<tr>
			<td><code>--ripple-pressed-color</code></td>
			<td>The color of the ripple when pressed</td>
			<td><code>currentColor</code></td>
		</tr>
		<tr>
			<td><code>--ripple-pressed-opacity</code></td>
			<td>The opacity of the ripple when pressed</td>
			<td><code>0.12</code></td>
		</tr>
	</tbody>
</table>

You can also pass a `theme` object to the component, which will override the global styles.

```svelte
<Ripple
	theme={{
		hover: {
			color: "orange",
			opacity: 0.15,
		},
		pressed: {
			color: "red",
			opacity: 0.3,
		},
	}}
/>
```

<div class="mx-auto w-fit mb-10">
	<button class="btn">
		Custom Theme
		<Ripple
			theme="{{
				hover: {
					color: 'orange',
					opacity: 0.15,
				},
				pressed: {
					color: 'red',
					opacity: 0.3,
				}
			}}"
		/>
	</button>
</div>

## Interactive Demo

<InteractiveDemo />
