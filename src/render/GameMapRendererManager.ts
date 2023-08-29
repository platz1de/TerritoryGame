import {Container, Graphics} from "pixi.js";
import {renderer} from "../main";
import {applyCoastShader} from "./shader/CoastShader";
import {getDistances} from "./shader/DistanceCalculator";
import {applyTerrainShader} from "./shader/TerrainShader";

export class GameMapRendererManager {
	container: Container;
	rows: Graphics[] = [];
	terrainMask: Graphics;
	containerWidth: number;
	containerHeight: number;

	loadMap(data: number[][]) {
		this.container = new Container();
		renderer.app.stage.addChild(this.container);

		let depth = getDistances(data);
		let shader = data.map(row => row.map(() => 0x000000));
		let maskList = data.map(row => row.map(() => 0));
		applyCoastShader(data, depth, shader);
		applyTerrainShader(data, depth, shader, maskList);

		this.terrainMask = new Graphics();
		this.terrainMask.beginFill(0xffffff);
		for (let y = 0; y < data.length; y++) {
			this.rows[y] = new Graphics();
			renderer.renderHexMapRow(this.rows[y], shader[y], y);
			this.container.addChild(this.rows[y]);
			renderer.renderHexMaskRow(this.terrainMask, maskList[y], y);
		}
		this.terrainMask.endFill();
		this.container.addChild(this.terrainMask);
		this.containerWidth = this.terrainMask.width;
		this.containerHeight = this.terrainMask.height;
	}

	destroy() {
		renderer.app.stage.removeChild(this.container);
		this.container.destroy();
		for (let row of this.rows) {
			row.destroy();
		}
		this.rows = [];
	}
}