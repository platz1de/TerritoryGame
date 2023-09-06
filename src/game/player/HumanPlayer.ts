import {BasePlayer} from "./BasePlayer";

export class HumanPlayer extends BasePlayer {
	constructor(name: string) {
		super();
		this.name = name;
	}
}