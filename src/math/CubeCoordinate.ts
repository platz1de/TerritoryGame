import {AxialCoordinate} from "./AxialCoordinate";
import {OffsetCoordinate} from "./OffsetCoordinate";
import {gameManager} from "../main";

export class CubeCoordinate {
	q: number;
	r: number;
	s: number;

	constructor(q: number, r: number, s: number) {
		this.q = q;
		this.r = r;
		this.s = s;
	}

	/**
	 * Offset on the three axi
	 * x1: bottom left
	 * x2: right
	 * x3: top left
	 */
	offset(x1: number, x2: number, x3: number) {
		return new CubeCoordinate(this.q + x2 - x1, this.r + x1 - x3, this.s + x3 - x2);
	}

	distance(other: CubeCoordinate) {
		return (Math.abs(this.q - other.q) + Math.abs(this.r - other.r) + Math.abs(this.s - other.s)) / 2;
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

	isOnMap(): boolean {
		let x = this.q + (this.r - (this.r & 1)) / 2;
		return x >= 0 && x < gameManager.width && this.r >= 0 && this.r < gameManager.height;
	}

	toAxial() {
		return new AxialCoordinate(this.q, this.r);
	}

	toOffset() {
		return new OffsetCoordinate(this.q + (this.r - (this.r & 1)) / 2, this.r);
	}
}