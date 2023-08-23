export class PlayerManager {
	players: Player[] = [];

	constructor() {
		this.players.push(new Player("Player 1", 0xFF0000));
	}

	destroy() {
		this.players = [];
	}
}

export class Player {
	name: string;
	color: number;

	constructor(name: string, color: number) {
		this.name = name;
		this.color = color;
	}
}