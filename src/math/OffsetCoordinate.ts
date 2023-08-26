import {AxialCoordinate} from "./AxialCoordinate";
import {CubeCoordinate} from "./CubeCoordinate";
import {gameManager} from "../main";

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

	toCube() {
		let q = this.x - (this.y - (this.y & 1)) / 2;
		return new CubeCoordinate(q, this.y, -q - this.y);
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

	onNeighbors(callback: (x: number, y: number) => void) {
		let x = this.x, y = this.y;
		for (let pos of y % 2 === 0 ?
			[[x + 1, y], [x, y - 1], [x - 1, y - 1], [x - 1, y], [x - 1, y + 1], [x, y + 1]] :
			[[x + 1, y], [x + 1, y - 1], [x, y - 1], [x - 1, y], [x, y + 1], [x + 1, y + 1]]) {
			if (pos[0] >= 0 && pos[0] < gameManager.width && pos[1] >= 0 && pos[1] < gameManager.height) {
				callback(pos[0], pos[1]);
			}
		}
	}
}