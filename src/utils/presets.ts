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

// URL sharing functionality
export interface AppState {
  dataConfig: GeneratorConfig;
  modelConfig: ModelConfig;
}

export function encodeAppState(state: AppState): string {
  try {
    const compressed = {
      d: state.dataConfig.distribution.charAt(0), // 'b' or 'm'
      n: state.dataConfig.n,
      b: Math.round(state.dataConfig.balance * 100) / 100,
      noise: Math.round(state.dataConfig.noise * 100) / 100,
      s: state.dataConfig.seed === 42 ? undefined : state.dataConfig.seed,
      l: state.modelConfig.lambda,
      lr: state.modelConfig.learningRate,
      e: state.modelConfig.epochs
    };
    
    // Remove undefined values
    Object.keys(compressed).forEach(key => 
      compressed[key as keyof typeof compressed] === undefined && delete compressed[key as keyof typeof compressed]
    );
    
    return btoa(JSON.stringify(compressed));
  } catch (error) {
    console.error('Error encoding app state:', error);
    return '';
  }
}

export function decodeAppState(encoded: string): Partial<AppState> | null {
  try {
    const compressed = JSON.parse(atob(encoded));
    
    const state: Partial<AppState> = {
      dataConfig: {
        distribution: compressed.d === 'm' ? 'moons' : 'blobs',
        n: compressed.n || 300,
        balance: compressed.b || 0.5,
        noise: compressed.noise || 0.9,
        seed: compressed.s || 42
      },
      modelConfig: {
        lambda: compressed.l || 0.01,
        learningRate: compressed.lr || 0.05,
        epochs: compressed.e || 100
      }
    };
    
    return state;
  } catch (error) {
    console.error('Error decoding app state:', error);
    return null;
  }
}

export function generateShareUrl(state: AppState): string {
  const encoded = encodeAppState(state);
  const url = new URL(window.location.href);
  if (encoded) {
    url.searchParams.set('config', encoded);
  } else {
    url.searchParams.delete('config');
  }
  return url.toString();
}

export function loadStateFromUrl(): Partial<AppState> | null {
  const params = new URLSearchParams(window.location.search);
  const config = params.get('config');
  
  if (config) {
    return decodeAppState(config);
  }
  
  return null;
}
