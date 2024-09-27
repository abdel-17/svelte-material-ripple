// The source code was copied from the "material-web" repository and modified to better fit Svelte.
//
// https://github.com/material-components/material-web/blob/main/ripple/internal/ripple.ts

const PRESS_GROW_MS = 450;
const MINIMUM_PRESS_MS = 225;
const INITIAL_ORIGIN_SCALE = 0.2;
const PADDING = 10;
const SOFT_EDGE_MINIMUM_SIZE = 75;
const SOFT_EDGE_CONTAINER_RATIO = 0.35;
const PRESS_PSEUDO = "::after";
const ANIMATION_FILL = "forwards";

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

/**
 * Events that the ripple listens to.
 */
const EVENTS = [
	"click",
	"contextmenu",
	"pointercancel",
	"pointerdown",
	"pointerenter",
	"pointerleave",
	"pointerup",
];

/**
 * Delay reacting to touch so that we do not show the ripple for a swipe or
 * scroll interaction.
 */
const TOUCH_DELAY_MS = 150;

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
export class Ripple {
	readonly #element: HTMLElement;
	readonly #props: RippleProps;

	#growAnimation?: Animation;
	#state = State.INACTIVE;
	#rippleStartEvent?: PointerEvent;
	#checkBoundsAfterContextMenu = false;

	constructor(element: HTMLElement, props: RippleProps) {
		this.#element = element;
		this.#props = props;

		$effect(() => {
			if (props.disabled) {
				props.onHoveredChange(false);
				props.onPressedChange(false);
			}
		});

		$effect(() => {
			let target: EventTarget | null;
			if (typeof props.for === "string") {
				target = document.getElementById(props.for);
			} else if (props.for !== undefined) {
				target = props.for;
			} else {
				target = element.parentElement;
			}

			if (target === null) {
				return;
			}

			for (const event of EVENTS) {
				target.addEventListener(event, this);
			}

			return () => {
				for (const event of EVENTS) {
					target.removeEventListener(event, this);
				}
			};
		});
	}

	#handlePointerenter(event: PointerEvent) {
		if (!this.#shouldReactToEvent(event)) {
			return;
		}

