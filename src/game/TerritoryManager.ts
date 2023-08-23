import {gameManager, renderer} from "../main";
import {gameMapRendererManager, playerManager, territoryManager} from "./GameManager";
import {Container, Graphics, LINE_CAP, Sprite} from "pixi.js";
import {OffsetCoordinate} from "../math/OffsetCoordinate";

/**
 * These wonderful values were found after tinkering with trigonometry for a way too long time.
 * No idea why they work, but they do. So don't touch them. Ever. Or else. I'm watching you. 👀
 */
const weird_value = Math.sin(Math.PI / 3 - Math.atan(2 / Math.sqrt(3))) * Math.sqrt(7 / 192);
const weird_value2 = Math.cos(Math.PI / 3 - Math.atan(Math.sqrt(3) / 2)) * Math.sqrt(7 / 192);

export class TerritoryManager {
	container: Container;
	owner: number[][];
	territory: PlayerTerritoryRenderer[] = [];

	init() {
		this.owner = gameManager.tileTypes.map(row => row.map(() => undefined));

		this.container = new Container();
		gameMapRendererManager.container.addChild(this.container);
		for (let i = 0; i < playerManager.players.length; i++) {
			this.territory[i] = new PlayerTerritoryRenderer(i);
		}

		this.conquer(120, 120, 0)
		this.conquer(119, 120, 0)
		this.conquer(119, 121, 0)
		this.conquer(120, 121, 0)
		this.conquer(119, 119, 0)
		this.conquer(121, 120, 0)
		this.conquer(120, 119, 0)
		this.conquer(118, 120, 0)
		this.conquer(117, 119, 0)
		this.applyAll()
	}

	conquer(x: number, y: number, owner: number) {
		let target = this.territory[owner];
		if (this.owner[y][x] !== undefined) {
			this.territory[this.owner[y][x]].removePixel(new OffsetCoordinate(x, y));
		}
		this.owner[y][x] = owner;
		target.addPixel(new OffsetCoordinate(x, y));
	}

	applyAll() {
		for (let i = 0; i < this.territory.length; i++) {
			this.territory[i].apply();
		}
	}

	destroy() {
		this.owner = [];
		for (const territory of this.territory) {
			territory.destroy();
		}
		this.territory = [];
		this.container.destroy();
		this.container = undefined;
	}
}

class PlayerTerritoryRenderer {
	id: number;
	container: Container;
	rows: Graphics[] = [];
	mask: Graphics;
	background: Graphics;
	border: Graphics;
	pixels: number[][] = [];
	borderPixels: number[][] = [];
	scheduledCalculations: number[][] = [];
	scheduledRenders: number[][] = [];
	scheduledRemovals: number[] = [];

	constructor(id: number) {
		this.id = id;
		this.container = new Container();
		territoryManager.container.addChild(this.container);

		this.background = new Graphics();
		this.background.beginFill(playerManager.players[id].color, 0.5);
		this.background.drawRect(0, 0, 1, 1);
		this.background.scale.set(gameMapRendererManager.container.width, gameMapRendererManager.container.height);
		territoryManager.container.addChild(this.background);
		this.background.mask = this.container;

		this.border = new Graphics();
		this.border.mask = this.container;
		territoryManager.container.addChild(this.border);
	}

	addPixel(hex: OffsetCoordinate) {
		this.pixels.push([hex.x, hex.y]);
		this.scheduleRecalculation(hex.x, hex.y);
		if (!this.scheduledRenders[hex.y]) this.scheduledRenders[hex.y] = [];
		this.scheduledRenders[hex.y].push(hex.x);
		hex.onNeighbors((x, y) => {
			this.scheduleRecalculation(x, y);
		});
	}

	removePixel(hex: OffsetCoordinate) {
		this.pixels.splice(this.pixels.indexOf([hex.x, hex.y]), 1);
		this.borderPixels.splice(this.borderPixels.indexOf([hex.x, hex.y]), 1);
		if (!this.scheduledRemovals.includes(hex.y)) this.scheduledRemovals.push(hex.y);
		hex.onNeighbors((x, y) => {
			this.scheduleRecalculation(x, y);
		});
	}

	scheduleRecalculation(x: number, y: number) {
		if (this.scheduledCalculations.indexOf([x, y]) === -1 && territoryManager.owner[y][x] === this.id) {
			this.scheduledCalculations.push([x, y]);
		}
	}

