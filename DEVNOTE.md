# StatML Lab - Developer Documentation

## 📋 Technical Overview

StatML Lab is a React-based web application implementing interactive logistic regression training and visualization. The application demonstrates machine learning concepts through real-time visualization of training processes, decision boundaries, and statistical uncertainty.

### **Technology Stack**
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Visualization**: HTML5 Canvas 2D API + d3-scale for coordinate transformations
- **Computation**: Web Workers for non-blocking ML training
- **Build System**: Create React App with TypeScript configuration
- **Styling**: Utility-first CSS with custom dark theme

---

## 🔧 Core Components & Architecture

### **Data Generation**
- **Blobs**: Two bivariate Gaussian distributions at (-1,-1) and (1,1)
- **Moons**: Two semicircular arcs with controllable noise
- **Parameters**: Sample size (50-1000), class balance (0.1-0.9), noise level (0.1-1.5)

### **Model Implementation**
- **Algorithm**: Logistic regression with L2 regularization
- **Optimization**: Gradient descent (batch, not stochastic)
- **Features**: Standardized to zero mean, unit variance
- **Validation**: 80/20 train/validation split

### **Uncertainty Quantification**
- **Repeat Training**: Bootstrap resampling for variance estimation
- **Confidence Intervals**: Percentile method for accuracy uncertainty
- **Visualization**: Overlapping decision boundaries and histogram displays

---

## 🎲 Data Generation Logic Deep Dive

This section explains the mathematical foundations and implementation details of the synthetic data generation system.

### **1. Seedable Random Number Generation**

#### **Mulberry32 Algorithm Implementation**
```typescript
class SeededRandom {
  random(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}
```

**Why This Algorithm**:
- **Deterministic**: Same seed produces identical sequences for reproducibility
- **High Quality**: Passes statistical randomness tests (unlike simple LCG)
- **Fast**: Efficient bitwise operations, ~4.2 billion period
- **Educational Value**: Enables consistent demonstrations across sessions

#### **Box-Muller Transform for Gaussian Distribution**
```typescript
gaussian(mean = 0, std = 1): number {
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
```

**Mathematical Foundation**:
- **Box-Muller Transform**: Converts uniform random variables to Gaussian
- **Formula**: `Z = σ * √(-2ln(U₁)) * cos(2πU₂) + μ`
- **Efficiency**: Generates two Gaussian samples per call (uses spare)
- **Quality**: Produces true normal distribution (not approximation)

### **2. Blob Distribution Generation**

#### **Mathematical Model**
```typescript
// Class 0: Gaussian at (-1, -1)
for (let i = 0; i < n0; i++) {
  points.push({
    x: rng.gaussian(-1, noise),  // X ~ N(-1, σ²)
    y: rng.gaussian(-1, noise),  // Y ~ N(-1, σ²)
    label: 0
  });
}

// Class 1: Gaussian at (1, 1)  
for (let i = 0; i < n1; i++) {
  points.push({
    x: rng.gaussian(1, noise),   // X ~ N(1, σ²)
    y: rng.gaussian(1, noise),   // Y ~ N(1, σ²)
    label: 1
  });
}
```

**Design Rationale**:
- **Linear Separability**: Centers at (-1,-1) and (1,1) create maximum separation
- **Diagonal Separation**: Decision boundary naturally runs from top-left to bottom-right
- **Controllable Overlap**: Higher noise (σ) creates more class overlap
- **Balanced Difficulty**: Easy enough for linear classifier, challenging enough to show regularization effects

#### **Class Balance Implementation**
```typescript
const n1 = Math.floor(n * balance);  // Class 1 count
const n0 = n - n1;                   // Class 0 count (ensures exact total)
```

**Why This Approach**:
- **Exact Totals**: Guarantees precisely `n` total points
- **Controlled Imbalance**: `balance=0.1` → 10% Class 1, 90% Class 0
- **Real-world Relevance**: Many datasets have class imbalance

