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

	add(x: number, y: number) {
		return new OffsetCoordinate(this.x + x, this.y + y);
	}

	getCenterX() {
		return (this.x * 2 + (this.y & 1)) * 1.73205080757;
	}

	getCenterY() {
		return this.y * 3;
	}
}