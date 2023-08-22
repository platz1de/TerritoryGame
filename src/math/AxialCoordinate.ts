import {CubeCoordinate} from "./CubeCoordinate";
import {OffsetCoordinate} from "./OffsetCoordinate";

export class AxialCoordinate {
	q: number;
	r: number;

	constructor(q, r) {
		this.q = q;
		this.r = r;
	}

	round() {
		return this.toCube().round().toAxial();
	}

	toCube() {
		return new CubeCoordinate(this.q, this.r, -this.q - this.r);
	}

	toOffset() {
		return new OffsetCoordinate(this.q + (this.r - (this.r & 1)) / 2, this.r);
	}
}