		this.#props.onHoveredChange(true);
	}

	#handlePointerleave(event: PointerEvent) {
		if (!this.#shouldReactToEvent(event)) {
			return;
		}

		this.#props.onHoveredChange(false);

		// release a held mouse or pen press that moves outside the element
		if (this.#state !== State.INACTIVE) {
			this.#endPressAnimation();
		}
	}

	#handlePointerup(event: PointerEvent) {
		if (!this.#shouldReactToEvent(event)) {
			return;
		}

		if (this.#state === State.HOLDING) {
			this.#state = State.WAITING_FOR_CLICK;
			return;
		}

		if (this.#state === State.TOUCH_DELAY) {
			this.#state = State.WAITING_FOR_CLICK;
			this.#startPressAnimation(this.#rippleStartEvent);
			return;
		}
	}

	#handlePointerdown(event: PointerEvent) {
		if (!this.#shouldReactToEvent(event)) {
			return;
		}

		this.#rippleStartEvent = event;
		if (!isTouch(event)) {
			this.#state = State.WAITING_FOR_CLICK;
			this.#startPressAnimation(event);
			return;
		}

		// after a longpress contextmenu event, an extra `pointerdown` can be
		// dispatched to the pressed element. Check that the down is within
		// bounds of the element in this case.
		if (this.#checkBoundsAfterContextMenu && this.#inBounds(event)) {
			return;
		}

		this.#checkBoundsAfterContextMenu = false;

		// Wait for a hold after touch delay
		this.#state = State.TOUCH_DELAY;
		window.setTimeout(() => {
			if (this.#state !== State.TOUCH_DELAY) {
				return;
			}

			this.#state = State.HOLDING;
			this.#startPressAnimation(event);
		}, TOUCH_DELAY_MS);
	}

	#handleClick() {
		// Click is a MouseEvent in Firefox and Safari, so we cannot use
		// `shouldReactToEvent`
		if (this.#props.disabled) {
			return;
		}

		if (this.#state === State.WAITING_FOR_CLICK) {
			this.#endPressAnimation();
			return;
		}

		if (this.#state === State.INACTIVE) {
			// keyboard synthesized click event
			this.#startPressAnimation();
			this.#endPressAnimation();
		}
	}

	#handlePointercancel(event: PointerEvent) {
		if (!this.#shouldReactToEvent(event)) {
			return;
		}

		this.#endPressAnimation();
	}

	#handleContextmenu() {
		if (this.#props.disabled) {
			return;
		}

		this.#checkBoundsAfterContextMenu = true;
		this.#endPressAnimation();
	}

	#inBounds({ x, y }: PointerEvent) {
		const { top, left, bottom, right } = this.#element.getBoundingClientRect();
		return x >= left && x <= right && y >= top && y <= bottom;
	}

	#startPressAnimation(positionEvent?: Event) {
		const { height, width, top, left } = this.#element.getBoundingClientRect();

		this.#props.onPressedChange(true);
		this.#growAnimation?.cancel();

		const maxDim = Math.max(height, width);
		const softEdgeSize = Math.max(
			SOFT_EDGE_CONTAINER_RATIO * maxDim,
			SOFT_EDGE_MINIMUM_SIZE,
		);
		const initialSize = Math.floor(maxDim * INITIAL_ORIGIN_SCALE);
		const hypotenuse = Math.sqrt(width ** 2 + height ** 2);
		const maxRadius = hypotenuse + PADDING;
		const rippleScale = `${(maxRadius + softEdgeSize) / initialSize}`;
		const rippleSize = `${initialSize}px`;

		let startX: number, startY: number;
		if (positionEvent instanceof PointerEvent) {
			const { scrollX, scrollY } = window;
			const documentX = scrollX + left;
			const documentY = scrollY + top;
			const { pageX, pageY } = positionEvent;
			startX = pageX - documentX;
			startY = pageY - documentY;
		} else {
			startX = width / 2;
			startY = height / 2;
		}

		// center around start point
		startX -= initialSize / 2;
		startY -= initialSize / 2;

		// end in the center
		const endX = (width - initialSize) / 2;
		const endY = (height - initialSize) / 2;

		this.#growAnimation = this.#element.animate(
			{
				top: [0, 0],
				left: [0, 0],
				height: [rippleSize, rippleSize],
				width: [rippleSize, rippleSize],
				transform: [
					`translate(${startX}px, ${startY}px) scale(1)`,
					`translate(${endX}px, ${endY}px) scale(${rippleScale})`,
				],
			},
			{
				pseudoElement: PRESS_PSEUDO,
				duration: PRESS_GROW_MS,
				easing: this.#props.easing,
				fill: ANIMATION_FILL,
			},
		);
	}

	#endPressAnimation() {
		this.#rippleStartEvent = undefined;
		this.#state = State.INACTIVE;

		const animation = this.#growAnimation;
		let pressAnimationPlayState = Infinity;
		if (typeof animation?.currentTime === "number") {
			pressAnimationPlayState = animation.currentTime;
		} else if (animation?.currentTime != null) {
			pressAnimationPlayState = animation.currentTime.to("ms").value;
		}

		if (pressAnimationPlayState >= MINIMUM_PRESS_MS) {
			this.#props.onPressedChange(false);
			return;
		}

		window.setTimeout(() => {
			if (this.#growAnimation !== animation) {
				// A new press animation was started. The old animation was canceled and
				// should not finish the pressed state.
				return;
			}

			this.#props.onPressedChange(false);
		}, MINIMUM_PRESS_MS - pressAnimationPlayState);
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
	#shouldReactToEvent(event: PointerEvent) {
		if (this.#props.disabled || !event.isPrimary) {
			return false;
		}

		if (
			this.#rippleStartEvent !== undefined &&
			this.#rippleStartEvent.pointerId !== event.pointerId
		) {
			return false;
		}

		if (event.type === "pointerenter" || event.type === "pointerleave") {
			return !isTouch(event);
		}

		const isPrimaryButton = event.buttons === 1;
		return isTouch(event) || isPrimaryButton;
	}

	/** @private */
	handleEvent(event: Event) {
		const forcedColors = window.matchMedia("(forced-colors: active)");
		if (forcedColors.matches) {
			// Skip event logic since the ripple is `display: none`.
			return;
		}

		switch (event.type) {
			case "click":
				this.#handleClick();
				break;
			case "contextmenu":
				this.#handleContextmenu();
				break;
			case "pointercancel":
				this.#handlePointercancel(event as PointerEvent);
				break;
			case "pointerdown":
				this.#handlePointerdown(event as PointerEvent);
				break;
			case "pointerenter":
				this.#handlePointerenter(event as PointerEvent);
				break;
			case "pointerleave":
				this.#handlePointerleave(event as PointerEvent);
				break;
			case "pointerup":
				this.#handlePointerup(event as PointerEvent);
				break;
			default:
				break;
		}
	}
}

function isTouch({ pointerType }: PointerEvent) {
	return pointerType === "touch";
}
