import {GameResizeHandler, MapMoveHandler, WindowResizeHandler} from "./EventHandlerTypes";
import {eventManager} from "../main";

export class EventRegistry {
	registerResizeHandler(handler: WindowResizeHandler) {
		eventManager.resizeListeners.push(handler);
	}

	unregisterResizeHandler(handler: WindowResizeHandler) {
		for (let i in eventManager.resizeListeners) {
			if (eventManager.resizeListeners[i] === handler) {
				delete eventManager.resizeListeners[i];
				return;
			}
		}
	}

	registerZoomHandler(handler: GameResizeHandler) {
		eventManager.zoomListeners.push(handler);
	}

	unregisterZoomHandler(handler: GameResizeHandler) {
		for (let i in eventManager.zoomListeners) {
			if (eventManager.zoomListeners[i] === handler) {
				delete eventManager.zoomListeners[i];
				return;
			}
		}
	}

	registerMapMoveHandler(handler: MapMoveHandler) {
		eventManager.mapMoveListeners.push(handler);
	}

	unregisterMapMoveHandler(handler: MapMoveHandler) {
		for (let i in eventManager.mapMoveListeners) {
			if (eventManager.mapMoveListeners[i] === handler) {
				delete eventManager.mapMoveListeners[i];
				return;
			}
		}
	}
}