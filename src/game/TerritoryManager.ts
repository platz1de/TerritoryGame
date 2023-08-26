import {gameManager} from "../main";
import {gameMapRendererManager, playerManager, territoryManager} from "./GameManager";
import {Container, Graphics} from "pixi.js";
import {OffsetCoordinate} from "../math/OffsetCoordinate";

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

		this.conquer(118, 121, 0)
		this.conquer(118, 119, 0)
		this.conquer(118, 120, 0)
		this.conquer(120, 122, 0)
		this.conquer(120, 118, 0)
		this.conquer(121, 118, 0)
		this.conquer(121, 122, 0)
		this.conquer(121, 121, 0)
		this.conquer(122, 120, 0)
		this.conquer(121, 119, 0)
		this.conquer(120, 121, 0)
		this.conquer(120, 119, 0)
		this.conquer(119, 120, 0)
		this.conquer(120, 120, 0)

		this.conquer(119, 121, 0)
		this.conquer(119, 121, 1)

		this.conquer(120, 120, 1)
		this.orderRerender();
	}

	conquer(x: number, y: number, owner: number) {
		let target = this.territory[owner];
		if (this.owner[y][x] !== undefined) {
			this.territory[this.owner[y][x]].removeTile(new OffsetCoordinate(x, y));
		}
		this.owner[y][x] = owner;
		target.addTile(new OffsetCoordinate(x, y));
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
		], false);
	}

	private adjustBorderPath(corners: number[], joinedPoints = [], isRemoval) {
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
		a: for (let i = 0; i < touches.length; i++) {
			let b = touches[i];
			let index = touches.findIndex((a) => a[0] === b[0] && (a[2] === b[2] + 1 || (a[2] === 0 && b[2] === 5)) && (b[1] === a[1] + 1 || b[1] === 0 && a[1] === (this.borderPath[a[0]].length / 2) - 1));
			if (index !== -1) {
				corners[2 * touches[index][2]] = joinedPoints[4 * touches[index][2]];
				corners[2 * touches[index][2] + 1] = joinedPoints[4 * touches[index][2] + 1];
				corners[2 * touches[i][2]] = joinedPoints[4 * touches[i][2] + 2];
				corners[2 * touches[i][2] + 1] = joinedPoints[4 * touches[i][2] + 3];
				for (let j = 0; j < edges.length; j++) {
					if (edges[j][0] === index) {
						edges[j].unshift(i);
						continue a;
					}
					if (edges[j][edges[j].length - 1] === i) {
						edges[j].push(index);
						continue a;
					}
				}
				edges.push([i, index]);
			}
		}

		if (edges.length === 1) {
			let edge = edges[0];
			if (edge.length === 7) {
				this.borderPath.splice(touches[edge[0]][0], 1);
				if (isRemoval) {
					this.pathStatus.splice(this.pathStatus.findIndex((a) => a.includes(touches[edge[0]][0])), 1);
				} else {
					let index = this.pathStatus.findIndex((a) => a.includes(touches[edge[0]][0]));
					this.pathStatus[index].splice(this.pathStatus[index].indexOf(touches[edge[0]][0]), 1);
				}
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
				console.log(...this.pathStatus, this.pathWaiting)
				this.borderPath.splice(affectedPath, 1);
				let i = this.pathStatus.findIndex((a) => a.includes(affectedPath));

				if (i !== -1) {
					let index = this.pathStatus[i].indexOf(affectedPath);
					if (index === 0) {
						for (let j = 1; j < this.pathStatus[i].length; j++) {
							this.registerNewPath(this.pathStatus[i][j]);
						}
						this.pathStatus.splice(i, 1);
					} else {
						this.pathStatus[i].splice(index, 1);
					}
				} else {
					for (const elem of this.pathWaiting) {
						if (elem.findIndex(affectedPath) !== -1) {
							elem.splice(elem.findIndex(affectedPath), 1);
						}
					}
				}
				for (const status of this.pathStatus) {
					status.map((i) => i >= affectedPath ? i - 1 : i);
				}
			}
			for (const added of addedPaths) {
				this.registerNewPath(added - affectedPaths.length);
			}
		}
	}

	pathWaiting: number[][] = [];

	private registerNewPath(id: number) {
		let x = this.borderPath[id][0], y = this.borderPath[id][1];
		let top = [];
		for (let i = 0; i < this.borderPath.length; i++) {
			if (i === id) continue;
			let path = this.borderPath[i], found = [];
			for (let j = 0; j < path.length; j += 2) {
				if (Math.abs(path[j] - x) < 0.51 && path[j + 1] > y) {
					found.push(path[j + 1]);
				}
			}
			if (found.length % 2 === 0) {
				//Not a parent
			} else {
				top.push([i, found.sort((a, b) => a - b)[0]]);
			}
		}
		top.sort((a, b) => a[1] - b[1]);
		console.log(top);
		if (top.length % 2 === 0) {
			if (this.pathWaiting[id]) {
				this.pathStatus.push([id, ...this.pathWaiting[id]]);
				delete this.pathWaiting[id];
			} else {
				this.pathStatus.push([id]);
			}
		} else {
			let parent = top[0][0], index = this.pathStatus.findIndex((a) => a[0] === parent);
			if (index === -1) {
				if (!this.pathWaiting[parent]) this.pathWaiting[parent] = [];
				this.pathWaiting[parent].push(id);
			} else {
				this.pathStatus[index].push(id);
			}
		}
	}

	removeTile(hex: OffsetCoordinate) {
		this.tiles.splice(this.tiles.indexOf([hex.x, hex.y]), 1);
		if (this.borderTiles.indexOf([hex.x, hex.y]) !== -1) {
			this.borderTiles.splice(this.borderTiles.indexOf([hex.x, hex.y]), 1);
		}
		hex.onNeighbors((x, y) => {
			this.checkBorder(x, y);
		});

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
		], false);
	}

	checkBorder(x: number, y: number) {
		if (territoryManager.owner[y][x] !== this.id) return;
		let isBorder = false, current = this.borderTiles.indexOf([x, y]);
		for (let pos of y % 2 === 0 ?
			[[x + 1, y], [x, y - 1], [x - 1, y - 1], [x - 1, y], [x - 1, y + 1], [x, y + 1]] :
			[[x + 1, y], [x + 1, y - 1], [x, y - 1], [x - 1, y], [x, y + 1], [x + 1, y + 1]]) {
			if (pos[0] < 0 || pos[0] >= gameManager.width || pos[1] < 0 || pos[1] >= gameManager.height) {
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
		console.log(this.borderPath, this.pathStatus)
		this.territory.clear();
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