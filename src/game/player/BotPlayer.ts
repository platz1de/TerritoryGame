import {IPlayer} from "./IPlayer";
import {playerManager, random} from "../GameManager";
import {Texture} from "pixi.js";

export class BotPlayer implements IPlayer {
	id: number;
	color: number;
	name: string;
	backgroundTexture: Texture;

	constructor() {
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
		let country = Object.keys(playerManager.freeBotNames)[random.random_int(Object.keys(playerManager.freeBotNames).length)];
		this.name = playerManager.freeBotNames[country];
		delete playerManager.freeBotNames[country];
		//this.backgroundTexture = Texture.from(`dist/flags/${country}.webp`);
	}
}