### **3. Moons Distribution Generation**

#### **Mathematical Model**
```typescript
// Class 0: Upper semicircle (0 to π)
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

// Class 1: Lower semicircle (inverted and offset)
for (let i = 0; i < n1; i++) {
  const t = rng.uniform(0, Math.PI);
  const x = 1 - Math.cos(t);          // Horizontal flip + offset
  const y = 0.5 - Math.sin(t);        // Vertical flip + offset
  points.push({
    x: x + rng.gaussian(0, noise),
    y: y + rng.gaussian(0, noise),
    label: 1
  });
}
```

**Geometric Construction**:
- **Class 0**: Parametric circle `(cos(t), sin(t))` for `t ∈ [0, π]`
- **Class 1**: Transformed circle `(1-cos(t), 0.5-sin(t))` for `t ∈ [0, π]`
- **Interlocking Pattern**: Creates two crescents that interlock
- **Non-linear Separability**: No straight line can perfectly separate the classes

**Why This is Challenging for Linear Classifiers**:
- **Curved Boundary**: Optimal separator is curved, not straight
- **Linear Limitation**: Logistic regression can only draw straight lines
- **Educational Value**: Shows when linear models struggle

### **4. Post-Processing Steps**

#### **Fisher-Yates Shuffle**
```typescript
for (let i = points.length - 1; i > 0; i--) {
  const j = Math.floor(rng.random() * (i + 1));
  [points[i], points[j]] = [points[j], points[i]];
}
```

**Purpose**: Randomizes point order to prevent any systematic bias during train/val split.

#### **Automatic Bounds Calculation**
```typescript
const xMargin = (xMax - xMin) * 0.1;
const yMargin = (yMax - yMin) * 0.1;
bounds = {
  xMin: xMin - xMargin,
  xMax: xMax + xMargin,
  yMin: yMin - yMargin,
  yMax: yMax + yMargin
};
```

**Purpose**: Creates consistent visualization boundaries with 10% padding for all datasets.

---

## 🧠 Training Logic Deep Dive

This section provides a detailed breakdown of the logistic regression training implementation, which is the core computational challenge of the application.

### **Training Flow Overview**

The training process involves multiple stages: data preprocessing, model initialization, gradient computation, weight updates, and progress monitoring. All training occurs in a Web Worker to maintain UI responsiveness.

### **1. Data Preprocessing Pipeline**

#### **Feature Standardization**
```typescript
// src/utils/logisticRegression.ts
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
  
  // Guard against zero std (prevents division by zero)
  if (stdX[0] < 1e-8) stdX[0] = 1;
  if (stdX[1] < 1e-8) stdX[1] = 1;
  
  // Apply standardization: z = (x - μ) / σ
  const standardized = points.map(point => ({
    x: (point.x - meanX[0]) / stdX[0],
    y: (point.y - meanX[1]) / stdX[1],
    label: point.label
  }));
  
  return { standardized, meanX, stdX };
}
```

**Explanation**: Standardization ensures all features have zero mean and unit variance. This is crucial for gradient descent convergence because:
- Features with different scales can cause gradient updates to be dominated by large-magnitude features
- Standardization makes the optimization landscape more spherical, leading to faster convergence
- The means and standard deviations are stored to transform new data consistently

#### **Train/Validation Split**
```typescript
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
```

**Explanation**: Simple temporal split (not random) to maintain deterministic behavior given the same seed. The validation set is used to monitor generalization performance during training.

### **2. Core Training Algorithm**

#### **Numerically Stable Sigmoid Function**
```typescript
function sigmoid(x: number): number {
  if (x > 0) {
    const exp_neg_x = Math.exp(-x);
    return 1 / (1 + exp_neg_x);
  } else {
    const exp_x = Math.exp(x);
    return exp_x / (1 + exp_x);
  }
}
```

