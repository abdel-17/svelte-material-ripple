// Source code copied from the "material-web" repository
// and modified to better fit Svelte.
//
// https://github.com/material-components/material-web/blob/main/ripple/internal/ripple.ts

import type { Action } from "svelte/action";
import { writable, type Readable } from "svelte/store";

const MINIMUM_PRESS_MS = 225;
const INITIAL_ORIGIN_SCALE = 0.2;
const PADDING = 10;
const SOFT_EDGE_MINIMUM_SIZE = 75;
const SOFT_EDGE_CONTAINER_RATIO = 0.35;
const PRESS_PSEUDO = "::after";
const ANIMATION_FILL = "forwards";

/**
 * Delay reacting to touch so that we do not show the ripple for a swipe or
 * scroll interaction.
 */
const TOUCH_DELAY_MS = 150;

/**
 * Interaction states for the ripple.
 *
 * On Touch:
 *  - `INACTIVE -> TOUCH_DELAY -> WAITING_FOR_CLICK -> INACTIVE`
 *  - `INACTIVE -> TOUCH_DELAY -> HOLDING -> WAITING_FOR_CLICK -> INACTIVE`
 *
 * On Mouse or Pen:
 *   - `INACTIVE -> WAITING_FOR_CLICK -> INACTIVE`
 */
enum State {
	/**
	 * Initial state of the control, no touch in progress.
	 *
	 * Transitions:
	 *   - on touch down: transition to `TOUCH_DELAY`.
	 *   - on mouse down: transition to `WAITING_FOR_CLICK`.
	 */
	INACTIVE,

	/**
	 * Touch down has been received, waiting to determine if it's a swipe or
	 * scroll.
	 *
	 * Transitions:
	 *   - on touch up: begin press; transition to `WAITING_FOR_CLICK`.
	 *   - on cancel: transition to `INACTIVE`.
	 *   - after `TOUCH_DELAY_MS`: begin press; transition to `HOLDING`.
	 */
	TOUCH_DELAY,

	/**
	 * A touch has been deemed to be a press
	 *
	 * Transitions:
	 *  - on up: transition to `WAITING_FOR_CLICK`.
	 */
	HOLDING,

	/**
	 * The user touch has finished, transition into rest state.
	 *
	 * Transitions:
	 *   - on click end press; transition to `INACTIVE`.
	 */
	WAITING_FOR_CLICK,
}

function isTouch({ pointerType }: PointerEvent) {
	return pointerType === "touch";
}

export type RippleActionParams = {
	disabled: boolean;
	easing: string;
	duration: string | number;
};

export type Ripple = {
	hovered: Readable<boolean>;
	pressed: Readable<boolean>;
	ripple: Action<HTMLElement, RippleActionParams>;
};

