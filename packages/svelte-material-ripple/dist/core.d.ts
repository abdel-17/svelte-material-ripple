export type RippleProps = {
    disabled: boolean;
    for: EventTarget | string | undefined;
    easing: string;
    onHoveredChange: (value: boolean) => void;
    onPressedChange: (value: boolean) => void;
};
/**
 * A ripple component.
 */
export declare class Ripple {
    #private;
    constructor(element: HTMLElement, props: RippleProps);
    /** @private */
    handleEvent(event: Event): void;
}
