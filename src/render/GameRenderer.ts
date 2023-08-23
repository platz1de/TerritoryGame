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
			antialias: true,
			backgroundColor: 0x555555
		});
		document.body.appendChild(this.app.view);
	}

	renderHexMapRow(target: Graphics, data: number[], y: number) {
		for (let x = 0; x < data.length; x++) {
			target.beginFill(data[x]);
			this.renderHexagon(x, y, target)
			target.endFill();
		}
	}

	renderHexMaskRow(target: Graphics, data: number[], y: number) {
		for (let x = 0; x < data.length; x++) {
			if (data[x] !== 0) this.renderHexagon(x, y, target)
		}
	}

	renderHexagon(x: number, y: number, target: Graphics) {
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