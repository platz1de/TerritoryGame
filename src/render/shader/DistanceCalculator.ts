export function getDistances(data: number[][]) {
	let map = data.map(row => row.map(() => undefined));
	let width = data[0].length, height = data.length;

	let queue = [];
	let depth = [];
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			let type = data[y][x];
			if (y % 2 === 0) {
				if ((x === width - 1 || data[y][x + 1] === type) && (y === 0 || data[y - 1][x] === type) && (y === 0 || x === 0 || data[y - 1][x - 1] === type) && (x === 0 || data[y][x - 1] === type) && (y === height - 1 || x === 0 || data[y + 1][x - 1] === type) && (y === height - 1 || data[y + 1][x] === type)) {
					continue;
				}
			} else {
				if ((x === width - 1 || data[y][x + 1] === type) && (y === 0 || x === width - 1 || data[y - 1][x + 1] === type) && (y === 0 || data[y - 1][x] === type) && (x === 0 || data[y][x - 1] === type) && (y === height - 1 || data[y + 1][x] === type) && (y === height - 1 || x === width - 1 || data[y + 1][x + 1] === type)) {
					continue;
				}
			}
			queue.push([x, y]);
			depth.push(0);
		}
	}

	while (queue.length > 0) {
		let [x, y] = queue.shift();
		let d = depth.shift();
		map[y][x] = d;
		for (let coords of y % 2 === 0 ?
			[[x + 1, y], [x, y - 1], [x - 1, y - 1], [x - 1, y], [x - 1, y + 1], [x, y + 1]] :
			[[x + 1, y], [x + 1, y - 1], [x, y - 1], [x - 1, y], [x, y + 1], [x + 1, y + 1]]) {
			let [x2, y2] = coords;
			if (x2 < 0 || x2 >= width || y2 < 0 || y2 >= height) {
				continue;
			}
			if (map[y2][x2] !== undefined || queue.some(([x3, y3]) => x3 === x2 && y3 === y2)) {
				continue;
			}
			queue.push(coords);
			depth.push(d + 1);
		}
	}
	return map;
}