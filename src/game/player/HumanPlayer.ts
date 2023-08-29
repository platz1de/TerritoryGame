import {IPlayer} from "./IPlayer";
import {Texture} from "pixi.js";
import {playerManager, random} from "../GameManager";

export class HumanPlayer implements IPlayer {
	id: number;
	color: number;
	name: string;
	troops: number;
	backgroundTexture: Texture;

	constructor(name: string) {
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
		this.name = name;
	}
}