**Explanation**: This implementation prevents numerical overflow that would occur with the naive `1 / (1 + exp(-x))` formula:
- For large positive x: `exp(-x)` approaches 0, avoiding `exp(x)` overflow
- For large negative x: `exp(x)` approaches 0, avoiding `exp(-x)` overflow
- This ensures stable computation across the entire real number line

#### **Loss Function with Regularization**
```typescript
export function calculateLoss(weights: Float32Array, X: Float32Array, y: Float32Array, n: number, lambda: number): number {
  let loss = 0;
  
  // Cross-entropy loss computation
  for (let i = 0; i < n; i++) {
    const logit = weights[0] + weights[1] * X[i * 2] + weights[2] * X[i * 2 + 1];
    // Clamp logit to prevent extreme values
    const clampedLogit = Math.max(-500, Math.min(500, logit));
    const prob = sigmoid(clampedLogit);
    
    // Clamp probability to prevent log(0)
    const clampedProb = Math.max(1e-15, Math.min(1 - 1e-15, prob));
    
    // Cross-entropy: -[y*log(p) + (1-y)*log(1-p)]
    if (y[i] === 1) {
      loss -= Math.log(clampedProb);
    } else {
      loss -= Math.log(1 - clampedProb);
    }
  }
  
  loss /= n;  // Average over samples
  
  // Add L2 regularization (note: bias term is not regularized)
  const l2 = lambda * (weights[1] * weights[1] + weights[2] * weights[2]);
  return loss + l2;
}
```

**Mathematical Foundation**:
- **Cross-entropy loss**: `L = -[y*log(p) + (1-y)*log(1-p)]` measures probability alignment
- **Why cross-entropy**: Derivative w.r.t. logit simplifies to `(predicted - actual)`
- **L2 regularization**: `λ||w||²` penalizes large weights to prevent overfitting
- **Bias exclusion**: w₀ only shifts boundary, shouldn't be penalized for magnitude

**Numerical Safeguards**:
- **Logit clamping**: `[-500, 500]` prevents sigmoid overflow (`exp(500) ≈ 10²¹⁷`)
- **Probability clamping**: `[1e-15, 1-1e-15]` prevents `log(0) = -∞`
- **IEEE 754 compliance**: Handles extreme values without NaN/Infinity

#### **Gradient Computation and Weight Updates**
```typescript
export function trainLogisticRegression(
  trainData: TrainingData,
  valData: TrainingData,
  config: ModelConfig,
  onProgress?: (epoch: number, loss: number, trainAcc: number, valAcc: number) => void
): ModelState {
  const { lambda, learningRate, epochs } = config;
  const { X: trainX, y: trainY, n: trainN } = trainData;
  const { X: valX, y: valY, n: valN } = valData;
  
  // Initialize weights: small random values to break symmetry
  const weights = new Float32Array([0, Math.random() * 0.1 - 0.05, Math.random() * 0.1 - 0.05]);
  const losses: number[] = [];
  
  for (let epoch = 0; epoch < epochs; epoch++) {
    const gradients = new Float32Array(3);  // [∂L/∂w₀, ∂L/∂w₁, ∂L/∂w₂]
    
    // Compute gradients for each training sample
    for (let i = 0; i < trainN; i++) {
      // Forward pass: compute prediction
      const logit = weights[0] + weights[1] * trainX[i * 2] + weights[2] * trainX[i * 2 + 1];
      const prob = sigmoid(logit);
      const error = prob - trainY[i];  // ∂L/∂logit = p - y
      
      // Backpropagate error to weights
      gradients[0] += error;                    // ∂L/∂w₀ = error * 1
      gradients[1] += error * trainX[i * 2];    // ∂L/∂w₁ = error * x₁
      gradients[2] += error * trainX[i * 2 + 1]; // ∂L/∂w₂ = error * x₂
    }
    
    // Average gradients and add regularization
    gradients[0] /= trainN;                                    // Bias gradient (no regularization)
    gradients[1] = gradients[1] / trainN + 2 * lambda * weights[1];  // W₁ gradient + L2
    gradients[2] = gradients[2] / trainN + 2 * lambda * weights[2];  // W₂ gradient + L2
    
    // Gradient descent update: w = w - η * ∇L
    weights[0] -= learningRate * gradients[0];
    weights[1] -= learningRate * gradients[1];
    weights[2] -= learningRate * gradients[2];
    
    // Monitor progress every 10 epochs
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
    meanX: new Float32Array([0, 0]), // Set by caller
    stdX: new Float32Array([1, 1])   // Set by caller
  };
}
```

