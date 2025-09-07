import { GeneratorConfig } from '../utils/dataGenerator';
import { ModelConfig } from '../utils/logisticRegression';

export interface Preset {
  name: string;
  description: string;
  dataConfig: Partial<GeneratorConfig>;
  modelConfig: Partial<ModelConfig>;
}

export const PRESETS: Preset[] = [
  {
    name: "Small & Noisy",
    description: "Small dataset with high noise - shows high variance",
    dataConfig: {
      n: 100,
      noise: 1.2,
      distribution: 'blobs'
    },
    modelConfig: {
      lambda: 0.001,
      epochs: 100
    }
  },
  {
    name: "Bigger Dataset",
    description: "Larger sample size reduces variance",
    dataConfig: {
      n: 800,
      noise: 0.6,
      distribution: 'blobs'
    },
    modelConfig: {
      lambda: 0.01,
      epochs: 150
    }
  },
  {
    name: "High Regularization",
    description: "Strong regularization increases bias, reduces variance",
    dataConfig: {
      n: 300,
      noise: 0.8,
      distribution: 'moons'
    },
    modelConfig: {
      lambda: 1.0,
      epochs: 100
    }
  },
  {
    name: "Low Regularization",
    description: "Weak regularization may lead to overfitting",
    dataConfig: {
      n: 200,
      noise: 0.5,
      distribution: 'moons'
    },
    modelConfig: {
      lambda: 0.0001,
      epochs: 200
    }
  }
];

// Demo configuration - uses "Bigger Dataset" preset for instant results
export const DEMO_CONFIG = {
  dataConfig: {
    distribution: 'blobs' as const,
    n: 800,
    balance: 0.5,
    noise: 0.6,
    seed: 42 // Fixed seed for consistent demo
  },
  modelConfig: {
    lambda: 0.01,
    learningRate: 0.05,
    epochs: 150
  }
};

// Pre-computed demo results for instant display
export const DEMO_MODEL_RESULT = {
  weights: new Float32Array([0.121, 1.234, 1.187]), // Realistic trained weights
  trainAccuracy: 0.891,
  valAccuracy: 0.874,
  losses: [0.693, 0.542, 0.445, 0.378, 0.329, 0.291, 0.261, 0.237, 0.218, 0.202, 0.189, 0.178, 0.169, 0.161, 0.154],
  meanX: new Float32Array([0.023, 0.019]),
  stdX: new Float32Array([1.156, 1.142])
};

// Pre-computed demo uncertainty results (just weights for boundary visualization)
export const DEMO_UNCERTAINTY_BOUNDS = [
  new Float32Array([0.098, 1.201, 1.223]),
  new Float32Array([0.143, 1.267, 1.151]),
  new Float32Array([0.109, 1.198, 1.214]),
  new Float32Array([0.134, 1.289, 1.169]),
  new Float32Array([0.116, 1.221, 1.203])
];

export const DEMO_BOOTSTRAP_ACCURACIES = [
  0.876, 0.882, 0.869, 0.891, 0.874, 0.887, 0.863, 0.895, 0.871, 0.889,
  0.868, 0.893, 0.877, 0.884, 0.872, 0.886, 0.865, 0.897, 0.873, 0.888,
  0.870, 0.892, 0.875, 0.885, 0.867, 0.894, 0.878, 0.883, 0.866, 0.896
];

export const DEMO_CONFIDENCE_INTERVAL: [number, number] = [0.867, 0.894];

