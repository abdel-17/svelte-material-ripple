// Source code copied from the "material-web" repository
// and modified to better fit Svelte.
//
// https://github.com/material-components/material-web/blob/main/ripple/internal/ripple.ts

import type { Writable } from 'svelte/store';

const MINIMUM_PRESS_MS = 225;
const INITIAL_ORIGIN_SCALE = 0.2;
const PADDING = 10;
const SOFT_EDGE_MINIMUM_SIZE = 75;
const SOFT_EDGE_CONTAINER_RATIO = 0.35;
const PRESS_PSEUDO = '::after';
const ANIMATION_FILL = 'forwards';

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

interface RippleControllerProps {
	ref: HTMLElement | undefined;
	disabled: boolean;
	hovered: Writable<boolean>;
	pressed: Writable<boolean>;
	easing: string;
	duration: string | number;
}

export class RippleController {
	ref: HTMLElement | undefined;
	disabled: boolean;
	readonly hovered: Writable<boolean>;
	readonly pressed: Writable<boolean>;
	easing: string;
	duration: string | number;

	private rippleSize = '';
	private rippleScale = '';
	private initialSize = 0;
	private state = State.INACTIVE;
	private checkBoundsAfterContextMenu = false;
	private growAnimation: Animation | undefined;
	private rippleStartEvent: PointerEvent | undefined;

	constructor({ ref, disabled, hovered, pressed, easing, duration }: RippleControllerProps) {
		this.ref = ref;
		this.disabled = disabled;
		this.hovered = hovered;
		this.pressed = pressed;
		this.easing = easing;
		this.duration = duration;
	}

	handlePointerenter(event: PointerEvent) {
		if (!this.shouldReactToEvent(event)) {
			return;
		}

		this.hovered.set(true);
	}

	handlePointerleave(event: PointerEvent) {
		if (!this.shouldReactToEvent(event)) {
			return;
		}

		this.hovered.set(false);

		// Release a held mouse or pen press that moves outside the element
		if (this.state !== State.INACTIVE) {
			this.endPressAnimation();
		}
	}

	handlePointerup(event: PointerEvent) {
		if (!this.shouldReactToEvent(event)) {
			return;
		}

		if (this.state === State.HOLDING) {
			this.state = State.WAITING_FOR_CLICK;
			return;
		}

		if (this.state === State.TOUCH_DELAY) {
			this.state = State.WAITING_FOR_CLICK;
			this.startPressAnimation(this.rippleStartEvent);
			return;
		}
	}

	async handlePointerdown(event: PointerEvent) {
		if (!this.shouldReactToEvent(event)) {
			return;
		}

		this.rippleStartEvent = event;
		if (!this.isTouch(event)) {
			this.state = State.WAITING_FOR_CLICK;
			this.startPressAnimation(event);
			return;
		}

		// After a longpress contextmenu event, an extra `pointerdown` can be
		// dispatched to the pressed element. Check that the down is within
		// bounds of the element in this case.
		if (this.checkBoundsAfterContextMenu && !this.inBounds(event)) {
			return;
		}

		this.checkBoundsAfterContextMenu = false;

		// Wait for a hold after touch delay
		this.state = State.TOUCH_DELAY;
		await new Promise((resolve) => {
			setTimeout(resolve, TOUCH_DELAY_MS);
		});

		if (this.state !== State.TOUCH_DELAY) {
			return;
		}

		this.state = State.HOLDING;
		this.startPressAnimation(event);
	}

	handleClick() {
		// Click is a MouseEvent in Firefox and Safari, so we cannot use
		// `shouldReactToEvent`
		if (this.disabled) {
			return;
		}

		if (this.state === State.WAITING_FOR_CLICK) {
			this.endPressAnimation();
			return;
		}

		if (this.state === State.INACTIVE) {
			// Keyboard synthesized click event
			this.startPressAnimation();
			this.endPressAnimation();
		}
	}

	handlePointercancel(event: PointerEvent) {
		if (!this.shouldReactToEvent(event)) {
			return;
		}

		this.endPressAnimation();
	}

	handleContextmenu() {
		if (this.disabled) {
			return;
		}

		this.checkBoundsAfterContextMenu = true;
		this.endPressAnimation();
	}

