export class Noise {
	cache = {};
	vectors = {};
	scale;

	constructor(scale: number) {
		this.scale = scale;
	}

	calcProd(x, y, cx, cy) {
		let v;
		let key = cx + ',' + cy;
		if (this.vectors[key]) {
			v = this.vectors[key];
		} else {
			this.vectors[key] = v = getRandVector();
		}
		return (x - cx) * v[0] + (y - cy) * v[1];
	}

	get(x, y) {
		let key = x + ',' + y;
		if (this.cache.hasOwnProperty(key)) {
			return this.cache[key];
		}
		return this.cache[key] = this.calculateValue(1.73205080757 * (2 * x + (y & 1)) * this.scale, 3 * y * this.scale);
	}

	calculateValue(x, y) {
		let xf = Math.floor(x);
		let yf = Math.floor(y);
		let xt = interpolate(x - xf, this.calcProd(x, y, xf, yf), this.calcProd(x, y, xf + 1, yf));
		let xb = interpolate(x - xf, this.calcProd(x, y, xf, yf + 1), this.calcProd(x, y, xf + 1, yf + 1));
		return interpolate(y - yf, xt, xb);
	}
}

function getRandVector() {
	let t = Math.random() * 2 * Math.PI;
	return [Math.cos(t), Math.sin(t)];
}

function interpolate(x, a, b) {
	return a + (6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3) * (b - a);
}