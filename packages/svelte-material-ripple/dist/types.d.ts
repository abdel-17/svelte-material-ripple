export type RippleTheme = {
    /**
     * The color of the ripple.
     */
    color?: string;
    /**
     * The opacity of the ripple.
     */
    opacity?: string | number;
};
export type RippleProps = {
    /**
     * The underlying HTML element.
     *
     * You can bind to this prop to access the ripple element.
     */
    element?: HTMLDivElement;
    /**
     * Pass `true` to disable the ripple.
     *
     * @default false
     */
    disabled?: boolean;
    /**
     * The element or the id of the element that triggers the ripple.
     *
     * Defaults to the parent element of the ripple.
     */
    for?: EventTarget | string;
    /**
     * The easing function used for the ripple animation.
     *
     * @default "cubic-bezier(0.2, 0, 0, 1)"
     */
    easing?: string;
    /**
     * A custom theme applied to the ripple.
     */
    theme?: {
        /**
         * The theme applied when the ripple is hovered.
         */
        hover?: RippleTheme;
        /**
         * The theme applied when the ripple is pressed.
         */
        pressed?: RippleTheme;
    };
    /**
     * Additional CSS classes applied to the ripple element.
     */
    class?: string;
};
