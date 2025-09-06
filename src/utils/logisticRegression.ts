import { DataPoint } from './dataGenerator';

export interface ModelConfig {
  lambda: number; // L2 regularization parameter
  learningRate: number;
  epochs: number;
}

export interface TrainingData {
  X: Float32Array; // Features (n x 2)
  y: Float32Array; // Labels (n)
  n: number;
}

export interface ModelState {
  weights: Float32Array; // [bias, w1, w2]
  trainAccuracy: number;
  valAccuracy: number;
  losses: number[];
  meanX: Float32Array;
  stdX: Float32Array;
}

// Numerically stable sigmoid function
function sigmoid(x: number): number {
  if (x > 0) {
    const exp_neg_x = Math.exp(-x);
    return 1 / (1 + exp_neg_x);
  } else {
    const exp_x = Math.exp(x);
    return exp_x / (1 + exp_x);
  }
}

// Standardize features
export function standardizeFeatures(points: DataPoint[]): {
  standardized: DataPoint[];
  meanX: Float32Array;
  stdX: Float32Array;
} {
  const n = points.length;
  const meanX = new Float32Array(2);
  const stdX = new Float32Array(2);
  
  // Calculate means
  for (const point of points) {
    meanX[0] += point.x;
    meanX[1] += point.y;
  }
  meanX[0] /= n;
  meanX[1] /= n;
  
  // Calculate standard deviations
  for (const point of points) {
    stdX[0] += Math.pow(point.x - meanX[0], 2);
    stdX[1] += Math.pow(point.y - meanX[1], 2);
  }
  stdX[0] = Math.sqrt(stdX[0] / n);
  stdX[1] = Math.sqrt(stdX[1] / n);
  
  // Guard against zero std
  if (stdX[0] < 1e-8) stdX[0] = 1;
  if (stdX[1] < 1e-8) stdX[1] = 1;
  
  // Standardize
  const standardized = points.map(point => ({
    x: (point.x - meanX[0]) / stdX[0],
    y: (point.y - meanX[1]) / stdX[1],
    label: point.label
  }));
  
  return { standardized, meanX, stdX };
}

// Split data into train/validation
export function trainValSplit(points: DataPoint[], trainRatio: number = 0.8): {
  train: DataPoint[];
  val: DataPoint[];
} {
  const n = points.length;
  const nTrain = Math.floor(n * trainRatio);
  
  return {
    train: points.slice(0, nTrain),
    val: points.slice(nTrain)
  };
}

// Convert points to arrays
export function pointsToArrays(points: DataPoint[]): TrainingData {
  const n = points.length;
  const X = new Float32Array(n * 2);
  const y = new Float32Array(n);
  
  for (let i = 0; i < n; i++) {
    X[i * 2] = points[i].x;
    X[i * 2 + 1] = points[i].y;
    y[i] = points[i].label;
  }
  
  return { X, y, n };
}

// Calculate accuracy
export function calculateAccuracy(weights: Float32Array, X: Float32Array, y: Float32Array, n: number): number {
  let correct = 0;
  
  for (let i = 0; i < n; i++) {
    const logit = weights[0] + weights[1] * X[i * 2] + weights[2] * X[i * 2 + 1];
    const prob = sigmoid(logit);
    const predicted = prob >= 0.5 ? 1 : 0;
    
    if (predicted === y[i]) {
      correct++;
    }
  }
  
  return correct / n;
}

// Calculate loss with L2 regularization
export function calculateLoss(weights: Float32Array, X: Float32Array, y: Float32Array, n: number, lambda: number): number {
  let loss = 0;
  
  for (let i = 0; i < n; i++) {
    const logit = weights[0] + weights[1] * X[i * 2] + weights[2] * X[i * 2 + 1];
    // Clamp logit to avoid numerical issues
    const clampedLogit = Math.max(-500, Math.min(500, logit));
    const prob = sigmoid(clampedLogit);
    
    // Clamp prob to avoid log(0)
    const clampedProb = Math.max(1e-15, Math.min(1 - 1e-15, prob));
    
    if (y[i] === 1) {
      loss -= Math.log(clampedProb);
    } else {
      loss -= Math.log(1 - clampedProb);
    }
  }
  
  loss /= n;
  
  // Add L2 regularization (don't regularize bias)
  const l2 = lambda * (weights[1] * weights[1] + weights[2] * weights[2]);
  return loss + l2;
}

// Train logistic regression with gradient descent
export function trainLogisticRegression(
  trainData: TrainingData,
  valData: TrainingData,
  config: ModelConfig,
  onProgress?: (epoch: number, loss: number, trainAcc: number, valAcc: number) => void
): ModelState {
  const { lambda, learningRate, epochs } = config;
  const { X: trainX, y: trainY, n: trainN } = trainData;
  const { X: valX, y: valY, n: valN } = valData;
  
  // Initialize weights randomly
  const weights = new Float32Array([0, Math.random() * 0.1 - 0.05, Math.random() * 0.1 - 0.05]);
  const losses: number[] = [];
  
  for (let epoch = 0; epoch < epochs; epoch++) {
    // Calculate gradients
    const gradients = new Float32Array(3);
    
    for (let i = 0; i < trainN; i++) {
      const logit = weights[0] + weights[1] * trainX[i * 2] + weights[2] * trainX[i * 2 + 1];
      const prob = sigmoid(logit);
      const error = prob - trainY[i];
      
      gradients[0] += error; // bias gradient
      gradients[1] += error * trainX[i * 2]; // w1 gradient
      gradients[2] += error * trainX[i * 2 + 1]; // w2 gradient
    }
    
    // Average gradients and add regularization
    gradients[0] /= trainN;
    gradients[1] = gradients[1] / trainN + 2 * lambda * weights[1];
    gradients[2] = gradients[2] / trainN + 2 * lambda * weights[2];
    
    // Update weights
    weights[0] -= learningRate * gradients[0];
    weights[1] -= learningRate * gradients[1];
    weights[2] -= learningRate * gradients[2];
    
    // Calculate loss and accuracies
    if (epoch % 10 === 0 || epoch === epochs - 1) {
      const loss = calculateLoss(weights, trainX, trainY, trainN, lambda);
      const trainAcc = calculateAccuracy(weights, trainX, trainY, trainN);
      const valAcc = calculateAccuracy(weights, valX, valY, valN);
      
      losses.push(loss);
      
      if (onProgress) {
        onProgress(epoch, loss, trainAcc, valAcc);
      }
    }
  }
  
  const finalTrainAcc = calculateAccuracy(weights, trainX, trainY, trainN);
  const finalValAcc = calculateAccuracy(weights, valX, valY, valN);
  
  return {
    weights,
    trainAccuracy: finalTrainAcc,
    valAccuracy: finalValAcc,
    losses,
    meanX: new Float32Array([0, 0]), // Will be set by caller
    stdX: new Float32Array([1, 1])   // Will be set by caller
  };
}

// Predict probability for a point
export function predictProba(
  x: number,
  y: number,
  weights: Float32Array,
  meanX: Float32Array,
  stdX: Float32Array
): number {
  // Standardize input
  const x_std = (x - meanX[0]) / stdX[0];
  const y_std = (y - meanX[1]) / stdX[1];
  
  const logit = weights[0] + weights[1] * x_std + weights[2] * y_std;
  return sigmoid(logit);
}
