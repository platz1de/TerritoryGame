import {GameRenderer} from "./render/GameRenderer";
import {InteractionManager} from "./interaction/InteractionManager";
import {GameManager} from "./game/GameManager";

export const renderer = new GameRenderer();
export const interactionManager = new InteractionManager();
export const gameManager = new GameManager();

gameManager.startGameScreen()