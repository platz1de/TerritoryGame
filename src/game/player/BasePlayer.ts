import {Texture} from "pixi.js";
import {playerManager, random, territoryManager} from "../GameManager";

export abstract class BasePlayer {
	id: number;
	name: string;
	color: number;
	troops: number;
	backgroundTexture: Texture;

	protected constructor() {
		this.id = playerManager.id++;
		let r = random.random_int(128), g = random.random_int(128), b = random.random_int(128);
		if (g > 64 && b < 64 && r < 64) {
			r += 64;
			g -= 64;
			b += 64;
		}
		let brightness = 64 + random.random_int(64);
		r += brightness;
		g += brightness;
		b += brightness;
		this.color = r << 16 | g << 8 | b;
		this.troops = 1000;
	}

	doInterestTick() {
		this.troops = Math.min(Math.floor(this.troops * 1.014 + territoryManager.territory[this.id].tiles.length), territoryManager.territory[this.id].tiles.length * 500);
	}

	getDensity() {
		return this.troops / territoryManager.territory[this.id].tiles.length;
	}

	getAttackStrength() {
		return 0.5 + this.getDensity() / 1000;
	}

	getDefenseStrength() {
		return this.getDensity();
	}

	tick() {
		throw new Error("Not implemented");
	}
}