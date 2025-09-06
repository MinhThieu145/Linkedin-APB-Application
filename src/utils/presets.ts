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