	apply() {
		let hadBorderChange = false;
		for (const pos of this.scheduledCalculations) {
			if (this.recalculateStatus(new OffsetCoordinate(pos[0], pos[1]))) {
				hadBorderChange = true;
			}
		}
		if (hadBorderChange) this.recalculateBorder();
		this.scheduledCalculations = [];
		for (const y in this.scheduledRenders) {
			if (this.scheduledRemovals.includes(parseInt(y))) continue;
			if (!this.rows[y]) {
				this.rows[y] = new Graphics();
				this.container.addChild(this.rows[y]);
			}
			const row = this.rows[y];
			row.beginFill(0x000000);
			for (const x of this.scheduledRenders[y]) {
				renderer.renderHexagon(x, parseInt(y), row);
			}
			row.endFill();
		}
		for (const y of this.scheduledRemovals) {
			const row = this.rows[y];
			row.clear();
			let used = false;
			row.beginFill(0x000000);
			for (let i = 0; i < this.pixels.length; i++) {
				if (this.pixels[i][1] === y) {
					renderer.renderHexagon(this.pixels[i][0], this.pixels[i][1], row);
					used = true;
				}
			}
			row.endFill();
			if (!used) {
				row.destroy();
				this.container.removeChild(row);
				this.rows[y] = undefined;
			}
		}
	}

	recalculateStatus(hex: OffsetCoordinate) {
		let isBorder = false;
		hex.onNeighbors((x, y) => {
			if (x < 0 || x >= gameManager.width || y < 0 || y >= gameManager.height || territoryManager.owner[y][x] !== this.id) {
				isBorder = true;
			}
		});
		if (isBorder && this.pixels.indexOf([hex.x, hex.y]) === -1) {
			this.borderPixels.push([hex.x, hex.y]);
			return true;
		} else if (!isBorder && this.pixels.indexOf([hex.x, hex.y]) !== -1) {
			this.borderPixels.splice(this.borderPixels.indexOf([hex.x, hex.y]), 1);
			return true;
		} else {
			return false;
		}
	}

	recalculateBorder() {
		this.border.clear();
		this.border.lineStyle(0.25, playerManager.players[this.id].color);
		let width = gameManager.width - 1, height = gameManager.height - 1;
		for (const pos of this.borderPixels) {
			let x = pos[0], y = pos[1];
			let ox = y % 2 === 0 ? x * 2 * 1.73205080757 : x * 2 * 1.73205080757 + 1.73205080757;
			let oy = y * 3;
			if (x === width || territoryManager.owner[y][x + 1] !== this.id) {
				this.border.moveTo(ox + Math.sqrt(3) - 0.125, oy + 1 + Math.tan(Math.PI / 6) * 0.25);
				this.border.lineTo(ox + Math.sqrt(3) - 0.125, oy - 1 - Math.tan(Math.PI / 6) * 0.25);
			}
			if (y === 0 || y % 2 === 0 ? territoryManager.owner[y - 1][x] !== this.id : (x === width || territoryManager.owner[y - 1][x + 1] !== this.id)) {
				this.border.moveTo(ox + Math.sqrt(3) + 0.0625, oy - 1 + weird_value2);
				this.border.lineTo(ox - 0.1875, oy - 2 + weird_value);
			}
			if (y === 0 || y % 2 === 1 ? territoryManager.owner[y - 1][x] !== this.id : (x === 0 || territoryManager.owner[y - 1][x - 1] !== this.id)) {
				this.border.moveTo(ox + 0.1875, oy - 2 + weird_value);
				this.border.lineTo(ox - Math.sqrt(3) - 0.0625, oy - 1 + weird_value2);
			}
			if (x === 0 || territoryManager.owner[y][x - 1] !== this.id) {
				this.border.moveTo(ox - Math.sqrt(3) + 0.125, oy - 1 - Math.tan(Math.PI / 6) * 0.25);
				this.border.lineTo(ox - Math.sqrt(3) + 0.125, oy + 1 + Math.tan(Math.PI / 6) * 0.25);
			}
			if (y === height || y % 2 === 1 ? territoryManager.owner[y + 1][x] !== this.id : (x === 0 || territoryManager.owner[y + 1][x - 1] !== this.id)) {
				this.border.moveTo(ox - Math.sqrt(3) - 0.0625, oy + 1 - weird_value2);
				this.border.lineTo(ox + 0.1875, oy + 2 - weird_value);
			}
			if (y === height || y % 2 === 0 ? territoryManager.owner[y + 1][x] !== this.id : (x === width || territoryManager.owner[y + 1][x + 1] !== this.id)) {
				this.border.moveTo(ox - 0.1875, oy + 2 - weird_value);
				this.border.lineTo(ox + Math.sqrt(3) + 0.0625, oy + 1 - weird_value2);
			}
		}
		this.border.endFill();
	}

	destroy() {
		this.container.destroy();
		this.container = undefined;
		this.background.destroy();
		this.background = undefined;
		this.border.destroy();
		this.border = undefined;
		for (const row of this.rows) {
			row.destroy();
		}
		this.rows = [];
		this.pixels = [];
		this.borderPixels = [];
		this.scheduledCalculations = [];
		this.scheduledRenders = [];
		this.scheduledRemovals = [];
	}
}