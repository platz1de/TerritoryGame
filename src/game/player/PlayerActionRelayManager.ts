import {playerManager, random, territoryManager} from "../GameManager";
import {OffsetCoordinate} from "../../math/OffsetCoordinate";

export class PlayerActionRelayManager {
	activeAttacks: { player: number, target: number, troops: number, totalTroops: number, cache: number[][], timed: number }[] = [];

	simpleAttack(from: number, to: number, percentage: number) {
		let troops = Math.floor(playerManager.players[from].troops * percentage);
		playerManager.players[from].troops -= troops;
		if (this.activeAttacks.some((other) => other.player === from && other.target === to)) {
			let other = this.activeAttacks.find((other) => other.player === from && other.target === to);
			other.troops += troops;
			other.totalTroops += troops;
			return;
		}
		if (this.activeAttacks.some((other) => other.player === to && other.target === from)) {
			let other = this.activeAttacks.find((other) => other.player === to && other.target === from);
			if (other.troops > troops) {
				other.troops -= troops;
				console.log("attack slowed", from, to, troops);
				return;
			}
			this.activeAttacks.splice(this.activeAttacks.indexOf(other), 1);
			troops -= other.troops;
		}
		this.activeAttacks.push({player: from, target: to, troops: troops, totalTroops: troops, cache: [], timed: 0});
	}

	tick() {
		for (let attack of this.activeAttacks) {
			attack.timed++;
			if (attack.troops < 1) {
				this.activeAttacks.splice(this.activeAttacks.indexOf(attack), 1);
				continue;
			}
			attack.troops -= Math.floor(attack.troops / 1000);
			let effectiveBorderLength = 0, effectiveBorderTiles = [];
			for (let tile of territoryManager.territory[attack.player].borderTiles) {
				new OffsetCoordinate(tile[0], tile[1]).onNeighbors((x, y) => {
					if (territoryManager.owner[y][x] === attack.target && !effectiveBorderTiles.some((other) => other[0] === x && other[1] === y)) {
						effectiveBorderLength++;
						effectiveBorderTiles.push([x, y]);
					}
				});
			}
			if (effectiveBorderLength === 0) {
				this.activeAttacks.splice(this.activeAttacks.indexOf(attack), 1);
				playerManager.players[attack.player].troops += attack.troops;
				continue;
			}
			while (attack.timed > 0) {
				let attackStrength = playerManager.players[attack.player].getAttackStrength(), defenseStrength = attack.target === -1 ? 15 : 50 + 4 * playerManager.players[attack.target].getDefenseStrength();
				if (attackStrength * attack.troops < defenseStrength) {
					this.activeAttacks.splice(this.activeAttacks.indexOf(attack), 1);
					playerManager.players[attack.player].troops += attack.troops;
					break;
				}
				let speed = Math.max(5 / effectiveBorderLength, Math.min(15, attack.target === -1 ? 30 / Math.max(10, effectiveBorderLength) : 10 * defenseStrength / (attack.totalTroops * attackStrength)));
				if (attack.timed < speed) {
					break;
				}
				let hex = getTargetHex(attack);
				if (hex === null) {
					this.activeAttacks.splice(this.activeAttacks.indexOf(attack), 1);
					playerManager.players[attack.player].troops += attack.troops;
					break;
				}
				attack.timed -= speed;
				attack.troops -= Math.floor(defenseStrength / attackStrength);
				if (attack.target !== -1) {
					playerManager.players[attack.target].troops -= Math.floor(defenseStrength / (attackStrength * 3));
				}
				territoryManager.conquer(hex[0], hex[1], attack.player);
			}
		}
	}

	destroy() {
		this.activeAttacks = [];
	}
}

function getTargetHex(attack: { player: number; target: number; cache: number[][] }) {
	if (attack.cache.length > 0) {
		let index = random.random_int(attack.cache.length);
		let tile = attack.cache[index];
		attack.cache.splice(index, 1);
		if (territoryManager.owner[tile[1]][tile[0]] !== attack.target) return getTargetHex(attack);
		let valid = false;
		new OffsetCoordinate(tile[0], tile[1]).onNeighbors((x, y) => {
			if (territoryManager.owner[y][x] === attack.player) {
				valid = true;
			}
		});
		if (!valid) return getTargetHex(attack);
		return tile;
	}

	attack.cache = [];
	for (let tile of territoryManager.territory[attack.player].borderTiles) {
		new OffsetCoordinate(tile[0], tile[1]).onNeighbors((x, y) => {
			if (territoryManager.owner[y][x] === attack.target && !attack.cache.some((other) => other[0] === x && other[1] === y)) {
				attack.cache.push([x, y]);
			}
		});
	}
	if (attack.cache.length === 0) return null;
	return getTargetHex(attack);
}