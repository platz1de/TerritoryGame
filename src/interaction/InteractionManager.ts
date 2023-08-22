import {eventManager, interactionManager, renderer} from "../main";
import {ClickInteractionHandler, DragInteractionHandler, HoverInteractionHandler, ScrollInteractionHandler} from "./InteractionHandlerTypes";
import {InteractionRegistry} from "./InteractionRegistry";

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

	onHover(event) {
		let x = event.data.global.x, y = event.data.global.y;
		if (interactionManager.pressTimeout) {
			if (Math.abs(x - interactionManager.pressX) + Math.abs(y - interactionManager.pressY) < 10) return;
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
			interactionManager.activeDragListener.onDragMove(x, y);
		}
		for (let listener of interactionManager.hoverListeners) {
			if (listener.testHover(x, y)) {
				listener.onHover(x, y);
				return;
			}
		}
	}

	onPointerDown(event) {
		let x = event.data.global.x, y = event.data.global.y;
		interactionManager.pressX = x;
		interactionManager.pressY = y;
		interactionManager.pressTimeout = setTimeout(() => {
			interactionManager.pressTimeout = null;
			for (let listener of interactionManager.dragListeners) {
				if (listener.testDrag(x, y)) {
					listener.onDragStart(x, y);
					interactionManager.activeDragListener = listener;
					return;
				}
			}
		}, 1000);
	}

	onPointerUp(event) {
		let x = event.data.global.x, y = event.data.global.y;
		if (interactionManager.pressTimeout) {
			clearTimeout(interactionManager.pressTimeout);
			interactionManager.pressTimeout = null;
			for (let listener of interactionManager.clickListeners) {
				if (listener.testClick(x, y)) {
					listener.onClick(x, y);
					return;
				}
			}
		} else if (interactionManager.activeDragListener) {
			interactionManager.activeDragListener.onDragEnd(x, y);
			interactionManager.activeDragListener = null;
		}
	}

	onPointerLeave(event) {
		if (interactionManager.activeDragListener) {
			interactionManager.activeDragListener.onDragCancel(event.data.global.x, event.data.global.y);
			interactionManager.activeDragListener = null;
		}
	}

	onScroll(e) {
		for (let listener of interactionManager.scrollListeners) {
			if (listener.testScroll(e.data.global.x, e.data.global.y)) {
				listener.onScroll(e.data.global.x, e.data.global.y, e.deltaY);
				return;
			}
		}
	}
}