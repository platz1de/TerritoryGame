import {GameResizeHandler, MapMoveHandler, WindowResizeHandler} from "./EventHandlerTypes";
import {EventRegistry} from "./EventRegistry";

export const eventRegistry = new EventRegistry();

/**
 * Events, different from interactions, apply to the entire page instead of a single element
 */
export class EventManager {
	resizeListeners: WindowResizeHandler[] = [];
	zoomListeners: GameResizeHandler[] = [];
	mapMoveListeners: MapMoveHandler[] = [];

	constructor() {
		document.addEventListener("resize", this.onResize);
	}

	onResize() {
		for (let listener of this.resizeListeners) {
			listener.handleResize();
		}
	}

	onScroll() {
		for (let listener of this.zoomListeners) {
			listener.handleZoom();
		}
	}

	onMapMove() {
		for (let listener of this.mapMoveListeners) {
			listener.handleMapMove();
		}
	}
}