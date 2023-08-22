import {GameResizeHandler, MapMoveHandler} from "../event/EventHandlerTypes";
import {basicMapNavigationHandler, gameMapRendererManager} from "../game/GameManager";
import {Graphics} from "pixi.js";
import {eventRegistry} from "../event/EventManager";
import {gameManager, renderer} from "../main";

export class GridOutlineRenderer implements GameResizeHandler, MapMoveHandler {
	object: Graphics;

	init() {
		this.object = new Graphics();
		this.object.lineStyle(0.1, 0x999999);
		for (let y = 0; y < 50; y++) {
			for (let x = 0; x < 50; x++) {
				let ox = y % 2 === 0 ? x * 2 * 1.73205080757 : x * 2 * 1.73205080757 + 1.73205080757;
				let oy = y * 3;
				this.object.drawPolygon([
					ox, oy + 2,
					ox + 1.73205080757, oy + 1,
					ox + 1.73205080757, oy - 1,
					ox, oy - 2,
					ox - 1.73205080757, oy - 1,
					ox - 1.73205080757, oy + 1,
				]);
			}
		}
		this.object.endFill();
		this.object.alpha = 0;
		gameMapRendererManager.container.addChild(this.object);
		this.object.mask = gameMapRendererManager.terrainMask;
		eventRegistry.registerZoomHandler(this);
		eventRegistry.registerMapMoveHandler(this);
	}

	destroy() {
		this.object.destroy();
		this.object = null;
		eventRegistry.unregisterZoomHandler(this);
		eventRegistry.unregisterMapMoveHandler(this);
	}

	handleZoom(): void {
		this.object.alpha = Math.max(0, 1.1 / (1 + 1.8 * Math.exp(0.16 * (renderer.app.view.width * gameManager.width / gameMapRendererManager.container.width) - 5)) - 0.1);
	}

	handleMapMove() {
		let hex = basicMapNavigationHandler.getHexTileAt(0, 0).toOffset().add(-1, -1);
		this.object.position.set(hex.getCenterX(), hex.getCenterY());
	}
}