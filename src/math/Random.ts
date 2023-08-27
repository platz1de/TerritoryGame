/**
 * Moulberry32 random number generator
 */
export class Random {
	seed: number;

	init(seed: number) {
		this.seed = seed;
	}

	random() {
		let t = this.seed += 0x6D2B79F5;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	}

	/**
	 * Note: max isn't included in results
	 * @param max
	 */
	random_int(max: number) {
		return Math.floor(this.random() * max);
	}
}