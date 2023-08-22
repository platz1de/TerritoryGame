import {Application, Graphics} from "pixi.js"

export class GameRenderer {
	app: Application<HTMLCanvasElement>;

	constructor() {
		this.app = new Application<HTMLCanvasElement>({
			resizeTo: window,
			eventMode: "passive",
			eventFeatures: {
				move: true,
				globalMove: false,
				click: true,
				wheel: true,
			},
			antialias: false
		});
		document.body.appendChild(this.app.view);
	}

	renderHexMapRow(target: Graphics, data: number[], y: number) {
		for (let x = 0; x < data.length; x++) {
			target.beginFill(data[x]);
			let ox = y % 2 === 0 ? x * 2 * 1.73205080757 : x * 2 * 1.73205080757 + 1.73205080757;
			let oy = y * 3;
			target.drawPolygon([
				ox, oy + 2,
				ox + 1.73205080757, oy + 1,
				ox + 1.73205080757, oy - 1,
				ox, oy - 2,
				ox - 1.73205080757, oy - 1,
				ox - 1.73205080757, oy + 1,
			]);
			target.endFill();
		}
	}

	renderHexMaskRow(target: Graphics, data: number[], y: number) {
		for (let x = 0; x < data.length; x++) {
			if (data[x] === 0) continue;
			let ox = y % 2 === 0 ? x * 2 * 1.73205080757 : x * 2 * 1.73205080757 + 1.73205080757;
			let oy = y * 3;
			target.drawPolygon([
				ox, oy + 2,
				ox + 1.73205080757, oy + 1,
				ox + 1.73205080757, oy - 1,
				ox, oy - 2,
				ox - 1.73205080757, oy - 1,
				ox - 1.73205080757, oy + 1,
			]);
		}
	}
}