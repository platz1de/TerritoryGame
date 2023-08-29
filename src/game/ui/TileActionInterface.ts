import {Container, Graphics, SCALE_MODES, Sprite} from "pixi.js";
import {gameManager, renderer} from "../../main";
import {OffsetCoordinate} from "../../math/OffsetCoordinate";
import {basicMapNavigationHandler, gameMapRendererManager, spawnManager, territoryManager, tileActionInterface, tileInteractionHandler} from "../GameManager";
import {GameResizeHandler, MapMoveHandler} from "../../event/EventHandlerTypes";
import {eventRegistry} from "../../event/EventManager";
import {ClickInteractionHandler, HoverInteractionHandler} from "../../interaction/InteractionHandlerTypes";
import {AxialCoordinate} from "../../math/AxialCoordinate";
import {interactionRegistry} from "../../interaction/InteractionManager";

export class TileActionInterface implements MapMoveHandler, GameResizeHandler, HoverInteractionHandler, ClickInteractionHandler {
	container: Container;
	elements: Graphics[] = [];
	sprites: Sprite[] = [];
	isOpen: boolean = false;
	currentTile: number = null;

	init() {
		this.container = new Container();
		renderer.app.stage.addChild(this.container);
		this.container.alpha = 0;

		createActionTile("attack", 0);
		createActionTile("targeted_attack", 1);
		createActionTile("donation", 2);
		createActionTile("message", 3);
		createActionTile("profile", 4);
		createActionTile("boat", 5);

		eventRegistry.registerMapMoveHandler(this);
		eventRegistry.registerZoomHandler(this);
		interactionRegistry.registerHoverHandler(this);
		interactionRegistry.registerClickHandler(this);
	}

	open(hex: OffsetCoordinate) {
		this.container.position.set(basicMapNavigationHandler.x + basicMapNavigationHandler.zoom * hex.getCenterX(), basicMapNavigationHandler.y + basicMapNavigationHandler.zoom * hex.getCenterY());

		this.container.alpha = 1;
		this.isOpen = true;
	}

	close() {
		this.container.alpha = 0;
		this.isOpen = false;
		this.unselect();
	}

	destroy() {
		this.container.destroy();
		this.container = null;
		for (let element of this.elements) {
			element.destroy();
		}
		this.elements = [];
		for (let sprite of this.sprites) {
			sprite.destroy();
		}
		this.sprites = [];
		this.isOpen = false;

		eventRegistry.unregisterMapMoveHandler(this);
		eventRegistry.unregisterZoomHandler(this);
		interactionRegistry.unregisterHoverHandler(this);
		interactionRegistry.unregisterClickHandler(this);
	}

	handleMapMove(): void {
		this.close();
	}

	handleZoom(): void {
		this.close();
	}

	getTile(x: number, y: number): number {
		if (!this.isOpen) return null;
		let ox = x - basicMapNavigationHandler.x - tileInteractionHandler.selectedTile.getCenterX() * basicMapNavigationHandler.zoom, oy = y - basicMapNavigationHandler.y - tileInteractionHandler.selectedTile.getCenterY() * basicMapNavigationHandler.zoom;
		let hex = new AxialCoordinate(ox / 54, (Math.sqrt(3) * oy - ox) / 108).round();
		if (hex.q === 0 && hex.r === 0) return -1;
		if (hex.q === 0 && hex.r === 1) return 0;
		if (hex.q === -1 && hex.r === 1) return 1;
		if (hex.q === -1 && hex.r === 0) return 2;
		if (hex.q === 0 && hex.r === -1) return 3;
		if (hex.q === 1 && hex.r === -1) return 4;
		if (hex.q === 1 && hex.r === 0) return 5;
		if (Math.abs(ox) ** 2 + Math.abs(oy) ** 2 < 15876) return -1;
		return null;
	}

	testClick(x: number, y: number): boolean {
		return this.getTile(x, y) !== null;
	}

	onClick(x: number, y: number): void {
		let tile = this.getTile(x, y);
		if (tile === -1) {
			this.close();
			return;
		}
		switch (tile) {
			case 0:
				spawnManager.selectSpawn(gameManager.localPlayer, tileInteractionHandler.selectedTile.x, tileInteractionHandler.selectedTile.y);
				territoryManager.orderRerender();
				break;
			case 1:
				break;
			case 2:
				break;
			case 3:
				break;
			case 4:
				break;
			case 5:
				break;
		}
		this.close();
	}

	testHover(x: number, y: number): boolean {
		let tile = this.getTile(x, y);
		if (tile === null) {
			if (this.isOpen) {
				this.close();
			}
			return false;
		}
		return true;
	}

	onHover(x: number, y: number): void {
		let tile = this.getTile(x, y);
		if (tile === -1) {
			this.unselect();
			return;
		}
		if (tile !== this.currentTile) {
			this.unselect();
			if (tile !== null) {
				this.sprites[tile].scale.set(2.5);
			}
			this.currentTile = tile;
		}
	}

	unselect() {
		if (this.currentTile !== null) {
			this.sprites[this.currentTile].scale.set(2);
			this.currentTile = null;
		}
	}
}

function createActionTile(name: string, position: number) {
	let tile = new Graphics();
	let sprite = Sprite.from(name);
	sprite.texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
	sprite.anchor.set(0.5);
	sprite.scale.set(2);
	tile.addChild(sprite);
	tileActionInterface.sprites.push(sprite);
	tile.beginFill(0xffaa00);
	tile.lineStyle(1, 0x000000);
	tile.drawPolygon([
		30, 0,
		15, 15 * Math.sqrt(3),
		-15, 15 * Math.sqrt(3),
		-30, 0,
		-15, 15 * -Math.sqrt(3),
		15, 15 * -Math.sqrt(3)
	]);
	tileActionInterface.elements.push(tile);
	switch (position) {
		case 0:
			tile.position.set(0, 36 * Math.sqrt(3));
			break;
		case 1:
			tile.position.set(-54, 18 * Math.sqrt(3));
			break;
		case 2:
			tile.position.set(-54, -18 * Math.sqrt(3));
			break;
		case 3:
			tile.position.set(0, -36 * Math.sqrt(3));
			break;
		case 4:
			tile.position.set(54, -18 * Math.sqrt(3));
			break;
		case 5:
			tile.position.set(54, 18 * Math.sqrt(3));
	}
	tileActionInterface.container.addChild(tile);
}