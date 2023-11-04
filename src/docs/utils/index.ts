import { writable } from 'svelte/store';

export function writableWithDirty<T>(initialValue?: T) {
	const internalValue = writable(initialValue);
	let dirty = false;
	return {
		subscribe: internalValue.subscribe,
		set(value: T) {
			dirty = true;
			internalValue.set(value);
		},
		update(updater: (value: T) => T) {
			dirty = true;
			internalValue.update(updater);
		},
		get dirty() {
			return dirty;
		},
	};
}
