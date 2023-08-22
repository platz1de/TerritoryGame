export interface GameResizeHandler {
	handleZoom(): void;
}

export interface WindowResizeHandler {
	handleResize(): void;
}

export abstract class BasicResizeHandler implements GameResizeHandler, WindowResizeHandler {
	abstract handleResize(): void;

	handleZoom(): void {
		this.handleResize();
	}
}

export interface MapMoveHandler {
	handleMapMove(): void;
}