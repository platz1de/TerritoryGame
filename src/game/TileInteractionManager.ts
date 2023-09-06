import {interactionRegistry} from "../interaction/InteractionManager";
import {ClickInteractionHandler} from "../interaction/InteractionHandlerTypes";
import {basicMapNavigationHandler, gameMapRendererManager, tileActionInterface} from "./GameManager";
import {gameManager} from "../main";
import {OffsetCoordinate} from "../math/OffsetCoordinate";
import {Graphics} from "pixi.js";

export class TileInteractionManager implements ClickInteractionHandler {
	outline: Graphics;
	selectedTile: OffsetCoordinate = null;

	enable() {
		this.outline = new Graphics();
		this.outline.lineStyle(0.35, 0xffd900);
		this.outline.moveTo(-Math.sqrt(3) - 0.125, -0.5);
		this.outline.lineTo(-Math.sqrt(3) - 0.125, -(Math.sqrt(3) + 0.125) / Math.sqrt(3));
		this.outline.lineTo(-(Math.sqrt(3) + 0.125) * 3 / 4, -(Math.sqrt(3) + 0.125) / Math.sqrt(3) * 1.25);
		this.outline.moveTo(-(Math.sqrt(3) + 0.125) / 4, -(Math.sqrt(3) + 0.125) / Math.sqrt(3) * 1.75);
		this.outline.lineTo(0, -2.125);
		this.outline.lineTo((Math.sqrt(3) + 0.125) / 4, -(Math.sqrt(3) + 0.125) / Math.sqrt(3) * 1.75);
		this.outline.moveTo((Math.sqrt(3) + 0.125) * 3 / 4, -(Math.sqrt(3) + 0.125) / Math.sqrt(3) * 1.25);
		this.outline.lineTo(Math.sqrt(3) + 0.125, -(Math.sqrt(3) + 0.125) / Math.sqrt(3));
		this.outline.lineTo(Math.sqrt(3) + 0.125, -0.5);
		this.outline.moveTo(Math.sqrt(3) + 0.125, 0.5);
		this.outline.lineTo(Math.sqrt(3) + 0.125, (Math.sqrt(3) + 0.125) / Math.sqrt(3));
		this.outline.lineTo((Math.sqrt(3) + 0.125) * 3 / 4, (Math.sqrt(3) + 0.125) / Math.sqrt(3) * 1.25);
		this.outline.moveTo((Math.sqrt(3) + 0.125) / 4, (Math.sqrt(3) + 0.125) / Math.sqrt(3) * 1.75);
		this.outline.lineTo(0, 2.125);
		this.outline.lineTo(-(Math.sqrt(3) + 0.125) / 4, (Math.sqrt(3) + 0.125) / Math.sqrt(3) * 1.75);
		this.outline.moveTo(-(Math.sqrt(3) + 0.125) * 3 / 4, (Math.sqrt(3) + 0.125) / Math.sqrt(3) * 1.25);
		this.outline.lineTo(-Math.sqrt(3) - 0.125, (Math.sqrt(3) + 0.125) / Math.sqrt(3));
		this.outline.lineTo(-Math.sqrt(3) - 0.125, 0.5);
		this.outline.endFill();
		gameMapRendererManager.container.addChild(this.outline);
		this.outline.visible = false;

		interactionRegistry.registerClickHandler(this);
	}

	disable() {
		interactionRegistry.unregisterClickHandler(this);
	}

	onClick(x: number, y: number): void {
		this.selectedTile = basicMapNavigationHandler.getHexTileAt(x, y).toOffset();
		this.outline.position.set(this.selectedTile.getCenterX(), this.selectedTile.getCenterY());
		this.outline.visible = true;
		tileActionInterface.open(this.selectedTile);
	}

	testClick(x: number, y: number): boolean {
		this.selectedTile = null;
		this.outline.visible = false;
		tileActionInterface.close();
		if (!basicMapNavigationHandler.isInMap(x, y)) return false;
		let hex = basicMapNavigationHandler.getHexTileAt(x, y).toOffset();
		return gameManager.tileTypes[hex.y][hex.x] !== 0;
	}
}