**Mathematical Breakdown**:

1. **Forward Pass**: For each sample, compute the linear combination and probability:
   ```
   logit = w₀ + w₁x₁ + w₂x₂
   p = σ(logit) = 1/(1 + e^(-logit))
   ```

2. **Error Computation**: The derivative of cross-entropy loss w.r.t. logit is simply:
   ```
   ∂L/∂logit = p - y
   ```

3. **Gradient Computation**: Chain rule gives us gradients w.r.t. weights:
   ```
   ∂L/∂w₀ = (p - y) * 1     // Bias gradient
   ∂L/∂w₁ = (p - y) * x₁    // Feature 1 gradient  
   ∂L/∂w₂ = (p - y) * x₂    // Feature 2 gradient
   ```

4. **Regularization**: L2 penalty adds `2λwⱼ` to each weight gradient (except bias):
   ```
   ∂L/∂w₁ += 2λw₁
   ∂L/∂w₂ += 2λw₂
   ```

5. **Weight Update**: Standard gradient descent:
   ```
   wⱼ ← wⱼ - η * ∂L/∂wⱼ
   ```

### **3. Web Worker Integration**

The training occurs in `public/training-worker.js` to prevent UI blocking:

```javascript
// Main training message handler
if (type === 'train') {
  const { points, modelConfig, seed } = data;
  
  // Preprocessing pipeline
  const { standardized, meanX, stdX } = standardizeFeatures(points);
  const { train, val } = trainValSplit(standardized);
  const trainData = pointsToArrays(train);
  const valData = pointsToArrays(val);
  
  // Train model with progress reporting
  const result = trainLogisticRegression(trainData, valData, modelConfig);
  result.meanX = meanX;
  result.stdX = stdX;
  
  // Send results back to main thread
  self.postMessage({
    type: 'complete',
    result
  });
}
```

**Critical Implementation Details**:

#### **Why Batch Gradient Descent**:
- **Stability**: Full dataset gradients are less noisy than SGD
- **Deterministic**: Same data order produces identical results
- **Educational**: Smoother convergence curves for visualization
- **Scale**: Dataset sizes (50-1000) make batch computation feasible

#### **Mathematical Correctness Verification**:
```
Logistic Regression Model: p = σ(w₀ + w₁x₁ + w₂x₂)
Cross-entropy Loss: L = -[y*log(p) + (1-y)*log(1-p)]

Derivative Chain Rule:
∂L/∂logit = ∂L/∂p * ∂p/∂logit = (p-y) * p(1-p) / (p(1-p)) = p-y

Feature Gradients:
∂L/∂w₀ = (p-y) * 1 = error
∂L/∂w₁ = (p-y) * x₁ = error * x₁  
∂L/∂w₂ = (p-y) * x₂ = error * x₂

L2 Regularization Gradients:
∂(λw²)/∂w = 2λw
```

#### **Weight Initialization Strategy**:
```typescript
weights = [0, random()*0.1-0.05, random()*0.1-0.05]
```
- **Bias = 0**: Neutral starting point for decision boundary
- **Small random weights**: Break symmetry, prevent identical feature learning
- **Scale [-0.05, 0.05]**: Small enough to avoid saturation, large enough for learning

#### **Training Convergence Analysis**:
- **Progress Monitoring**: Every 10 epochs balances UI responsiveness vs computation
- **Early Convergence**: Most improvement happens in first 50-100 epochs
- **Loss Tracking**: Decreasing loss indicates proper gradient descent
- **Accuracy Gap**: Train vs validation gap indicates overfitting

