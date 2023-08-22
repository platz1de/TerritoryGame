import {AxialCoordinate} from "./AxialCoordinate";

export class OffsetCoordinate {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	toAxial() {
		return new AxialCoordinate(this.x - (this.y - (this.y & 1)) / 2, this.y)
	}
}