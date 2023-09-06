import {gameMapRendererManager, gameTickingManager, playerActionRelayManager, playerManager, spawnManager, territoryManager} from "./GameManager";

export class GameTickingManager {
	ticker: NodeJS.Timeout;
	tickCount: number = 0;

	init() {
		for (let bot = playerManager.humanOffset; bot < playerManager.players.length; bot++) {
			spawnManager.randomSpawn(bot);
		}
		territoryManager.orderRerender();
		gameMapRendererManager.container.addChild(territoryManager.nameContainer);
	}

	enable() {
		this.tickCount = 0;
		this.ticker = setInterval(() => {
			gameTickingManager.tick();
		}, 50);
	}

	disable() {
		clearInterval(this.ticker);
	}

	tick() {
		this.tickCount++;
		for (let i = playerManager.humanOffset; i < playerManager.players.length; i++) {
			playerManager.players[i].tick();
		}
		playerActionRelayManager.tick();
		if (this.tickCount % 10 === 0) {
			for (let player of playerManager.players) {
				player.doInterestTick();
			}
		}
		territoryManager.orderRerender();
	}
}