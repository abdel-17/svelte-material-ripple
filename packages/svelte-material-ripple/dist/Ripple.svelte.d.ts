import { Ripple } from "./core.js";
import type { RippleProps } from "./types.js";
interface $$__sveltets_2_IsomorphicComponent<Props extends Record<string, any> = any, Events extends Record<string, any> = any, Slots extends Record<string, any> = any, Exports = {}, Bindings = string> {
    new (options: import('svelte').ComponentConstructorOptions<Props>): import('svelte').SvelteComponent<Props, Events, Slots> & {
        $$bindings?: Bindings;
    } & Exports;
    (internal: unknown, props: Props & {
        $$events?: Events;
        $$slots?: Slots;
    }): Exports & {
        $set?: any;
        $on?: any;
    };
    z_$$bindings?: Bindings;
}
declare const Ripple: $$__sveltets_2_IsomorphicComponent<RippleProps, {
    [evt: string]: CustomEvent<any>;
}, {}, {}, "element">;
type Ripple = InstanceType<typeof Ripple>;
export default Ripple;
