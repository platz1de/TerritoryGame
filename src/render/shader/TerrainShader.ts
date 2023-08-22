import {Noise} from "./NoiseGenerator";

let terrainNoise = new Noise(0.0085);

export function applyTerrainShader(data: number[][], depth: number[][], shader: number[][], maskList: number[][]) {
	let width = data[0].length, height = data.length;
	for (let y = 0; y < height; y++) {
		let row = data[y];
		for (let x = 0; x < width; x++) {
			if (row[x] === 0) {
				continue;
			}

			let coastColor = Math.max(0, Math.floor(20 / (depth[y][x] + 1) - 3));
			let noise = Math.floor(Math.min(terrainNoise.get(x, y) * 90 + 60, 127));

			let r = coastColor, g = 96 + 32 * Math.random() + coastColor, b = 0;
			if (noise > 0) {
				g += noise;
			} else {
				r -= noise;
				b -= noise;
			}
			r = Math.max(0, Math.min(255, r));
			g = Math.max(0, Math.min(255, g));
			b = Math.max(0, Math.min(255, b));
			shader[y][x] = r << 16 | g << 8 | b;
			maskList[y][x] = 1;
		}
	}
}