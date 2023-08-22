import {interactionManager, renderer} from "../main";
import {ClickInteractionHandler, DragInteractionHandler, HoverInteractionHandler, ScrollInteractionHandler} from "./InteractionHandlerTypes";
import {InteractionRegistry} from "./InteractionRegistry";

export const interactionRegistry = new InteractionRegistry();

export class InteractionManager {
	clickListeners: ClickInteractionHandler[] = [];
	dragListeners: DragInteractionHandler[] = [];
	scrollListeners: ScrollInteractionHandler[] = [];
	hoverListeners: HoverInteractionHandler[] = [];
	activeDragListener: DragInteractionHandler = null;

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
		if (interactionManager.activeDragListener) {
			interactionManager.activeDragListener.onDragMove(event.data.global.x, event.data.global.y);
		}
		for (let listener of interactionManager.hoverListeners) {
			if (listener.testHover(event.data.global.x, event.data.global.y)) {
				listener.onHover(event.data.global.x, event.data.global.y);
				return;
			}
		}
	}

	onPointerDown(event) {
		let x = event.data.global.x, y = event.data.global.y;
		for (let listener of interactionManager.clickListeners) {
			if (listener.testClick(x, y)) {
				listener.onClick();
				return;
			}
		}
		for (let listener of interactionManager.dragListeners) {
			if (listener.testDrag(x, y)) {
				listener.onDragStart(x, y);
				interactionManager.activeDragListener = listener;
				return;
			}
		}
	}

	onPointerUp(event) {
		if (interactionManager.activeDragListener) {
			interactionManager.activeDragListener.onDragEnd(event.data.global.x, event.data.global.y);
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