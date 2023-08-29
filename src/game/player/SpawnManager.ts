import {OffsetCoordinate} from "../../math/OffsetCoordinate";
import {random, territoryManager} from "../GameManager";
import {gameManager} from "../../main";
import {CubeCoordinate} from "../../math/CubeCoordinate";

export class SpawnManager {
	botSpawns: CubeCoordinate[];
	selectedData: { blocked: CubeCoordinate[], claimed: OffsetCoordinate[] }[];

	init() {
		let initial = new OffsetCoordinate(random.random_int(gameManager.width), random.random_int(gameManager.height)).toCube();
		let openNodes = [initial];
		let nodes = [initial];

		while (openNodes.length > 0) {
			let current = openNodes.shift();
			for (let offset of [
				[3 + random.random_int(3), 1 - random.random_int(3), 1 - random.random_int(3)],
				[-3 - random.random_int(3), 1 - random.random_int(3), 1 - random.random_int(3)],
				[1 - random.random_int(3), 3 + random.random_int(3), 1 - random.random_int(3)],
				[1 - random.random_int(3), -3 - random.random_int(3), 1 - random.random_int(3)],
				[1 - random.random_int(3), 1 - random.random_int(3), 3 + random.random_int(3)],
				[1 - random.random_int(3), 1 - random.random_int(3), -3 - random.random_int(3)]
			]) {
				let a = current.offset(offset[0], offset[1], offset[2]);
				if (a.isOnMap() && nodes.some((other) => a.distance(other) < 3) === false) {
					openNodes.push(a);
					nodes.push(a);
				}
			}
		}

		this.botSpawns = [];
		for (const node of nodes) {
			let hex = node.toOffset();
			if (gameManager.tileTypes[hex.y][hex.x] !== 0 && hex.x !== 0 && hex.y !== 0 && hex.x !== gameManager.width - 1 && hex.y !== gameManager.height - 1) {
				this.botSpawns.push(node);
			}
		}

		this.selectedData = [];
	}

	randomSpawn(player: number) {
		let index = random.random_int(this.botSpawns.length);
		let spawn = this.botSpawns[index].toOffset();
		this.botSpawns.splice(index, 1);
		territoryManager.conquer(spawn.x, spawn.y, player);
		spawn.onNeighbors((x, y) => {
			if (x >= 0 && y >= 0 && x < gameManager.width && y < gameManager.height && gameManager.tileTypes[y][x] !== 0 && territoryManager.owner[y][x] === undefined) {
				territoryManager.conquer(x, y, player);
			}
		});
		return spawn;
	}

	selectSpawn(player: number, x: number, y: number) {
		if (territoryManager.owner[y][x] !== undefined) return;
		if (this.selectedData[player]) {
			for (let blocked of this.selectedData[player].blocked) {
				this.botSpawns.push(blocked);
			}
			for (let claimed of this.selectedData[player].claimed) {
				territoryManager.free(claimed.x, claimed.y);
			}
		}
		let hex = new OffsetCoordinate(x, y), cube = hex.toCube();
		let blocked = this.botSpawns.filter((spawn) => spawn.distance(cube) < 3);
		for (let block of blocked) {
			this.botSpawns.splice(this.botSpawns.indexOf(block), 1);
		}
		territoryManager.conquer(x, y, player);
		let claimed = [hex];
		hex.onNeighbors((x, y) => {
			if (x >= 0 && y >= 0 && x < gameManager.width && y < gameManager.height && gameManager.tileTypes[y][x] !== 0 && territoryManager.owner[y][x] === undefined) {
				territoryManager.conquer(x, y, player);
				claimed.push(new OffsetCoordinate(x, y));
			}
		});
		this.selectedData[player] = {blocked, claimed};
	}
}