#### **Standardization Critical Importance**:
```typescript
// Without standardization: features at different scales
x₁ ∈ [-5, 5], x₂ ∈ [-100, 100]
// Gradient: [error, error*x₁, error*x₂]
// Update: w₁ changes slowly, w₂ changes rapidly → unstable convergence

// With standardization: features at same scale  
x₁, x₂ ∈ [-3, 3] (approximately)
// Gradient updates are balanced → stable convergence
```

**Performance Optimizations**:
- **Float32Array**: 50% memory reduction vs standard arrays
- **Batch Operations**: Vectorized computations where possible
- **Web Worker**: Non-blocking UI during intensive computation
- **Progress Throttling**: UI updates every 10 epochs, not every epoch

---

## 📊 Bootstrap & Uncertainty Analysis Logic

This section explains the statistical methods used to quantify model uncertainty and variance.

### **1. Bootstrap Resampling Method**

#### **Bootstrap Sample Generation**
```javascript
function generateBootstrapSample(points, rng) {
  const n = points.length;
  const sample = [];
  
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(rng.random() * n);
    sample.push(points[idx]);  // Sample WITH replacement
  }
  
  return sample;
}
```

**Statistical Foundation**:
- **Resampling with Replacement**: Creates datasets of same size as original
- **Bootstrap Principle**: Simulates drawing multiple samples from unknown population
- **Efron's Method**: Estimates sampling distribution of any statistic
- **No Distributional Assumptions**: Works regardless of underlying data distribution

#### **Why Bootstrap Works**:
```
Original Dataset: {x₁, x₂, ..., xₙ}
Bootstrap Sample 1: {x₃, x₁, x₁, x₇, ..., xₙ}  ← some points repeated, others missing
Bootstrap Sample 2: {x₂, x₅, x₃, x₃, ..., x₁}  ← different random sampling
...
Bootstrap Sample B: {x₁, x₄, x₄, x₂, ..., xₙ}

Each sample → Train model → Get accuracy → Distribution of accuracies
```

### **2. Confidence Interval Calculation**

#### **Percentile Method Implementation**
```javascript
// Calculate 95% confidence interval
accuracies.sort((a, b) => a - b);
const lowerIndex = Math.floor(0.025 * accuracies.length);
const upperIndex = Math.floor(0.975 * accuracies.length);
const confidenceInterval = [accuracies[lowerIndex], accuracies[upperIndex]];
```

**Statistical Interpretation**:
- **95% CI**: If we repeated the entire experiment many times, 95% of intervals would contain true accuracy
- **Percentile Method**: Uses 2.5th and 97.5th percentiles of bootstrap distribution
- **Non-parametric**: No assumption about normal distribution of accuracies
- **Practical Meaning**: "True model accuracy likely lies between [lower, upper] bounds"

#### **Bootstrap vs Traditional Confidence Intervals**:
```
Traditional CI (assumes normality):
CI = x̄ ± t₀.₀₂₅ * (s/√n)

Bootstrap CI (no assumptions):
CI = [P₂.₅, P₉₇.₅] from bootstrap distribution
```

### **3. Repeat Training for Variance Visualization**

#### **Multiple Model Training Process**
```javascript
for (let i = 0; i < numRuns; i++) {
  // Create different bootstrap sample
  const resampledPoints = generateBootstrapSample(points, rng);
  
  // Train separate model on this sample
  const { standardized, meanX, stdX } = standardizeFeatures(resampledPoints);
  const { train, val } = trainValSplit(standardized);
  const result = trainLogisticRegression(trainData, valData, modelConfig);
  
  // Each model has different decision boundary
  results.push(result);
}
```

**Variance Visualization Principle**:
- **Multiple Boundaries**: Each model produces slightly different decision line
- **Boundary Spread**: Wide spread indicates high variance (unstable model)
- **Boundary Clustering**: Tight clustering indicates low variance (stable model)
- **Visual Uncertainty**: Users can directly see model instability

