<script lang="ts">
	import { writableWithDirty } from '$docs/utils';
	import { Ripple } from '$lib';
	import { createLabel, createSwitch, melt } from '@melt-ui/svelte';

	const easingDefault = 'cubic-bezier(0.2, 0, 0, 1)';

	let hoverColor = writableWithDirty('#000000');
	let hoverOpacity = writableWithDirty(0.08);
	let pressedColor = writableWithDirty('#000000');
	let pressedOpacity = writableWithDirty(0.12);
	let duration = writableWithDirty(450);
	let easing = easingDefault;

	const {
		elements: { root: label },
	} = createLabel();

	const {
		elements: { root: switchRoot, input: switchInput },
		states: { checked: disabled },
	} = createSwitch();

	$: code = globalThis.Prism.highlight(
		getHighlightedText([
			hoverColor.dirty && prop('hoverColor', $hoverColor),
			hoverOpacity.dirty && prop('hoverOpacity', $hoverOpacity),
			pressedColor.dirty && prop('pressedColor', $pressedColor),
			pressedOpacity.dirty && prop('pressedOpacity', $pressedOpacity),
			duration.dirty && prop('duration', $duration),
			easing !== easingDefault && prop('easing', easing),
			$disabled && prop('disabled', $disabled),
		]),
		globalThis.Prism.languages.svelte,
		'svelte',
	);

	function prop(name: string, value: unknown) {
		if (typeof value === 'string') {
			return `${name}="${value}"`;
		}
		if (typeof value === 'boolean') {
			return `${name}`;
		}
		return `${name}={${value}}`;
	}

	function getHighlightedText(props: Array<string | false>) {
		const truthyProps = props.filter((prop): prop is string => prop !== false);
		if (truthyProps.length === 0) {
			return '<Ripple />';
		}
		const indentedProps = truthyProps.map((prop) => prop.padStart(prop.length + 4));
		return `<Ripple\n${indentedProps.join('\n')}\n/>`;
	}
</script>

<div class="flex flex-col sm:flex-row">
	<div
		class="
			flex grow items-center justify-center rounded-t-lg border border-b-0 p-6
			sm:rounded-tr-none
			sm:border-r-0
		"
	>
		<button class="btn relative text-black">
			<span>Click</span>
			<Ripple
				hoverColor={$hoverColor}
				hoverOpacity={$hoverOpacity}
				pressedColor={$pressedColor}
				pressedOpacity={$pressedOpacity}
				duration={$duration}
				{easing}
				disabled={$disabled}
			/>
		</button>
	</div>

	<div class="grid grid-cols-2 gap-4 border border-b-0 bg-gray-100 p-4 sm:rounded-tr-lg">
		<div class="flex w-fit flex-col">
			<label for="hover-color" use:melt={$label} class="label">Hover Color</label>
			<input id="hover-color" type="color" bind:value={$hoverColor} />
		</div>

		<div class="flex flex-col">
			<label for="hover-opacity" use:melt={$label} class="label">Hover Opacity</label>
			<input
				id="hover-opacity"
				type="number"
				bind:value={$hoverOpacity}
				min="0"
				max="1"
				step="0.01"
				class="input"
			/>
		</div>

		<div class="flex w-fit flex-col">
			<label for="pressed-color" use:melt={$label} class="label">Pressed Color</label>
			<input id="pressed-color" type="color" bind:value={$pressedColor} />
		</div>

		<div class="flex flex-col">
			<label for="pressed-opacity" use:melt={$label} class="label">Pressed Opacity</label>
			<input
				id="pressed-opacity"
				type="number"
				bind:value={$pressedOpacity}
				min="0"
				max="1"
				step="0.01"
				class="input"
			/>
		</div>

		<div class="flex flex-col">
			<label for="animation-duration" use:melt={$label} class="label">Duration</label>
			<input
				id="animation-duration"
				type="number"
				bind:value={$duration}
				min="0"
				step="50"
				class="input"
			/>
		</div>

		<div class="flex flex-col">
			<label for="animation-easing" use:melt={$label} class="label">Easing</label>
			<select id="animation-easing" bind:value={easing} class="input">
				<option value={easingDefault}>default</option>
				<option value="ease">ease</option>
				<option value="ease-in">ease-in</option>
				<option value="ease-in-out">ease-in-out</option>
			</select>
		</div>

		<div class="col-span-2 flex items-center justify-between">
			<label id="disabled-switch-label" for="disabled-switch" use:melt={$label} class="label">
				Disabled
			</label>
			<button
				id="disabled-switch"
				aria-labelledby="disabled-switch-label"
				use:melt={$switchRoot}
				class="group relative h-7 w-12 rounded-full bg-neutral-600 transition-colors data-[state=checked]:bg-primary"
			>
				<div
					class="h-5 w-5 translate-x-1 rounded-full bg-white transition-transform group-data-[state=checked]:translate-x-6"
				/>
			</button>
			<input use:melt={$switchInput} />
		</div>
	</div>
</div>

<pre class="language-svelte !my-0 !rounded-lg !rounded-t-none">{@html code}</pre>

<style lang="postcss">
	input[type='color'] {
		@apply h-10 w-10 cursor-pointer appearance-none border-none bg-transparent;
	}

	input[type='color']::-webkit-color-swatch-wrapper {
		padding: 0;
	}

	input[type='color']::-webkit-color-swatch {
		@apply rounded-full border-none;
	}

	input[type='color']::-moz-color-swatch {
		@apply rounded-full border-none;
	}
</style>
