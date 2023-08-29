import {interactionManager, renderer} from "../main";
import {ClickInteractionHandler, DragInteractionHandler, HoverInteractionHandler, ScrollInteractionHandler} from "./InteractionHandlerTypes";
import {InteractionRegistry} from "./InteractionRegistry";
import {FederatedPointerEvent, FederatedWheelEvent} from "pixi.js";

export const interactionRegistry = new InteractionRegistry();

export class InteractionManager {
	clickListeners: ClickInteractionHandler[] = [];
	dragListeners: DragInteractionHandler[] = [];
	scrollListeners: ScrollInteractionHandler[] = [];
	hoverListeners: HoverInteractionHandler[] = [];
	activeDragListener: DragInteractionHandler = null;
	pressTimeout: NodeJS.Timeout = null;
	pressX: number = null;
	pressY: number = null;

	constructor() {
		renderer.app.stage.eventMode = "static";
		renderer.app.stage.hitArea = renderer.app.screen;
		renderer.app.stage.on("pointerdown", this.onPointerDown);
		renderer.app.stage.on("pointerup", this.onPointerUp);
		renderer.app.stage.on("pointerupoutside", this.onPointerLeave);
		renderer.app.stage.on("pointermove", this.onHover);
		renderer.app.stage.on("wheel", this.onScroll);
	}

	onHover(event: FederatedPointerEvent) {
		if (interactionManager.pressTimeout) {
			if (Math.abs(event.x - interactionManager.pressX) + Math.abs(event.y - interactionManager.pressY) < 10) return;
			clearTimeout(interactionManager.pressTimeout);
			interactionManager.pressTimeout = null;
			for (let listener of interactionManager.dragListeners) {
				if (listener.testDrag(interactionManager.pressX, interactionManager.pressY)) {
					listener.onDragStart(interactionManager.pressX, interactionManager.pressY);
					interactionManager.activeDragListener = listener;
					return;
				}
			}
		}
		if (interactionManager.activeDragListener) {
			interactionManager.activeDragListener.onDragMove(event.x, event.y);
		}
		for (let listener of interactionManager.hoverListeners) {
			if (listener.testHover(event.x, event.y)) {
				listener.onHover(event.x, event.y);
				return;
			}
		}
	}

	onPointerDown(event: FederatedPointerEvent) {
		interactionManager.pressX = event.x;
		interactionManager.pressY = event.y;
		interactionManager.pressTimeout = setTimeout(() => {
			interactionManager.pressTimeout = null;
			for (let listener of interactionManager.dragListeners) {
				if (listener.testDrag(event.x, event.y)) {
					listener.onDragStart(event.x, event.y);
					interactionManager.activeDragListener = listener;
					return;
				}
			}
		}, 1000);
	}

	onPointerUp(event: FederatedPointerEvent) {
		if (interactionManager.pressTimeout) {
			clearTimeout(interactionManager.pressTimeout);
			interactionManager.pressTimeout = null;
			for (let listener of interactionManager.clickListeners) {
				if (listener.testClick(event.x, event.y)) {
					listener.onClick(event.x, event.y);
					return;
				}
			}
		} else if (interactionManager.activeDragListener) {
			interactionManager.activeDragListener.onDragEnd(event.x, event.y);
			interactionManager.activeDragListener = null;
		}
	}

	onPointerLeave(event: FederatedPointerEvent) {
		if (interactionManager.activeDragListener) {
			interactionManager.activeDragListener.onDragCancel(event.x, event.y);
			interactionManager.activeDragListener = null;
		}
	}

	onScroll(e: FederatedWheelEvent) {
		for (let listener of interactionManager.scrollListeners) {
			if (listener.testScroll(e.x, e.y)) {
				listener.onScroll(e.x, e.y, e.deltaY);
				return;
			}
		}
	}
}