#### **What Affects Model Variance**:
```
High Variance Scenarios:
- Small sample size (n < 100)
- High noise in data (σ > 1.0)
- Low regularization (λ < 0.001)
- Complex distributions (moons)

Low Variance Scenarios:
- Large sample size (n > 500)  
- Low noise in data (σ < 0.5)
- Moderate regularization (λ ≈ 0.01)
- Simple distributions (well-separated blobs)
```

### **4. Statistical Consistency Checks**

#### **Bootstrap Sample Size Guidelines**:
- **Minimum**: 100 samples for rough estimate
- **Recommended**: 500-1000 samples for stable CI
- **Computational Trade-off**: More samples = better estimate but slower computation

#### **Standardization Consistency**:
```javascript
// CRITICAL: Use original standardization parameters
const standardizedSample = bootstrapSample.map(point => ({
  x: (point.x - meanX[0]) / stdX[0],  // Use ORIGINAL mean/std
  y: (point.y - meanX[1]) / stdX[1],  // Not bootstrap sample's mean/std
  label: point.label
}));
```

**Why Original Standardization**:
- **Consistent Scale**: All bootstrap samples use same transformation
- **Fair Comparison**: Models trained on comparably scaled data
- **Realistic Simulation**: Mirrors real-world scenario where standardization parameters are fixed

### **5. Educational Value of Uncertainty Analysis**

#### **Bias-Variance Tradeoff Visualization**:
```
High Regularization (λ = 1.0):
- Decision boundaries cluster tightly (low variance)
- May miss optimal separation (higher bias)
- Narrow confidence intervals

Low Regularization (λ = 0.0001):  
- Decision boundaries spread widely (high variance)
- Fits training data closely (lower bias)
- Wide confidence intervals
```

#### **Sample Size Effect Demonstration**:
```
Small Dataset (n = 100):
- Bootstrap accuracies vary widely
- Wide confidence intervals (±5-10%)
- Decision boundaries fan out significantly

Large Dataset (n = 800):
- Bootstrap accuracies cluster tightly  
- Narrow confidence intervals (±1-2%)
- Decision boundaries nearly identical
```

This uncertainty analysis provides quantitative evidence for fundamental ML principles that are often only discussed theoretically.

---

## 🏗️ Project Structure

```
statml-lab/
├── public/                     # Static assets and web worker
├── src/                        # Main source code
│   ├── components/            # React UI components
│   ├── hooks/                 # Custom React hooks
│   ├── utils/                 # Core algorithms and utilities
│   ├── App.tsx               # Main application component
│   ├── index.tsx             # React app entry point
│   └── index.css             # Global styles
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # User documentation
```

---

## 📦 Package Configuration

### `package.json`
**Purpose**: Defines project metadata, dependencies, and build scripts.

**Key Dependencies**:
- `react@^18.3.1` & `react-dom@^18.3.1`: Core React framework
- `typescript@^4.9.5`: Type safety and development experience
- `d3-scale@^4.0.2`: Coordinate transformations for visualization
- `tailwindcss@^3.4.15`: Utility-first CSS framework
- `react-scripts@5.0.1`: Build tooling and development server

**Scripts**:
- `npm start`: Development server on localhost:3000
- `npm build`: Production build with optimizations
- `npm test`: Run test suite
- `npm eject`: Eject from create-react-app (irreversible)

### `tsconfig.json`
**Purpose**: TypeScript compiler configuration for React development.

**Key Settings**:
- Target: ES5 for broad browser compatibility
- JSX: `react-jsx` for modern React transform
- Strict mode enabled for better type safety
- Module resolution optimized for Node.js ecosystem

### `tailwind.config.js`
**Purpose**: Tailwind CSS customization and content scanning.

**Configuration**:
- Content scanning: `./src/**/*.{js,jsx,ts,tsx}`
- Extended colors: Custom `neutral-950` for ultra-dark backgrounds
- No additional plugins used (keeping it minimal)

