import {interactionRegistry} from "../interaction/InteractionManager";
import {DragInteractionHandler, ScrollInteractionHandler} from "../interaction/InteractionHandlerTypes";
import {AxialCoordinate} from "../math/AxialCoordinate";
import {gameMapRendererManager} from "./GameManager";
import {eventManager, gameManager, renderer} from "../main";

export class BasicMapNavigationHandler implements ScrollInteractionHandler, DragInteractionHandler {
	x: number = 0;
	y: number = 0;
	zoom: number = 1;
	dragX: number = 0;
	dragY: number = 0;

	enable() {
		let minXZoom = renderer.app.view.width / gameMapRendererManager.containerWidth, minYZoom = renderer.app.view.height / gameMapRendererManager.containerHeight;
		this.zoom = 0.9 * Math.min(minXZoom, minYZoom);
		this.x = (renderer.app.view.width - gameMapRendererManager.containerWidth * this.zoom) / 2;
		this.y = (renderer.app.view.height - gameMapRendererManager.containerHeight * this.zoom) / 2;
		gameMapRendererManager.container.setTransform(this.x + Math.sqrt(3) * this.zoom, this.y + 2 * this.zoom, this.zoom, this.zoom);
		interactionRegistry.registerDragHandler(this);
		interactionRegistry.registerScrollHandler(this);
	}

	disable() {
		interactionRegistry.unregisterDragHandler(this);
		interactionRegistry.unregisterScrollHandler(this);
	}

	onScroll(x: number, y: number, delta: number): void {
		let mapX = this.getMapX(x), mapY = this.getMapY(y);
		this.zoom -= Math.max(-1, Math.min(1, delta)) * 0.3 * this.zoom;
		this.zoom = Math.max(0.5, Math.min(1000, this.zoom));
		gameMapRendererManager.container.scale.set(this.zoom, this.zoom);
		this.x = Math.max(Math.min(-mapX * this.zoom + x, 9 * renderer.app.view.width / 10), renderer.app.view.width / 10 - gameMapRendererManager.containerWidth * this.zoom);
		this.y = Math.max(Math.min(-mapY * this.zoom + y, 9 * renderer.app.view.height / 10), renderer.app.view.height / 10 - gameMapRendererManager.containerHeight * this.zoom);
		gameMapRendererManager.container.position.set(this.x + Math.sqrt(3) * this.zoom, this.y + 2 * this.zoom);
		eventManager.onMapMove();
		eventManager.onScroll();
	}

	testScroll(x: number, y: number): boolean {
		return true;
	}

	testDrag(x: number, y: number): boolean {
		return true;
	}

	onDragStart(x: number, y: number): void {
		this.dragX = x;
		this.dragY = y;
	}

	onDragCancel(x: number, y: number): void {
	}

	onDragEnd(x: number, y: number): void {
	}

	onDragMove(x: number, y: number): void {
		this.x = Math.max(Math.min(this.x + x - this.dragX, 9 * renderer.app.view.width / 10), renderer.app.view.width / 10 - gameMapRendererManager.containerWidth * this.zoom);
		this.y = Math.max(Math.min(this.y + y - this.dragY, 9 * renderer.app.view.height / 10), renderer.app.view.height / 10 - gameMapRendererManager.containerHeight * this.zoom);
		this.dragX = x;
		this.dragY = y;
		gameMapRendererManager.container.position.set(this.x + Math.sqrt(3) * this.zoom, this.y + 2 * this.zoom);
		eventManager.onMapMove();
	}

	isInMap(x: number, y: number): boolean {
		let hex = this.getHexTileAt(x, y).toOffset();
		return hex.x >= 0 && hex.x < gameManager.width && hex.y >= 0 && hex.y < gameManager.height;
	}

	getHexTileAt(x: number, y: number): AxialCoordinate {
		let mapX = this.getMapX(x), mapY = this.getMapY(y);
		return new AxialCoordinate((1.73205080757 / 3 * mapX - 1 / 3 * mapY) / 2, mapY / 3).round();
	}

	getMapX(x: number): number {
		return(x - this.x) / this.zoom;
	}

	getMapY(y: number): number {
		return (y - this.y) / this.zoom;
	}
}