export function createRipple(): Ripple {
	const hovered = writable(false);
	const pressed = writable(false);
	return {
		hovered,
		pressed,
		ripple(node, { disabled, easing, duration }) {
			let rippleSize = "";
			let rippleScale = "";
			let initialSize = 0;
			let state = State.INACTIVE;
			let checkBoundsAfterContextMenu = false;
			let growAnimation: Animation | undefined;
			let rippleStartEvent: PointerEvent | undefined;

			function determineRippleSize() {
				const { height, width } = node.getBoundingClientRect();
				const maxDim = Math.max(height, width);
				const softEdgeSize = Math.max(SOFT_EDGE_CONTAINER_RATIO * maxDim, SOFT_EDGE_MINIMUM_SIZE);
				const hypotenuse = Math.sqrt(width ** 2 + height ** 2);
				const maxRadius = hypotenuse + PADDING;

				initialSize = Math.floor(maxDim * INITIAL_ORIGIN_SCALE);
				rippleScale = `${(maxRadius + softEdgeSize) / initialSize}`;
				rippleSize = `${initialSize}px`;
			}

			function getNormalizedPointerEventCoords(pointerEvent: PointerEvent) {
				const { scrollX, scrollY } = window;
				const { left, top } = node.getBoundingClientRect();
				const { pageX, pageY } = pointerEvent;
				return {
					x: pageX - scrollX - left,
					y: pageY - scrollY - top,
				};
			}

			function getTranslationCoordinates(positionEvent?: Event) {
				const { height, width } = node.getBoundingClientRect();

				const startPoint =
					positionEvent instanceof PointerEvent
						? getNormalizedPointerEventCoords(positionEvent)
						: { x: width / 2, y: height / 2 };

				// Center around start point
				startPoint.x -= initialSize / 2;
				startPoint.y -= initialSize / 2;

				// End in the center
				const endPoint = {
					x: (width - initialSize) / 2,
					y: (height - initialSize) / 2,
				};

				return { startPoint, endPoint };
			}

			function startPressAnimation(positionEvent?: Event) {
				pressed.set(true);
				growAnimation?.cancel();
				determineRippleSize();

				const { startPoint, endPoint } = getTranslationCoordinates(positionEvent);
				const translateStart = `${startPoint.x}px, ${startPoint.y}px`;
				const translateEnd = `${endPoint.x}px, ${endPoint.y}px`;

				growAnimation = node.animate(
					{
						top: [0, 0],
						left: [0, 0],
						height: [rippleSize, rippleSize],
						width: [rippleSize, rippleSize],
						transform: [
							`translate(${translateStart}) scale(1)`,
							`translate(${translateEnd}) scale(${rippleScale})`,
						],
					},
					{
						duration,
						easing,
						pseudoElement: PRESS_PSEUDO,
						fill: ANIMATION_FILL,
					},
				);
			}

			async function endPressAnimation() {
				state = State.INACTIVE;
				const animation = growAnimation;

				const pressAnimationPlayState =
					typeof animation?.currentTime === "number"
						? animation.currentTime
						: animation?.currentTime
						  ? animation.currentTime.to("ms").value
						  : Infinity;

				if (pressAnimationPlayState >= MINIMUM_PRESS_MS) {
					pressed.set(false);
					return;
				}

				await new Promise((resolve) => {
					setTimeout(resolve, MINIMUM_PRESS_MS - pressAnimationPlayState);
				});

				if (growAnimation !== animation) {
					// A new press animation was started. The old animation was canceled and
					// should not finish the pressed state.
					return;
				}

				pressed.set(false);
			}

			/**
			 * Check if the event is within the bounds of the element.
			 *
			 * This is only needed for the "stuck" contextmenu longpress on Chrome.
			 */
			function inBounds({ x, y }: PointerEvent) {
				const { top, left, bottom, right } = node.getBoundingClientRect();
				return x >= left && x <= right && y >= top && y <= bottom;
			}

			/**
			 * Returns `true` if
			 *  - the ripple element is enabled
			 *  - the pointer is primary for the input type
			 *  - the pointer is the pointer that started the interaction, or will start
			 * the interaction
			 *  - the pointer is a touch, or the pointer state has the primary button
			 * held, or the pointer is hovering
			 */
			function shouldReactToEvent(event: PointerEvent) {
				if (disabled || !event.isPrimary) {
					return false;
				}

				if (rippleStartEvent && rippleStartEvent.pointerId !== event.pointerId) {
					return false;
				}

				if (event.type === "pointerenter" || event.type === "pointerleave") {
					return !isTouch(event);
				}

				const isPrimaryButton = event.buttons === 1;
				return isTouch(event) || isPrimaryButton;
			}

			const unsubscribers = Array<() => void>(7);

			function addEventListenerToParent<E extends keyof HTMLElementEventMap>(
				eventName: E,
				listener: (this: HTMLElement, event: HTMLElementEventMap[E]) => void,
			) {
				const { parentElement } = node;
				if (!parentElement) {
					return;
				}

				parentElement.addEventListener(eventName, listener);
				unsubscribers.push(() => parentElement.removeEventListener(eventName, listener));
			}

			addEventListenerToParent("pointerenter", (event) => {
				if (!shouldReactToEvent(event)) {
					return;
				}

				hovered.set(true);
			});

			addEventListenerToParent("pointerleave", (event) => {
				if (!shouldReactToEvent(event)) {
					return;
				}

				hovered.set(false);

				// Release a held mouse or pen press that moves outside the element
				if (state !== State.INACTIVE) {
					endPressAnimation();
				}
			});

			addEventListenerToParent("pointerup", (event) => {
				if (!shouldReactToEvent(event)) {
					return;
				}

				if (state === State.HOLDING) {
					state = State.WAITING_FOR_CLICK;
					return;
				}

				if (state === State.TOUCH_DELAY) {
					state = State.WAITING_FOR_CLICK;
					startPressAnimation(rippleStartEvent);
					return;
				}
			});

			addEventListenerToParent("pointerdown", async (event) => {
				if (!shouldReactToEvent(event)) {
					return;
				}

				rippleStartEvent = event;
				if (!isTouch(event)) {
					state = State.WAITING_FOR_CLICK;
					startPressAnimation(event);
					return;
				}

				// After a longpress contextmenu event, an extra `pointerdown` can be
				// dispatched to the pressed element. Check that the down is within
				// bounds of the element in this case.
				if (checkBoundsAfterContextMenu && !inBounds(event)) {
					return;
				}

				checkBoundsAfterContextMenu = false;

				// Wait for a hold after touch delay
				state = State.TOUCH_DELAY;
				await new Promise((resolve) => {
					setTimeout(resolve, TOUCH_DELAY_MS);
				});

				if (state !== State.TOUCH_DELAY) {
					return;
				}

				state = State.HOLDING;
				startPressAnimation(event);
			});

			addEventListenerToParent("pointercancel", (event) => {
				if (!shouldReactToEvent(event)) {
					return;
				}

				endPressAnimation();
			});

			addEventListenerToParent("click", () => {
				// Click is a MouseEvent in Firefox and Safari, so we cannot use
				// `shouldReactToEvent`
				if (disabled) {
					return;
				}

				if (state === State.WAITING_FOR_CLICK) {
					endPressAnimation();
					return;
				}

				if (state === State.INACTIVE) {
					// Keyboard synthesized click event
					startPressAnimation();
					endPressAnimation();
				}
			});

			addEventListenerToParent("contextmenu", () => {
				if (disabled) {
					return;
				}

				checkBoundsAfterContextMenu = true;
				endPressAnimation();
			});

			return {
				update(params) {
					disabled = params.disabled;
					duration = params.duration;
					easing = params.easing;

					if (disabled) {
						hovered.set(false);
						pressed.set(false);
					}
				},
				destroy() {
					for (const unsubscriber of unsubscribers) {
						unsubscriber();
					}
				},
			};
		},
	};
}
