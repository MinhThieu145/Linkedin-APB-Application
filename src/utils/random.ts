// Seedable random number generator (Mulberry32)
export class SeededRandom {
  private seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  // Generate a random number between 0 and 1
  random(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Generate random number in range [min, max)
  uniform(min: number = 0, max: number = 1): number {
    return min + (max - min) * this.random();
  }

  // Box-Muller transform for Gaussian distribution
  gaussian(mean: number = 0, std: number = 1): number {
    if (this.hasSpare) {
      this.hasSpare = false;
      return this.spare * std + mean;
    }

    this.hasSpare = true;
    const u = this.random();
    const v = this.random();
    const mag = std * Math.sqrt(-2 * Math.log(u));
    this.spare = mag * Math.cos(2 * Math.PI * v);
    return mag * Math.sin(2 * Math.PI * v) + mean;
  }

  private hasSpare: boolean = false;
  private spare: number = 0;

  // Reset seed
  setSeed(seed: number): void {
    this.seed = seed;
    this.hasSpare = false;
  }
}
