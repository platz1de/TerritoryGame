import {BasePlayer} from "./BasePlayer";
import {playerActionRelayManager, playerManager, random, territoryManager} from "../GameManager";
import {Texture} from "pixi.js";
import {OffsetCoordinate} from "../../math/OffsetCoordinate";
import {gameManager} from "../../main";

export class BotPlayer extends BasePlayer {
	constructor() {
		super();
		let country = Object.keys(playerManager.freeBotNames)[random.random_int(Object.keys(playerManager.freeBotNames).length)];
		this.name = playerManager.freeBotNames[country];
		delete playerManager.freeBotNames[country];
		//this.backgroundTexture = Texture.from(`dist/flags/${country}.webp`);
	}

	tick() {
		if (random.random_int(200) === 0) {
			let targets = [];
			for (let hex of territoryManager.territory[this.id].borderTiles) {
				new OffsetCoordinate(hex[0], hex[1]).onNeighbors((x, y) => {
					if (gameManager.tileTypes[y][x] === 0) return;
					let owner = territoryManager.owner[y][x];
					if (owner !== this.id && !targets.includes(owner)) {
						targets.push(owner);
					}
				});
			}

			if (targets.length > 0) {
				let target = targets[random.random_int(targets.length)];
				playerActionRelayManager.simpleAttack(this.id, target, 0.4);
			}
		}
	}
}