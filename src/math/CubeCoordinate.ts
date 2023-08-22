import {AxialCoordinate} from "./AxialCoordinate";

export class CubeCoordinate {
	q: number;
	r: number;
	s: number;

	constructor(q: number, r: number, s: number) {
		this.q = q;
		this.r = r;
		this.s = s;
	}

	round() {
		let q = Math.round(this.q), q_diff = Math.abs(q - this.q);
		let r = Math.round(this.r), r_diff = Math.abs(r - this.r);
		let s = Math.round(this.s), s_diff = Math.abs(s - this.s);

		if (q_diff > r_diff && q_diff > s_diff) {
			q = -r - s;
		} else if (r_diff > s_diff) {
			r = -q - s;
		} else {
			s = -q - r;
		}

		return new CubeCoordinate(q, r, s)
	}

	toAxial() {
		return new AxialCoordinate(this.q, this.r);
	}
}