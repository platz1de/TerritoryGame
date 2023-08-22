import {Noise} from "./NoiseGenerator";

let waveNoise = new Noise(0.02);

export function applyCoastShader(data: number[][], depth: number[][], shader: number[][]) {
	let width = data[0].length, height = data.length;
	for (let y = 0; y < height; y++) {
		let row = data[y];
		for (let x = 0; x < width; x++) {
			if (row[x] !== 0) {
				continue;
			}

			let n = Math.max(0, Math.floor(45 / (0.5 * depth[y][x] + 1) - 3)) + Math.floor(Math.min(waveNoise.get(x, y) * 30 + 30, 47));
			shader[y][x] = n << 16 | n << 8 | 0xff;
		}
	}
}