---

## 🎨 Styling & Assets

### `src/index.css`
**Purpose**: Global styles and custom component styling.

**Key Features**:
- Tailwind base, components, and utilities imports
- Custom slider styling for cross-browser compatibility
- WebKit and Mozilla-specific slider thumb styles
- Accessibility-focused focus states
- Blue accent color (#3b82f6) for interactive elements

### `public/` Directory
**Static Assets**:
- `index.html`: Main HTML template with meta tags and root div
- `favicon.ico`, `logo192.png`, `logo512.png`: App icons and favicons
- `manifest.json`: PWA manifest for installability
- `robots.txt`: SEO crawler instructions
- `training-worker.js`: Web Worker for background computations

---

## ⚛️ React Application Architecture

### `src/App.tsx`
**Purpose**: Main application state container and component orchestrator.

**State Management**:
```typescript
const [dataConfig, setDataConfig] = useState<GeneratorConfig>()     // Data generation parameters
const [modelConfig, setModelConfig] = useState<ModelConfig>()       // Training hyperparameters  
const [uncertaintyConfig, setUncertaintyConfig] = useState()        // Uncertainty analysis settings
const [model, setModel] = useState<ModelState | null>()            // Trained model state
const [isTraining, setIsTraining] = useState<boolean>()            // Training status flag
const [uncertaintyBounds, setUncertaintyBounds] = useState()       // Multiple decision boundaries
const [bootstrapAccuracies, setBootstrapAccuracies] = useState()   // Bootstrap accuracy samples
const [confidenceInterval, setConfidenceInterval] = useState()     // Statistical confidence interval
```

**Component Layout**:
```
Grid Layout: [360px ControlPanel] [1fr MainContent]
├── ControlPanel (collapsible sections)
└── MainContent
    ├── PlotCanvas (750x400) + LossSparkline overlay
    └── Bottom Grid [2 columns, 240px height]
        ├── BootstrapHistogram (380x220)
        └── StatsPanel
```

---

## 🎛️ UI Components

### `src/components/ControlPanel.tsx`
**Purpose**: Parameter control interface with collapsible sections.

**Component Structure**:
- **CollapsibleSection**: Expandable panels with help tooltips
- **Slider**: Range inputs with logarithmic scale support for regularization
- **Select**: Dropdown controls for discrete options
- **Button**: Consistent styling for actions

**Sections**:
1. **Quick Presets**: Four predefined configurations
2. **Data Generation**: Distribution, sample size, balance, noise controls
3. **Model Training**: Hyperparameters and training controls
4. **Uncertainty Analysis**: Repeat runs and bootstrap configuration

**Implementation Details**:
- Regularization slider uses logarithmic scale (10^-4 to 10^1)
- All parameter changes trigger immediate parent callbacks
- Modal help system with educational content

### `src/components/PlotCanvas.tsx`
**Purpose**: High-performance Canvas-based visualization of training data and model results.

**Rendering Elements**:
1. **Probability Heatmap**: Background colors showing model confidence
2. **Data Points**: Blue circles (Class 0), Orange circles (Class 1)
3. **Decision Boundary**: White line at p=0.5
4. **Uncertainty Bounds**: Gray lines from repeat training (30% opacity)
5. **Grid System**: Coordinate reference with d3-scale transformations

**Performance Features**:
- High-DPI canvas scaling (`devicePixelRatio`)
- Coarse heatmap grid (2px) for performance
- Temporary canvas for heatmap rendering
- Efficient redraw on state changes

**Technical Implementation**:
- Uses d3-scale for coordinate transformations
- Canvas 2D context with proper scaling
- Numerical stability for decision boundary calculation

### Other Components

**`src/components/LossSparkline.tsx`**: Overlay sparkline showing training loss progression
**`src/components/BootstrapHistogram.tsx`**: Histogram visualization of bootstrap accuracy distribution  
**`src/components/StatsPanel.tsx`**: Numerical display of model metrics and parameters
**`src/components/HelpTooltip.tsx`**: Modal help system with educational content

---

## 🔧 Utility Functions

### `src/utils/dataGenerator.ts`
**Purpose**: Synthetic dataset generation with reproducible random sampling.

**Distributions**:
- **Blobs**: Two Gaussian clusters at (-1,-1) and (1,1) with configurable noise
- **Moons**: Two semicircular arcs with Gaussian noise perturbations

**Implementation**: Uses SeededRandom for reproducibility, Fisher-Yates shuffle, automatic boundary calculation with 10% margins.

### `src/utils/logisticRegression.ts`
**Purpose**: Logistic regression implementation with numerical stability safeguards.

**Key Functions**:
- `standardizeFeatures()`: Z-score normalization
- `trainLogisticRegression()`: Batch gradient descent with L2 regularization
- `calculateAccuracy()`: Classification performance evaluation
- `predictProba()`: Probability prediction for new points

**Numerical Stability**: Stable sigmoid, probability clamping, logit clamping to prevent overflow/underflow.

### `src/utils/presets.ts`
**Purpose**: Four predefined configurations demonstrating different ML scenarios.

### `src/utils/random.ts`
**Purpose**: Mulberry32 PRNG implementation for reproducible random number generation.

**Methods**: `random()`, `uniform()`, `gaussian()` using Box-Muller transform.

---

## 🔄 Hooks & Workers

### `src/hooks/useTrainingWorker.ts`
**Purpose**: React hook for Web Worker communication and job management.

**Message Protocol**:
- **Outbound**: `train`, `repeatTraining`, `bootstrap` with data payload
- **Inbound**: `progress`, `complete`, `repeatComplete`, `bootstrapComplete`
- **Error Handling**: Worker termination/recreation, job state tracking

### `public/training-worker.js`
**Purpose**: Web Worker for non-blocking ML computations.

**Implementation**: 
- Inlined utility functions (no ES module imports in workers)
- Handles training, repeat training, and bootstrap sampling
- Progress reporting via postMessage
- Deterministic results with seeded random number generation

---

## 🔄 Data Flow

### Application Flow
```
User Input → App State → Data Generation → Worker Training → Model Updates → Visualization
```

### Training Pipeline
```
DataPoints → standardizeFeatures() → trainValSplit() → trainLogisticRegression() → ModelState
```

### Uncertainty Pipeline
```
Dataset + Model → Repeat Training → Multiple Boundaries + Bootstrap Sampling → Confidence Intervals
```

---

## 🚀 Performance & Constraints

### Optimization Strategies
- **Canvas Rendering**: High-performance 2D graphics
- **Web Workers**: Non-blocking background computation
- **Float32Array**: Memory-efficient numeric arrays
- **Efficient Algorithms**: Numerically stable implementations

### Scale Limitations
- **Dataset Size**: 50-1000 points (UI performance constraint)
- **Training Epochs**: 50-200 (responsiveness vs convergence)
- **Bootstrap Samples**: 100-1000 (statistical vs computational trade-off)
- **Uncertainty Runs**: 5-30 models (visualization clarity)

### Browser Requirements
- ES2017+ JavaScript support
- Canvas 2D API
- Web Workers
- Modern browser performance characteristics

---

## 🔧 Development Setup

### Commands
```bash
npm install          # Install dependencies
npm start           # Development server (localhost:3000)
npm run build       # Production build
npx tsc --noEmit    # Type checking
```

### Code Organization
- **Component Separation**: UI components handle presentation only
- **Algorithm Isolation**: Pure functions in utils/ for testability
- **Type Safety**: Comprehensive TypeScript interfaces
- **Performance**: Canvas over DOM for visualizations

---

This documentation provides technical details for developers working with the StatML Lab codebase. The application demonstrates logistic regression training through interactive visualization with proper numerical stability and performance considerations.
