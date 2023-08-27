import {gameManager} from "../main";
import {gameMapRendererManager, playerManager, territoryManager} from "./GameManager";
import {Container, Graphics, Matrix} from "pixi.js";
import {OffsetCoordinate} from "../math/OffsetCoordinate";
import {AxialCoordinate} from "../math/AxialCoordinate";

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
	}

	conquer(x: number, y: number, owner: number) {
		if (this.owner[y][x] !== undefined) {
			this.territory[this.owner[y][x]].removeTile(new OffsetCoordinate(x, y));
		}
		this.owner[y][x] = owner;
		this.territory[owner].addTile(new OffsetCoordinate(x, y));
	}

	orderRerender() {
		for (let i = 0; i < this.territory.length; i++) {
			this.territory[i].rerender();
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
	territory: Graphics;
	tiles: number[][] = [];
	borderTiles: number[][] = [];
	borderPath: number[][] = [];
	pathStatus: number[][] = [];
	minX: number = Infinity;
	maxX: number = -Infinity;
	minY: number = Infinity;
	maxY: number = -Infinity;

	constructor(id: number) {
		this.id = id;
		this.territory = new Graphics();
		territoryManager.container.addChild(this.territory);
	}

	addTile(hex: OffsetCoordinate) {
		this.tiles.push([hex.x, hex.y]);
		this.checkBorder(hex.x, hex.y);
		hex.onNeighbors((x, y) => {
			this.checkBorder(x, y);
		});
		this.minX = Math.min(this.minX, hex.x);
		this.maxX = Math.max(this.maxX, hex.x);
		this.minY = Math.min(this.minY, hex.y);
		this.maxY = Math.max(this.maxY, hex.y);

		let x = hex.getCenterX(), y = hex.getCenterY();
		let yOffset = 0.9375, xOffset = Math.sqrt(2.63671875), xNormal = Math.sqrt(3);
		let xOnBorder = Math.sin(Math.PI / 3) * 0.125, yOnBorder = Math.cos(Math.PI / 3) * 0.125;
		this.adjustBorderPath([
			x, y + 2 * yOffset,
			x + xOffset, y + yOffset,
			x + xOffset, y - yOffset,
			x, y - 2 * yOffset,
			x - xOffset, y - yOffset,
			x - xOffset, y + yOffset,
		], [
			x - xOnBorder, y + 2 - yOnBorder, x + xOnBorder, y + 2 - yOnBorder,
			x + xNormal - xOnBorder, y + 1 + yOnBorder, x + xNormal, y + 0.875,
			x + xNormal, y - 0.875, x + xNormal - xOnBorder, y - 1 - yOnBorder,
			x + xOnBorder, y - 2 + yOnBorder, x - xOnBorder, y - 2 + yOnBorder,
			x - xNormal + xOnBorder, y - 1 - yOnBorder, x - xNormal, y - 0.875,
			x - xNormal, y + 0.875, x - xNormal + xOnBorder, y + 1 + yOnBorder
		]);
	}

	private adjustBorderPath(corners: number[], joinedPoints = []) {
		let touches = [];
		for (let current = 0; current < this.borderPath.length; current++) {
			let path = this.borderPath[current];
			a: for (let i = 0; i < path.length; i += 2) {
				let x = path[i], y = path[i + 1];
				for (let j = 0; j < corners.length; j += 2) {
					//floating point numbers aren't fun
					if (Math.abs(x - corners[j]) + Math.abs(y - corners[j + 1]) < 0.51) {
						touches.push([current, i / 2, j / 2]);
						continue a;
					}
				}
			}
		}

		//New path
		if (touches.length === 0) {
			this.borderPath.push(corners);
			this.registerNewPath(this.borderPath.length - 1);
			return;
		}

		touches.sort((a, b) => a[2] - b[2]);
		let edges: number[][] = [];
		for (let i = 0; i < touches.length; i++) {
			let b = touches[i];
			let index = touches.findIndex((a) => a[0] === b[0] && (a[2] === b[2] + 1 || (a[2] === 0 && b[2] === 5)) && (b[1] === a[1] + 1 || b[1] === 0 && a[1] === (this.borderPath[a[0]].length / 2) - 1));
			if (index !== -1) {
				corners[2 * touches[index][2]] = joinedPoints[4 * touches[index][2]];
				corners[2 * touches[index][2] + 1] = joinedPoints[4 * touches[index][2] + 1];
				corners[2 * touches[i][2]] = joinedPoints[4 * touches[i][2] + 2];
				corners[2 * touches[i][2] + 1] = joinedPoints[4 * touches[i][2] + 3];
				edges.push([i, index]);
			}
		}
		let changed = true;
		while (changed) {
			changed = false;
			for (let i = 0; i < edges.length; i++) {
				for (let j = 0; j < edges.length; j++) {
					if (i === j || !edges[i] || !edges[j]) continue;
					if (edges[j][0] === edges[i][edges[i].length - 1]) {
						for (let k = 1; k < edges[j].length; k++) {
							edges[i].push(edges[j][k]);
						}
						changed = true;
						edges.splice(j, 1);
					}
				}
			}
		}

		if (edges.length === 1) {
			let edge = edges[0];
			if (edge.length === 7) {
				this.dropPath(touches[edge[0]][0]);
				return;
			}
			overSplice(this.borderPath[touches[edge[0]][0]], 2 * touches[edge[edge.length - 1]][1], 2 * edge.length, ...overSlice(corners, 2 * touches[edge[edge.length - 1]][2], 2 * touches[edge[0]][2] + 2));
		} else {
			let connections = [];
			let start = undefined;
			for (let edge of edges) {
				if (start !== undefined) {
					connections.push([start[0], start[1], touches[edge[0]][0], touches[edge[0]][1], overRange(start[2], touches[edge[0]][2], 6), start[2], touches[edge[0]][2]])
				}
				start = touches[edge[edge.length - 1]];
			}
			connections.push([start[0], start[1], touches[edges[0][0]][0], touches[edges[0][0]][1], overRange(start[2], touches[edges[0][0]][2], 6), start[2], touches[edges[0][0]][2]]);

			let affectedPaths = [], addedPaths = [];
			let connectData = [], nextConnect = undefined;
			for (let connection of connections) {
				if (!affectedPaths.includes(connection[0])) affectedPaths.push(connection[0]);
				if (!affectedPaths.includes(connection[2])) affectedPaths.push(connection[2]);

				if (connection[0] === connection[2]) {
					//Creates a new path (o-shaped territory)
					let path = overSlice(this.borderPath[connection[0]], 2 * connection[3] + 2, 2 * connection[1]);
					for (let i of connection[4]) {
						path.push(corners[2 * i]);
						path.push(corners[2 * i + 1]);
					}
					this.borderPath.push(path);
					addedPaths.push(this.borderPath.length - 1);
				} else {
					//Connects two different paths into one
					connectData[connection[0]] = connection;
					nextConnect = [connection[2], connection[3]];
				}
			}
			if (nextConnect !== undefined) {
				let path = [];
				while (connectData[nextConnect[0]] !== undefined) {
					let d = connectData[nextConnect[0]];
					connectData[nextConnect[0]] = undefined;
					path.push(...overSlice(this.borderPath[d[0]], 2 * nextConnect[1] + 2, 2 * d[1]));
					for (let i of d[4]) {
						path.push(corners[2 * i]);
						path.push(corners[2 * i + 1]);
					}
					nextConnect = [d[2], d[3]];
				}
				this.borderPath.push(path);
				addedPaths.push(this.borderPath.length - 1)
			}
			affectedPaths.sort((a, b) => b - a);
			for (const affectedPath of affectedPaths) {
				this.dropPath(affectedPath);
			}
			for (const added of addedPaths) {
				this.registerNewPath(added - affectedPaths.length);
			}
		}
	}

	private dropPath(id: number) {
		this.borderPath[id] = [];
		let i = this.pathStatus.findIndex((a) => a.includes(id)), index = this.pathStatus[i].indexOf(id);
		if (index === 0) {
			let status = this.pathStatus[i];
			this.pathStatus.splice(i, 1);
			for (let j = 1; j < status.length; j++) {
				this.registerNewPath(status[j]);
			}
		} else {
			this.pathStatus[i].splice(index, 1);
		}
		for (let i = 0; i < this.pathStatus.length; i++) {
			for (let j = 0; j < this.pathStatus[i].length; j++) {
				if (this.pathStatus[i][j] > id) {
					this.pathStatus[i][j]--;
				}
			}
		}
		this.borderPath.splice(id, 1);
	}

	private registerNewPath(id: number) {
		let hex = new AxialCoordinate((Math.sqrt(3) / 3 * this.borderPath[id][0] - 1 / 3 * this.borderPath[id][1]) / 2, this.borderPath[id][1] / 3).round().toOffset();
		let x = hex.getCenterX(), y = hex.getCenterY();
		let top = [];
		for (let i = 0; i < this.borderPath.length; i++) {
			if (i === id) continue;
			let path = this.borderPath[i], found = [];
			for (let j = 0; j < path.length; j += 2) {
				if (Math.abs(path[j] - x) < 0.51 && path[j + 1] > y) {
					let yRounded = Math.round(path[j + 1]);
					if (Math.abs(path[j] - x) < 0.01 || (yRounded % 3 === 2 ? path[j + 1] < yRounded : path[j + 1] > yRounded)) {
						found.push(path[j + 1]);
					}
				}
			}
			if (found.length % 2 === 0) {
				//Not a parent
			} else {
				top.push([i, found.sort((a, b) => a - b)[0]]);
			}
		}
		if (top.length % 2 === 0) {
			if (!this.pathStatus.some((a) => a[0] === id)) {
				this.pathStatus.push([id]);
			}
		} else {
			top.sort((a, b) => a[1] - b[1]);
			let parent = top[0][0], index = this.pathStatus.findIndex((a) => a[0] === parent);
			if (index === -1) {
				this.pathStatus.push([parent, id]);
			} else {
				this.pathStatus[index].push(id);
			}
		}
	}

	removeTile(hex: OffsetCoordinate) {
		this.tiles.splice(this.tiles.findIndex((e) => e[0] === hex.x && e[1] === hex.y), 1);
		if (this.borderTiles.some((e) => e[0] === hex.x && e[1] === hex.y)) {
			this.borderTiles.splice(this.borderTiles.findIndex((e) => e[0] === hex.x && e[1] === hex.y), 1);
		}
		hex.onNeighbors((x, y) => {
			this.checkBorder(x, y);
		});
		if (hex.x === this.minX) {
			this.minX = Infinity;
			for (let tile of this.tiles) {
				this.minX = Math.min(this.minX, tile[0]);
			}
		}
		if (hex.x === this.maxX) {
			this.maxX = -Infinity;
			for (let tile of this.tiles) {
				this.maxX = Math.max(this.maxX, tile[0]);
			}
		}
		if (hex.y === this.minY) {
			this.minY = Infinity;
			for (let tile of this.tiles) {
				this.minY = Math.min(this.minY, tile[1]);
			}
		}
		if (hex.y === this.maxY) {
			this.maxY = -Infinity;
			for (let tile of this.tiles) {
				this.maxY = Math.max(this.maxY, tile[1]);
			}
		}

		let x = hex.getCenterX(), y = hex.getCenterY();
		let yOffset = 1.0625, xOffset = Math.sqrt(3.38671875), xNormal = Math.sqrt(3);
		let xOnBorder = Math.sin(Math.PI / 3) * 0.125, yOnBorder = Math.cos(Math.PI / 3) * 0.125;
		this.adjustBorderPath([
			x - xOffset, y + yOffset,
			x - xOffset, y - yOffset,
			x, y - 2 * yOffset,
			x + xOffset, y - yOffset,
			x + xOffset, y + yOffset,
			x, y + 2 * yOffset,
		], [
			x - xNormal - xOnBorder, y + 1 - yOnBorder, x - xNormal, y + 1.125,
			x - xNormal, y - 1.125, x - xNormal - xOnBorder, y - 1 + yOnBorder,
			x + xOnBorder, y - 2 - yOnBorder, x - xOnBorder, y - 2 - yOnBorder,
			x + xNormal + xOnBorder, y - 1 + yOnBorder, x + xNormal, y - 1.125,
			x + xNormal, y + 1.125, x + xNormal + xOnBorder, y + 1 - yOnBorder,
			x - xOnBorder, y + 2 + yOnBorder, x + xOnBorder, y + 2 + yOnBorder
		]);

		if (this.borderPath.length === 0) {
			this.territory.clear();
		}
	}

	checkBorder(x: number, y: number) {
		if (territoryManager.owner[y][x] !== this.id) return;
		let isBorder = false, current = this.borderTiles.findIndex((e) => e[0] === x && e[1] === y);
		for (let pos of y % 2 === 0 ?
			[[x + 1, y], [x, y - 1], [x - 1, y - 1], [x - 1, y], [x - 1, y + 1], [x, y + 1]] :
			[[x + 1, y], [x + 1, y - 1], [x, y - 1], [x - 1, y], [x, y + 1], [x + 1, y + 1]]) {
			if (pos[0] < 0 || pos[0] >= gameManager.width || pos[1] < 0 || pos[1] >= gameManager.height || gameManager.tileTypes[y][x] === 0) {
				//This technically is a border, but isn't required for any of the border calculations
				continue;
			}
			if (territoryManager.owner[pos[1]][pos[0]] !== this.id) {
				isBorder = true;
				break;
			}
		}
		if (isBorder && current === -1) {
			this.borderTiles.push([x, y]);
		} else if (!isBorder && current !== -1) {
			this.borderTiles.splice(current, 1);
		}
	}

	rerender() {
		if (this.borderPath.length === 0) return;
		this.territory.clear();
		//let texture = playerManager.players[this.id].backgroundTexture, scaleW = (this.maxX - this.minX + 1) / texture.width * Math.sqrt(3) * 2, scaleH = (this.maxY - this.minY + 1) / texture.height * 3;
		//let xOffset = 0, yOffset = 0, scale = 1;
		//if (scaleW > scaleH) {
		//	scale = scaleW;
		//	yOffset = (scaleW - scaleH) * texture.height / 2;
		//} else {
		//	scale = scaleH;
		//	xOffset = (scale - scaleW) * texture.width / 2;
		//}
		//this.territory.beginTextureFill({texture: texture, matrix: new Matrix(scale, 0, 0, scale, (this.minX * 2 + (this.minY & 1) - 1) * Math.sqrt(3) - xOffset, this.minY * 3 - 2 - yOffset)});
		this.territory.beginFill(playerManager.players[this.id].color, 0.5);
		this.territory.lineStyle(0.25, playerManager.players[this.id].color);
		for (let i = 0; i < this.pathStatus.length; i++) {
			this.territory.drawPolygon(this.borderPath[this.pathStatus[i][0]]);
			for (let j = 1; j < this.pathStatus[i].length; j++) {
				this.territory.beginHole();
				this.territory.drawPolygon(this.borderPath[this.pathStatus[i][j]]);
				this.territory.endHole();
			}
		}
		this.territory.endFill();
	}

	destroy() {
		this.territory.destroy();
		this.territory = undefined;
	}
}

function overSplice(a: any[], start: number, deleteCount: number, ...insert: any[]) {
	start %= a.length;
	let fromStart = start + deleteCount - a.length;
	a.splice(start, deleteCount, ...insert);
	fromStart > 0 && a.splice(0, fromStart);
}

function overSlice(a: any[], start: number, end: number) {
	start %= a.length;
	end %= a.length;
	if (start < end) return a.slice(start, end);
	let ret = a.slice(start);
	ret.push(...a.slice(0, end))
	return ret;
}

function overRange(start: number, end: number, length: number) {
	start %= length;
	end %= length;
	let ret = [];
	if (end > start) {
		for (let i = start; i <= end; i++) {
			ret.push(i);
		}
	} else {
		for (let i = start; i < length; i++) {
			ret.push(i);
		}
		for (let i = 0; i <= end; i++) {
			ret.push(i);
		}
	}
	return ret;
}