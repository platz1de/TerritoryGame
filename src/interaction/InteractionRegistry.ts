import {ClickInteractionHandler, DragInteractionHandler, HoverInteractionHandler, ScrollInteractionHandler} from "./InteractionHandlerTypes";
import {interactionManager} from "../main";

export class InteractionRegistry {
	registerClickHandler(handler: ClickInteractionHandler, takePriority: boolean = false) {
		if (takePriority) {
			interactionManager.clickListeners.unshift(handler);
		} else {
			interactionManager.clickListeners.push(handler);
		}
	}

	unregisterClickHandler(handler: ClickInteractionHandler) {
		for (let i in interactionManager.clickListeners) {
			if (interactionManager.clickListeners[i] === handler) {
				delete interactionManager.clickListeners[i];
				return;
			}
		}
	}

	registerDragHandler(handler: DragInteractionHandler, takePriority: boolean = false) {
		if (takePriority) {
			interactionManager.dragListeners.unshift(handler);
		} else {
			interactionManager.dragListeners.push(handler);
		}
	}

	unregisterDragHandler(handler: DragInteractionHandler) {
		for (let i in interactionManager.dragListeners) {
			if (interactionManager.dragListeners[i] === handler) {
				delete interactionManager.dragListeners[i];
				return;
			}
		}
	}

	registerScrollHandler(handler: ScrollInteractionHandler, takePriority: boolean = false) {
		if (takePriority) {
			interactionManager.scrollListeners.unshift(handler);
		} else {
			interactionManager.scrollListeners.push(handler);
		}
	}

	unregisterScrollHandler(handler: ScrollInteractionHandler) {
		for (let i in interactionManager.scrollListeners) {
			if (interactionManager.scrollListeners[i] === handler) {
				delete interactionManager.scrollListeners[i];
				return;
			}
		}
	}

	registerHoverHandler(handler: HoverInteractionHandler, takePriority: boolean = false) {
		if (takePriority) {
			interactionManager.hoverListeners.unshift(handler);
		} else {
			interactionManager.hoverListeners.push(handler);
		}
	}

	unregisterHoverHandler(handler: HoverInteractionHandler) {
		for (let i in interactionManager.hoverListeners) {
			if (interactionManager.hoverListeners[i] === handler) {
				delete interactionManager.hoverListeners[i];
				return;
			}
		}
	}
}