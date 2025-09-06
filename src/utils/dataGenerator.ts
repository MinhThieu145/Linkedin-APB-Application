import { SeededRandom } from './random';

export interface DataPoint {
  x: number;
  y: number;
  label: number;
}

export interface Dataset {
  points: DataPoint[];
  bounds: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  };
}

export interface GeneratorConfig {
  distribution: 'blobs' | 'moons';
  n: number;
  balance: number; // 0.1 to 0.9 (proportion of class 1)
  noise: number; // sigma for blobs, noise for moons
  seed: number;
}

export function generateData(config: GeneratorConfig): Dataset {
  const rng = new SeededRandom(config.seed);
  const { n, balance, noise, distribution } = config;
  
  const n1 = Math.floor(n * balance);
  const n0 = n - n1;
  
  const points: DataPoint[] = [];
  
  if (distribution === 'blobs') {
    // Two Gaussians
    const mu0 = [-1, -1];
    const mu1 = [1, 1];
    
    // Generate class 0 points
    for (let i = 0; i < n0; i++) {
      points.push({
        x: rng.gaussian(mu0[0], noise),
        y: rng.gaussian(mu0[1], noise),
        label: 0
      });
    }
    
    // Generate class 1 points
    for (let i = 0; i < n1; i++) {
      points.push({
        x: rng.gaussian(mu1[0], noise),
        y: rng.gaussian(mu1[1], noise),
        label: 1
      });
    }
  } else {
    // Two moons
    // Generate class 0 points (upper moon)
    for (let i = 0; i < n0; i++) {
      const t = rng.uniform(0, Math.PI);
      const x = Math.cos(t);
      const y = Math.sin(t);
      points.push({
        x: x + rng.gaussian(0, noise),
        y: y + rng.gaussian(0, noise),
        label: 0
      });
    }
    
    // Generate class 1 points (lower moon)
    for (let i = 0; i < n1; i++) {
      const t = rng.uniform(0, Math.PI);
      const x = 1 - Math.cos(t);
      const y = 0.5 - Math.sin(t);
      points.push({
        x: x + rng.gaussian(0, noise),
        y: y + rng.gaussian(0, noise),
        label: 1
      });
    }
  }
  
  // Shuffle points
  for (let i = points.length - 1; i > 0; i--) {
    const j = Math.floor(rng.random() * (i + 1));
    [points[i], points[j]] = [points[j], points[i]];
  }
  
  // Calculate bounds with 10% margin
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  
  const xMargin = (xMax - xMin) * 0.1;
  const yMargin = (yMax - yMin) * 0.1;
  
  return {
    points,
    bounds: {
      xMin: xMin - xMargin,
      xMax: xMax + xMargin,
      yMin: yMin - yMargin,
      yMax: yMax + yMargin,
    }
  };
}
