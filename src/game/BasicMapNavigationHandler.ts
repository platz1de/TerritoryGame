import {interactionRegistry} from "../interaction/InteractionManager";
import {DragInteractionHandler, ScrollInteractionHandler} from "../interaction/InteractionHandlerTypes";
import {AxialCoordinate} from "../math/AxialCoordinate";
import {gameMapRendererManager} from "./GameManager";

export class BasicMapNavigationHandler implements ScrollInteractionHandler, DragInteractionHandler {
	x: number = 0;
	y: number = 0;
	xSize: number = 0;
	ySize: number = 0;
	zoom: number = 1;
	dragX: number = 0;
	dragY: number = 0;

	enable(xSize: number, ySize: number) {
		this.x = gameMapRendererManager.container.x;
		this.y = gameMapRendererManager.container.y;
		console.log(this.x, this.y);
		this.xSize = xSize;
		this.ySize = ySize;
		this.zoom = 1;
		interactionRegistry.registerDragHandler(this);
		interactionRegistry.registerScrollHandler(this);
	}

	disable() {
		interactionRegistry.unregisterDragHandler(this);
		interactionRegistry.unregisterScrollHandler(this);
	}

	onScroll(x: number, y: number, delta: number): void {
		let mapX = this.getMapX(x), mapY = this.getMapY(y);
		this.zoom -= Math.max(-1, Math.min(1, delta)) * 0.1 * this.zoom;
		this.x = -mapX * this.zoom + x;
		this.y = -mapY * this.zoom + y;
		gameMapRendererManager.container.setTransform(this.x, this.y, this.zoom, this.zoom);
	}

	testScroll(x: number, y: number): boolean {
		return this.isInMap(x, y);
	}

	testDrag(x: number, y: number): boolean {
		return this.isInMap(x, y);
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
		this.x += x - this.dragX;
		this.y += y - this.dragY;
		this.dragX = x;
		this.dragY = y;
		gameMapRendererManager.container.setTransform(this.x, this.y, this.zoom, this.zoom);
	}

	isInMap(x: number, y: number): boolean {
		let hex = this.getHexTileAt(x, y).toOffset();
		return hex.x >= 0 && hex.x < this.xSize && hex.y >= 0 && hex.y < this.ySize;
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