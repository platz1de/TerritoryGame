import {GameRenderer} from "./render/GameRenderer";
import {InteractionManager} from "./interaction/InteractionManager";
import {GameManager} from "./game/GameManager";
import {EventManager} from "./event/EventManager";

export const renderer = new GameRenderer();
export const interactionManager = new InteractionManager();
export const eventManager = new EventManager();
export const gameManager = new GameManager();

gameManager.startGameScreen()