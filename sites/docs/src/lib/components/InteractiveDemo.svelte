<script lang="ts">
	import { Ripple } from "svelte-material-ripple";
	import { shiki } from "$lib/shiki";

	let hoverColor = $state<string>();
	let hoverOpacity = $state<number>();
	let pressedColor = $state<string>();
	let pressedOpacity = $state<number>();
	let easing = $state<string>();
	let disabled = $state(false);

	const code = $derived.by(() => {
		let props = "";

		const hasHoverTheme =
			hoverColor !== undefined || hoverOpacity !== undefined;

		const hasPressedTheme =
			pressedColor !== undefined || pressedOpacity !== undefined;

		if (hasHoverTheme || hasPressedTheme) {
			props += "\ttheme={{\n";
			if (hasHoverTheme) {
				props += "\t\thover: {\n";
				if (hoverColor !== undefined) {
					props += `\t\t\tcolor: "${hoverColor}",\n`;
				}
				if (hoverOpacity !== undefined) {
					props += `\t\t\topacity: ${hoverOpacity},\n`;
				}
				props += "\t\t}\n";
			}
			if (hasPressedTheme) {
				props += "\t\tpressed: {\n";
				if (pressedColor !== undefined) {
					props += `\t\t\tcolor: "${pressedColor}",\n`;
				}
				if (pressedOpacity !== undefined) {
					props += `\t\t\topacity: ${pressedOpacity},\n`;
				}
				props += "\t\t}\n";
			}
			props += "\t}}\n";
		}

		if (easing !== undefined) {
			props += `\teasing="${easing}"\n`;
		}

		if (disabled) {
			props += `\tdisabled\n`;
		}

		if (props === "") {
			return "<Ripple />";
		}
		return "<Ripple" + "\n" + props + "/>";
	});

	const highlightedCode = $derived(
		shiki.codeToHtml(code, {
			lang: "svelte",
			theme: "one-dark-pro",
		}),
	);

	function replaceEmptyStringWithUndefined(value: string) {
		if (value === "") {
			return undefined;
		}
		return value;
	}

	function replaceNanWithUndefined(value: number) {
		if (Number.isNaN(value)) {
			return undefined;
		}
		return value;
	}

	$inspect("hoverColor", hoverColor);
	$inspect("hoverOpacity", hoverOpacity);
	$inspect("pressedColor", pressedColor);
	$inspect("pressedOpacity", pressedOpacity);
	$inspect("easing", easing);
	$inspect("disabled", disabled);
</script>

<div class="[--rounded:0.5rem]">
	<div
		class="flex flex-col rounded-[--rounded] rounded-b-none border border-b-0 sm:flex-row"
	>
		<div
			class="grid grid-cols-2 gap-4 rounded-t-[--rounded] bg-gray-100 p-4 sm:rounded-t-none sm:rounded-tl-[--rounded]"
		>
			<div>
				<label for="hover-color" class="label">Hover Color</label>
				<input
					id="hover-color"
					type="color"
					class="color-picker mt-1 block"
					oninput={(event) => {
						hoverColor = event.currentTarget.value;
					}}
				/>
			</div>
			<div>
				<label for="pressed-color" class="label">Pressed Color</label>
				<input
					id="pressed-color"
					type="color"
					class="color-picker mt-1 block"
					oninput={(event) => {
						pressedColor = event.currentTarget.value;
					}}
				/>
			</div>
			<div>
				<label for="hover-opacity" class="label">Hover Opacity</label>
				<input
					id="hover-opacity"
					type="number"
					min="0"
					max="1"
					step="0.01"
					class="input mt-1 w-full"
					oninput={(event) => {
						hoverOpacity = replaceNanWithUndefined(
							event.currentTarget.valueAsNumber,
						);
					}}
				/>
			</div>
			<div>
				<label for="pressed-opacity" class="label">Pressed Opacity</label>
				<input
					id="pressed-opacity"
					type="number"
					min="0"
					max="1"
					step="0.01"
					class="input mt-1 w-full"
					oninput={(event) => {
						pressedOpacity = replaceNanWithUndefined(
							event.currentTarget.valueAsNumber,
						);
					}}
				/>
			</div>
			<div class="col-span-2">
				<label for="easing" class="label">Easing</label>
				<input
					id="easing"
					list="easing-options"
					class="input mt-1 w-full"
					oninput={(event) => {
						easing = replaceEmptyStringWithUndefined(event.currentTarget.value);
					}}
				/>
				<datalist id="easing-options">
					<option value="ease"></option>
					<option value="ease-in"></option>
					<option value="ease-out"></option>
					<option value="ease-in-out"></option>
				</datalist>
			</div>
			<div class="col-span-2 flex items-center justify-between">
				<label for="disabled" class="label">Disabled</label>
				<input
					bind:checked={disabled}
					id="disabled"
					type="checkbox"
					class="switch"
				/>
			</div>
		</div>
		<div class="flex flex-grow items-center justify-center p-4">
			<button class="btn text-black">
				Demo
				<Ripple
					theme={{
						hover: {
							color: hoverColor,
							opacity: hoverOpacity,
						},
						pressed: {
							color: pressedColor,
							opacity: pressedOpacity,
						},
					}}
					{easing}
					{disabled}
				/>
			</button>
		</div>
	</div>
	<div class="[&>pre]:m-0 [&>pre]:rounded-b-[--rounded] [&>pre]:rounded-t-none">
		{@html highlightedCode}
	</div>
</div>
