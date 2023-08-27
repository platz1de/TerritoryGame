import {OffsetCoordinate} from "../../math/OffsetCoordinate";
import {random, territoryManager} from "../GameManager";
import {gameManager} from "../../main";
import {IPlayer} from "./IPlayer";

export class SpawnManager {
	botSpawns: OffsetCoordinate[];

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
				this.botSpawns.push(hex);
			}
		}
	}

	randomSpawn(player: IPlayer) {
		let index = random.random_int(this.botSpawns.length);
		let spawn = this.botSpawns[index];
		this.botSpawns.splice(index, 1);
		territoryManager.conquer(spawn.x, spawn.y, player.id);
		return spawn;
	}
}