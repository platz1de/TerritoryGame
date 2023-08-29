import {gameMapRendererManager, gameTickingManager, playerManager, spawnManager, territoryManager} from "./GameManager";

export class GameTickingManager {
	ticker: NodeJS.Timeout;

	enable() {
		this.ticker = setInterval(() => {
			gameTickingManager.tick();
		}, 500);

		for (let bot = playerManager.humanOffset; bot < playerManager.players.length; bot++) {
			spawnManager.randomSpawn(bot);
		}
		territoryManager.orderRerender();
		gameMapRendererManager.container.addChild(territoryManager.nameContainer);
	}

	disable() {
		clearInterval(this.ticker);
	}

	tick() {

	}
}