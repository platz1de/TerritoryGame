import {Texture} from "pixi.js";

export interface IPlayer {
	id: number;
	name: string;
	color: number;
	backgroundTexture: Texture;
}