	private determineRippleSize() {
		const { height, width } = this.ref!.getBoundingClientRect();
		const maxDim = Math.max(height, width);
		const softEdgeSize = Math.max(SOFT_EDGE_CONTAINER_RATIO * maxDim, SOFT_EDGE_MINIMUM_SIZE);

		const initialSize = Math.floor(maxDim * INITIAL_ORIGIN_SCALE);
		const hypotenuse = Math.sqrt(width ** 2 + height ** 2);
		const maxRadius = hypotenuse + PADDING;

		this.initialSize = initialSize;
		this.rippleScale = `${(maxRadius + softEdgeSize) / initialSize}`;
		this.rippleSize = `${initialSize}px`;
	}

	private getNormalizedPointerEventCoords(pointerEvent: PointerEvent) {
		const { scrollX, scrollY } = window;
		const { left, top } = this.ref!.getBoundingClientRect();
		const { pageX, pageY } = pointerEvent;
		return {
			x: pageX - scrollX - left,
			y: pageY - scrollY - top,
		};
	}

	private getTranslationCoordinates(positionEvent?: Event) {
		const { height, width } = this.ref!.getBoundingClientRect();

		const startPoint =
			positionEvent instanceof PointerEvent
				? this.getNormalizedPointerEventCoords(positionEvent)
				: { x: width / 2, y: height / 2 };

		// Center around start point
		startPoint.x -= this.initialSize / 2;
		startPoint.y -= this.initialSize / 2;

		// End in the center
		const endPoint = {
			x: (width - this.initialSize) / 2,
			y: (height - this.initialSize) / 2,
		};

		return { startPoint, endPoint };
	}

	private startPressAnimation(positionEvent?: Event) {
		if (!this.ref) {
			return;
		}

		this.pressed.set(true);
		this.growAnimation?.cancel();
		this.determineRippleSize();

		const { startPoint, endPoint } = this.getTranslationCoordinates(positionEvent);
		const translateStart = `${startPoint.x}px, ${startPoint.y}px`;
		const translateEnd = `${endPoint.x}px, ${endPoint.y}px`;

		this.growAnimation = this.ref.animate(
			{
				top: [0, 0],
				left: [0, 0],
				height: [this.rippleSize, this.rippleSize],
				width: [this.rippleSize, this.rippleSize],
				transform: [
					`translate(${translateStart}) scale(1)`,
					`translate(${translateEnd}) scale(${this.rippleScale})`,
				],
			},
			{
				pseudoElement: PRESS_PSEUDO,
				duration: this.duration,
				easing: this.easing,
				fill: ANIMATION_FILL,
			},
		);
	}

	private async endPressAnimation() {
		this.state = State.INACTIVE;

		const animation = this.growAnimation;
		let pressAnimationPlayState = Infinity;
		if (typeof animation?.currentTime === 'number') {
			pressAnimationPlayState = animation.currentTime;
		} else if (animation?.currentTime) {
			pressAnimationPlayState = animation.currentTime.to('ms').value;
		}

		if (pressAnimationPlayState >= MINIMUM_PRESS_MS) {
			this.pressed.set(false);
			return;
		}

		await new Promise((resolve) => {
			setTimeout(resolve, MINIMUM_PRESS_MS - pressAnimationPlayState);
		});

		if (this.growAnimation !== animation) {
			// A new press animation was started. The old animation was canceled and
			// should not finish the pressed state.
			return;
		}

		this.pressed.set(false);
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
	private shouldReactToEvent(event: PointerEvent) {
		if (this.disabled || !event.isPrimary) {
			return false;
		}

		if (this.rippleStartEvent && this.rippleStartEvent.pointerId !== event.pointerId) {
			return false;
		}

		if (event.type === 'pointerenter' || event.type === 'pointerleave') {
			return !this.isTouch(event);
		}

		const isPrimaryButton = event.buttons === 1;
		return this.isTouch(event) || isPrimaryButton;
	}

	/**
	 * Check if the event is within the bounds of the element.
	 *
	 * This is only needed for the "stuck" contextmenu longpress on Chrome.
	 */
	private inBounds({ x, y }: PointerEvent) {
		const { top, left, bottom, right } = this.ref!.getBoundingClientRect();
		return x >= left && x <= right && y >= top && y <= bottom;
	}

	private isTouch({ pointerType }: PointerEvent) {
		return pointerType === 'touch';
	}
}
