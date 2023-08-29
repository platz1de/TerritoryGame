import {GameRenderer} from "./render/GameRenderer";
import {InteractionManager} from "./interaction/InteractionManager";
import {GameManager} from "./game/GameManager";
import {EventManager} from "./event/EventManager";
import {Assets} from "pixi.js";

export const renderer = new GameRenderer();
export const interactionManager = new InteractionManager();
export const eventManager = new EventManager();
export const gameManager = new GameManager();

Assets.init({manifest: "dist/assets.json"}).then(() => {
	Assets.loadBundle("game").then(() => {
		gameManager.startGameScreen()
	});
});