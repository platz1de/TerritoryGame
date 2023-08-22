import {Container, Graphics} from "pixi.js";
import {renderer} from "../main";
import {applyCoastShader} from "./shader/CoastShader";
import {getDistances} from "./shader/DistanceCalculator";
import {applyTerrainShader} from "./shader/TerrainShader";

export class GameMapRendererManager {
	container: Container;
	rows: Graphics[] = [];

	loadMap(data: number[][]) {
		this.container = new Container();
		renderer.app.stage.addChild(this.container);

		let depth = getDistances(data);
		let shader = data.map(row => row.map(() => 0x000000));
		applyCoastShader(data, depth, shader);
		applyTerrainShader(data, depth, shader);

		for (let y = 0; y < data.length; y++) {
			this.rows[y] = new Graphics();
			renderer.renderHexMapRow(this.rows[y], shader[y], y);
			this.container.addChild(this.rows[y]);
		}
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