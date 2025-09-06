// Training Web Worker
// This worker handles model training to keep the UI responsive

// Import utility functions (we'll need to inline them since workers can't import ES modules)

// Seedable random number generator (Mulberry32)
class SeededRandom {
  constructor(seed = Date.now()) {
    this.seed = seed;
    this.hasSpare = false;
    this.spare = 0;
  }

  random() {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  uniform(min = 0, max = 1) {
    return min + (max - min) * this.random();
  }

  gaussian(mean = 0, std = 1) {
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

  setSeed(seed) {
    this.seed = seed;
    this.hasSpare = false;
  }
}

// Numerically stable sigmoid function
function sigmoid(x) {
  if (x > 0) {
    const exp_neg_x = Math.exp(-x);
    return 1 / (1 + exp_neg_x);
  } else {
    const exp_x = Math.exp(x);
    return exp_x / (1 + exp_x);
  }
}

// Calculate accuracy
function calculateAccuracy(weights, X, y, n) {
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
function calculateLoss(weights, X, y, n, lambda) {
  let loss = 0;
  
  for (let i = 0; i < n; i++) {
    const logit = weights[0] + weights[1] * X[i * 2] + weights[2] * X[i * 2 + 1];
    const clampedLogit = Math.max(-500, Math.min(500, logit));
    const prob = sigmoid(clampedLogit);
    
    const clampedProb = Math.max(1e-15, Math.min(1 - 1e-15, prob));
    
    if (y[i] === 1) {
      loss -= Math.log(clampedProb);
    } else {
      loss -= Math.log(1 - clampedProb);
    }
  }
  
  loss /= n;
  
  const l2 = lambda * (weights[1] * weights[1] + weights[2] * weights[2]);
  return loss + l2;
}

// Train logistic regression with gradient descent
function trainLogisticRegression(trainData, valData, config) {
  const { lambda, learningRate, epochs } = config;
  const { X: trainX, y: trainY, n: trainN } = trainData;
  const { X: valX, y: valY, n: valN } = valData;
  
  const weights = new Float32Array([0, Math.random() * 0.1 - 0.05, Math.random() * 0.1 - 0.05]);
  const losses = [];
  
  for (let epoch = 0; epoch < epochs; epoch++) {
    const gradients = new Float32Array(3);
    
    for (let i = 0; i < trainN; i++) {
      const logit = weights[0] + weights[1] * trainX[i * 2] + weights[2] * trainX[i * 2 + 1];
      const prob = sigmoid(logit);
      const error = prob - trainY[i];
      
      gradients[0] += error;
      gradients[1] += error * trainX[i * 2];
      gradients[2] += error * trainX[i * 2 + 1];
    }
    
    gradients[0] /= trainN;
    gradients[1] = gradients[1] / trainN + 2 * lambda * weights[1];
    gradients[2] = gradients[2] / trainN + 2 * lambda * weights[2];
    
    weights[0] -= learningRate * gradients[0];
    weights[1] -= learningRate * gradients[1];
    weights[2] -= learningRate * gradients[2];
    
    if (epoch % 10 === 0 || epoch === epochs - 1) {
      const loss = calculateLoss(weights, trainX, trainY, trainN, lambda);
      const trainAcc = calculateAccuracy(weights, trainX, trainY, trainN);
      const valAcc = calculateAccuracy(weights, valX, valY, valN);
      
      losses.push(loss);
      
      self.postMessage({
        type: 'progress',
        epoch,
        loss,
        trainAccuracy: trainAcc,
        valAccuracy: valAcc
      });
    }
  }
  
  const finalTrainAcc = calculateAccuracy(weights, trainX, trainY, trainN);
  const finalValAcc = calculateAccuracy(weights, valX, valY, valN);
  
  return {
    weights,
    trainAccuracy: finalTrainAcc,
    valAccuracy: finalValAcc,
    losses
  };
}

// Generate bootstrap sample
function generateBootstrapSample(points, rng) {
  const n = points.length;
  const sample = [];
  
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(rng.random() * n);
    sample.push(points[idx]);
  }
  
  return sample;
}

// Standardize features
function standardizeFeatures(points) {
  const n = points.length;
  const meanX = new Float32Array(2);
  const stdX = new Float32Array(2);
  
  for (const point of points) {
    meanX[0] += point.x;
    meanX[1] += point.y;
  }
  meanX[0] /= n;
  meanX[1] /= n;
  
  for (const point of points) {
    stdX[0] += Math.pow(point.x - meanX[0], 2);
    stdX[1] += Math.pow(point.y - meanX[1], 2);
  }
  stdX[0] = Math.sqrt(stdX[0] / n);
  stdX[1] = Math.sqrt(stdX[1] / n);
  
  if (stdX[0] < 1e-8) stdX[0] = 1;
  if (stdX[1] < 1e-8) stdX[1] = 1;
  
  const standardized = points.map(point => ({
    x: (point.x - meanX[0]) / stdX[0],
    y: (point.y - meanX[1]) / stdX[1],
    label: point.label
  }));
  
  return { standardized, meanX, stdX };
}

// Train/val split
function trainValSplit(points, trainRatio = 0.8) {
  const n = points.length;
  const nTrain = Math.floor(n * trainRatio);
  
  return {
    train: points.slice(0, nTrain),
    val: points.slice(nTrain)
  };
}

// Convert points to arrays
function pointsToArrays(points) {
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

self.onmessage = function(e) {
  const { type, data } = e.data;
  
  try {
    if (type === 'train') {
      const { points, modelConfig, seed } = data;
      
      // Standardize features
      const { standardized, meanX, stdX } = standardizeFeatures(points);
      
      // Split data
      const { train, val } = trainValSplit(standardized);
      
      // Convert to arrays
      const trainData = pointsToArrays(train);
      const valData = pointsToArrays(val);
      
      // Train model
      const result = trainLogisticRegression(trainData, valData, modelConfig);
      result.meanX = meanX;
      result.stdX = stdX;
      
      self.postMessage({
        type: 'complete',
        result
      });
      
    } else if (type === 'repeatTraining') {
      const { points, modelConfig, numRuns, seed } = data;
      const rng = new SeededRandom(seed);
      const results = [];
      
      for (let i = 0; i < numRuns; i++) {
        // Create slightly different datasets by resampling
        const resampledPoints = generateBootstrapSample(points, rng);
        
        const { standardized, meanX, stdX } = standardizeFeatures(resampledPoints);
        const { train, val } = trainValSplit(standardized);
        const trainData = pointsToArrays(train);
        const valData = pointsToArrays(val);
        
        const result = trainLogisticRegression(trainData, valData, modelConfig);
        result.meanX = meanX;
        result.stdX = stdX;
        
        results.push(result);
        
        self.postMessage({
          type: 'repeatProgress',
          completed: i + 1,
          total: numRuns
        });
      }
      
      self.postMessage({
        type: 'repeatComplete',
        results
      });
      
    } else if (type === 'bootstrap') {
      const { points, modelWeights, meanX, stdX, numSamples, seed } = data;
      const rng = new SeededRandom(seed);
      const accuracies = [];
      
      for (let i = 0; i < numSamples; i++) {
        const bootstrapSample = generateBootstrapSample(points, rng);
        
        // Standardize using original mean/std
        const standardizedSample = bootstrapSample.map(point => ({
          x: (point.x - meanX[0]) / stdX[0],
          y: (point.y - meanX[1]) / stdX[1],
          label: point.label
        }));
        
        const sampleData = pointsToArrays(standardizedSample);
        const accuracy = calculateAccuracy(modelWeights, sampleData.X, sampleData.y, sampleData.n);
        accuracies.push(accuracy);
        
        if (i % 50 === 0) {
          self.postMessage({
            type: 'bootstrapProgress',
            completed: i + 1,
            total: numSamples
          });
        }
      }
      
      // Calculate 95% confidence interval
      accuracies.sort((a, b) => a - b);
      const lowerIndex = Math.floor(0.025 * accuracies.length);
      const upperIndex = Math.floor(0.975 * accuracies.length);
      const confidenceInterval = [accuracies[lowerIndex], accuracies[upperIndex]];
      
      self.postMessage({
        type: 'bootstrapComplete',
        accuracies,
        confidenceInterval
      });
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message
    });
  }
};
