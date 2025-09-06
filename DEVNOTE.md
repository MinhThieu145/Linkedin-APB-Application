# StatML Lab - Developer Documentation

## 📋 Overview

StatML Lab is a comprehensive, interactive web application designed specifically for machine learning education. It provides a complete visual learning environment where students can experiment with classification algorithms, explore bias-variance tradeoffs, and understand statistical uncertainty through hands-on experimentation.

### **Educational Mission**
This application transforms abstract machine learning concepts into tangible, visual experiences. Students can:
- Generate synthetic datasets with controllable characteristics
- Train logistic regression models with different parameters
- Visualize decision boundaries and probability surfaces
- Explore model uncertainty through repeat sampling and bootstrap methods
- Understand the practical implications of regularization and sample size

### **Core Learning Objectives**
1. **Classification Fundamentals**: Understanding how linear classifiers separate data
2. **Bias-Variance Tradeoff**: Visualizing how regularization affects model complexity
3. **Sample Size Effects**: Seeing how more data reduces model uncertainty
4. **Statistical Uncertainty**: Quantifying confidence in model performance
5. **Hyperparameter Impact**: Understanding how different settings affect results

### **Target Audience**
- **Students**: Machine learning and statistics courses (undergraduate/graduate)
- **Educators**: Classroom demonstrations and interactive lectures
- **Self-learners**: Independent study and concept reinforcement
- **Professionals**: Interview preparation and concept review

### **Technical Architecture**
**Frontend Stack**: React 18 + TypeScript + Tailwind CSS + Canvas 2D + Web Workers
**Performance**: Non-blocking UI with background computation
**Accessibility**: Keyboard navigation, screen reader support, focus management
**Browser Support**: Modern browsers with ES2017+ and Web Worker support

---

## 🎓 Application Functionality & Features

### **1. Quick Presets System**
The application includes four carefully designed preset scenarios that demonstrate key machine learning concepts:

#### **"Small & Noisy" Preset**
- **Purpose**: Demonstrates high variance scenarios
- **Configuration**: 100 samples, high noise (σ=1.2), weak regularization (λ=0.001)
- **Learning Goal**: Shows how limited data and high noise lead to unstable models
- **Expected Behavior**: Decision boundaries vary significantly between training runs

#### **"Bigger Dataset" Preset**
- **Purpose**: Shows variance reduction with more data
- **Configuration**: 800 samples, moderate noise (σ=0.6), standard regularization (λ=0.01)
- **Learning Goal**: Demonstrates how larger sample sizes stabilize model predictions
- **Expected Behavior**: Tighter uncertainty bounds and more confident predictions

#### **"High Regularization" Preset**
- **Purpose**: Illustrates bias-variance tradeoff
- **Configuration**: 300 samples, moderate noise (σ=0.8), strong regularization (λ=1.0), moons distribution
- **Learning Goal**: Shows how regularization simplifies models and reduces variance
- **Expected Behavior**: Straighter decision boundaries, less overfitting

#### **"Low Regularization" Preset**
- **Purpose**: Demonstrates overfitting risks
- **Configuration**: 200 samples, low noise (σ=0.5), minimal regularization (λ=0.0001), moons distribution
- **Learning Goal**: Shows potential for overfitting with complex, flexible models
- **Expected Behavior**: Curved boundaries that may follow noise rather than signal

### **2. Data Generation System**

#### **Distribution Types**

**Blobs (Gaussian Clusters)**
- **Mathematical Foundation**: Two bivariate normal distributions
- **Class 0 Center**: (-1, -1) with controllable standard deviation
- **Class 1 Center**: (1, 1) with controllable standard deviation
- **Use Case**: Linearly separable data that's easy to classify
- **Educational Value**: Shows how noise affects separability

**Moons (Curved Patterns)**
- **Mathematical Foundation**: Two semicircular arcs with added Gaussian noise
- **Class 0**: Upper semicircle from 0 to π
- **Class 1**: Lower semicircle, inverted and offset
- **Use Case**: Non-linearly separable data that challenges linear classifiers
- **Educational Value**: Demonstrates limitations of linear models

#### **Controllable Parameters**

**Sample Size (n: 50-1000)**
- **Purpose**: Controls the amount of training data
- **Impact on Learning**: 
  - Small n (50-100): High variance, uncertain predictions
  - Medium n (200-500): Balanced bias-variance
  - Large n (800-1000): Low variance, stable predictions
- **Statistical Principle**: Law of large numbers

**Class Balance (0.1-0.9)**
- **Purpose**: Controls proportion of Class 1 samples
- **Values**: 0.1 = 10% Class 1, 0.5 = balanced, 0.9 = 90% Class 1
- **Impact**: Imbalanced data can bias predictions toward majority class
- **Real-world Relevance**: Many real datasets have class imbalance

**Noise Level (σ: 0.1-1.5)**
- **For Blobs**: Standard deviation of Gaussian distributions
- **For Moons**: Magnitude of random perturbations
- **Impact**: Higher noise makes classification more challenging
- **Educational Value**: Shows robustness vs. sensitivity tradeoffs

**Random Resampling**
- **Mechanism**: Generates new random seed for each resample
- **Purpose**: Demonstrates stochastic nature of machine learning
- **Educational Value**: Shows how different samples affect model training

### **3. Model Training System**

#### **Algorithm: Logistic Regression**
- **Mathematical Model**: Linear combination of features passed through sigmoid function
- **Decision Boundary**: Straight line where predicted probability = 0.5
- **Optimization**: Gradient descent with L2 regularization
- **Loss Function**: Cross-entropy + L2 penalty term

#### **Hyperparameter Controls**

**Regularization Strength (λ)**
- **Range**: 10⁻⁴ to 10¹ (logarithmic scale)
- **Purpose**: Controls model complexity and overfitting
- **Mathematical Effect**: Adds penalty term λ||w||² to loss function
- **Practical Impact**:
  - Low λ (0.0001): Flexible model, may overfit
  - Medium λ (0.01): Balanced complexity
  - High λ (1.0): Simple model, may underfit

**Learning Rate (η)**
- **Options**: 0.01, 0.05, 0.1
- **Purpose**: Controls step size in gradient descent
- **Impact**: 
  - Too low: Slow convergence
  - Too high: Unstable training, overshooting
  - Just right: Smooth, efficient convergence

**Training Epochs**
- **Options**: 50, 100, 200
- **Purpose**: Number of complete passes through training data
- **Impact**: More epochs allow better convergence but risk overfitting

#### **Training Process**
1. **Data Preprocessing**: Feature standardization (zero mean, unit variance)
2. **Train/Validation Split**: 80% training, 20% validation
3. **Weight Initialization**: Small random values near zero
4. **Gradient Descent**: Iterative weight updates
5. **Progress Monitoring**: Real-time loss and accuracy tracking

### **4. Uncertainty Analysis System**

#### **Repeat Training (Variance Estimation)**
- **Purpose**: Quantifies model instability across different datasets
- **Process**: Train multiple models on bootstrap samples of original data
- **Visualization**: Overlapping decision boundaries (gray lines)
- **Interpretation**: 
  - Tight boundaries = low variance, stable model
  - Spread boundaries = high variance, unstable model

#### **Bootstrap Confidence Intervals**
- **Statistical Method**: Bootstrap resampling with replacement
- **Purpose**: Estimates uncertainty in accuracy measurement
- **Process**: 
  1. Resample dataset 300-1000 times with replacement
  2. Calculate accuracy on each resample using trained model
  3. Compute 95% confidence interval using percentile method
- **Visualization**: Histogram with confidence interval bounds
- **Interpretation**: Narrow CI = confident estimate, Wide CI = uncertain estimate

### **5. Visualization System**

#### **Main Plot Canvas**
- **Technology**: HTML5 Canvas for high-performance rendering
- **Elements**:
  - **Data Points**: Blue circles (Class 0), Orange circles (Class 1)
  - **Decision Boundary**: White line at probability = 0.5
  - **Probability Heatmap**: Background colors showing model confidence
  - **Uncertainty Bounds**: Gray lines from repeat training
- **Interactions**: Real-time updates during training

#### **Statistical Displays**
- **Bootstrap Histogram**: Distribution of accuracy estimates
- **Stats Panel**: Numerical summaries and model parameters
- **Loss Sparkline**: Real-time training progress indicator

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

## ⚛️ React Application Core

### `src/index.tsx`
**Purpose**: React application entry point and DOM mounting.

**Responsibilities**:
- Creates React root using `ReactDOM.createRoot`
- Mounts App component in React.StrictMode
- Connects to `#root` element in HTML template

### `src/App.tsx` 🏛️
**Purpose**: Main application component orchestrating the entire UI and state management.

**Architecture**:
```typescript
// State Management
const [dataConfig, setDataConfig] = useState<GeneratorConfig>()     // Data generation params
const [modelConfig, setModelConfig] = useState<ModelConfig>()       // Training hyperparameters  
const [uncertaintyConfig, setUncertaintyConfig] = useState()        // Uncertainty analysis params
const [model, setModel] = useState<ModelState | null>()            // Trained model state
const [isTraining, setIsTraining] = useState<boolean>()            // Training status
const [uncertaintyBounds, setUncertaintyBounds] = useState()       // Multiple model boundaries
const [bootstrapAccuracies, setBootstrapAccuracies] = useState()   // Bootstrap samples
const [confidenceInterval, setConfidenceInterval] = useState()     // Statistical confidence interval
```

**Key Features**:
- **Reactive Data Generation**: Dataset regenerates when config changes
- **Training Management**: Handles model training, pause, reset operations
- **Uncertainty Analysis**: Coordinates repeat training and bootstrap sampling
- **Component Orchestration**: Manages communication between all UI components

**Layout Structure**:
```
┌─────────────────────────────────────────────────────────────┐
│ [ControlPanel: 360px] │ [Main Content: flex]                │
│                       │ ┌─────────────────────────────────┐ │
│ - Quick Presets       │ │ PlotCanvas (750x400)            │ │
│ - Data Generation     │ │ + LossSparkline overlay         │ │
│ - Model Training      │ └─────────────────────────────────┘ │
│ - Uncertainty Analysis│ ┌─────────────┬─────────────────┐   │
│                       │ │ Bootstrap   │ StatsPanel      │   │
│                       │ │ Histogram   │                 │   │
│                       │ └─────────────┴─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎛️ UI Components

### `src/components/ControlPanel.tsx`
**Purpose**: Comprehensive control interface for all application parameters.

**Component Architecture**:
```typescript
// Sub-components
<CollapsibleSection />  // Expandable/collapsible sections
<Slider />             // Custom range inputs with logarithmic support
<Select />             // Dropdown selectors
<Button />             // Consistent button styling
```

**Sections**:
1. **Quick Presets**: Educational scenario configurations
2. **Data Generation**: Distribution type, sample size, balance, noise control
3. **Model Training**: Regularization, learning rate, epochs, train/pause/reset
4. **Uncertainty Analysis**: Repeat runs and bootstrap sample configuration

**Key Features**:
- **Logarithmic Sliders**: Regularization parameter uses log10 scale
- **Real-time Updates**: All changes immediately trigger parent callbacks
- **Preset System**: One-click configuration for educational scenarios
- **Random Resampling**: Generate new data variations on demand

### `src/components/PlotCanvas.tsx` 🎨
**Purpose**: Main visualization component using HTML5 Canvas for high-performance rendering.

**Rendering Pipeline**:
1. **Data Preparation**: Scale data points to canvas coordinates using d3-scale
2. **Background Heatmap**: Probability surface with class-colored regions
3. **Uncertainty Bounds**: Semi-transparent decision boundaries from multiple models
4. **Main Decision Boundary**: Primary model's decision line
5. **Data Points**: Scatter plot with class-based coloring
6. **Axes & Labels**: Grid lines, tick marks, and axis labels

**Performance Optimizations**:
- **High-DPI Support**: Automatic device pixel ratio scaling
- **Coarse Heatmap Grid**: 2px grid for probability surface rendering
- **Efficient Redraws**: Canvas clearing and selective rendering
- **Temporary Canvas**: Off-screen heatmap rendering for better performance

**Visual Design**:
- **Color Scheme**: Blue (#3b82f6) for Class 0, Orange (#f97316) for Class 1
- **Decision Boundary**: White line with 3px width for visibility
- **Uncertainty Lines**: Gray semi-transparent lines (30% opacity)
- **Grid**: Subtle dotted lines for coordinate reference

### `src/components/LossSparkline.tsx`
**Purpose**: Real-time loss function visualization during training.

**Features**:
- **Overlay Positioning**: Absolute positioned in top-right of main plot
- **Adaptive Scaling**: Auto-scales Y-axis to loss value range
- **Emerald Line**: Green (#10b981) sparkline for loss progression
- **Current Value Display**: Shows latest loss value with monospace font
- **Smooth Animation**: Updates every 10 epochs during training

### `src/components/BootstrapHistogram.tsx`
**Purpose**: Statistical visualization of bootstrap accuracy distribution.

**Rendering Elements**:
- **Histogram Bars**: Blue bars showing accuracy frequency distribution
- **Mean Line**: Green vertical line at distribution mean
- **Confidence Interval**: Red dashed lines at 2.5% and 97.5% percentiles
- **Adaptive Binning**: Square root rule for optimal bin count
- **Axis Labels**: Accuracy (X) and Count (Y) with tick marks

**Statistical Features**:
- **Percentile Method**: 95% confidence interval calculation
- **Robust Binning**: Handles edge cases with minimum/maximum bin constraints
- **Clear Legends**: Mean accuracy and CI bounds clearly marked

### `src/components/StatsPanel.tsx`
**Purpose**: Comprehensive numerical summary of model and uncertainty statistics.

**Information Sections**:
1. **Dataset Info**: Sample size and train/validation split ratio
2. **Performance Metrics**: Train/validation accuracy and final loss
3. **Model Parameters**: Bias (w₀) and feature weights (w₁, w₂)
4. **Uncertainty Analysis**: Bootstrap mean, std deviation, confidence interval
5. **Educational Tips**: Interpretive guidance on bias-variance effects

**Formatting**:
- **Color Coding**: Green for training metrics, blue for validation, red for CI
- **Monospace Numbers**: Consistent numerical alignment
- **Percentage Display**: Accuracies shown as percentages with 1 decimal
- **Scientific Notation**: Parameters displayed with 3 decimal precision

---

## 🔧 Utility Functions

### `src/utils/dataGenerator.ts`
**Purpose**: Synthetic dataset generation with reproducible random sampling.

**Data Distributions**:

1. **Blobs (Gaussians)**:
   ```typescript
   // Two well-separated Gaussian distributions
   Class 0: μ = [-1, -1], σ = configurable noise
   Class 1: μ = [1, 1], σ = configurable noise
   ```

2. **Moons (Arcs)**:
   ```typescript
   // Two interlocking semicircular patterns
   Class 0: Upper semicircle from 0 to π
   Class 1: Lower semicircle, offset and inverted
   ```

**Key Features**:
- **Seedable Generation**: Uses SeededRandom for reproducibility
- **Configurable Balance**: Adjustable class proportion (0.1 to 0.9)
- **Noise Control**: Variable standard deviation for both distributions
- **Auto-bounds**: 10% margin calculation for plot boundaries
- **Point Shuffling**: Fisher-Yates shuffle for random ordering

### `src/utils/logisticRegression.ts`
**Purpose**: Core machine learning algorithms with numerical stability.

**Training Pipeline**:
```typescript
1. standardizeFeatures() → Feature normalization (z-score)
2. trainValSplit() → 80/20 random split  
3. trainLogisticRegression() → Gradient descent optimization
4. calculateAccuracy() → Performance evaluation
```

**Numerical Stability Features**:
- **Stable Sigmoid**: Handles large positive/negative logits without overflow
- **Clamped Probabilities**: Prevents log(0) in cross-entropy loss
- **L2 Regularization**: Penalizes large weights (excluding bias term)
- **Gradient Clipping**: Implicit through learning rate bounds
- **Progress Reporting**: Callback system for UI updates

**Algorithm Details**:
- **Optimizer**: Vanilla gradient descent (not SGD)
- **Loss Function**: Cross-entropy + L2 penalty
- **Weight Initialization**: Small random values around zero
- **Convergence**: Fixed epoch count (50-200 typical)

### `src/utils/presets.ts`
**Purpose**: Predefined configurations for educational scenarios.

**Educational Presets**:
1. **"Small & Noisy"**: Demonstrates high variance with limited data
2. **"Bigger Dataset"**: Shows variance reduction with more samples
3. **"High Regularization"**: Illustrates bias increase, variance decrease
4. **"Low Regularization"**: Potential overfitting demonstration

**Features**:
- **Quick Configuration**: Instant loading of educational scenarios
- **Comparative Analysis**: Easy switching between different setups
- **Educational Focus**: Each preset demonstrates specific ML concepts

### `src/utils/random.ts`
**Purpose**: High-quality seedable pseudorandom number generator.

**Implementation**: Mulberry32 algorithm
- **Period**: ~4.2 billion before repetition
- **Quality**: Passes standard randomness tests
- **Performance**: Fast bitwise operations
- **Reproducibility**: Identical sequences from same seed

**Distribution Methods**:
- `random()`: Uniform [0, 1)
- `uniform(min, max)`: Uniform in custom range
- `gaussian(μ, σ)`: Box-Muller transform for normal distribution

---

## 🔄 Hooks & Workers

### `src/hooks/useTrainingWorker.ts`
**Purpose**: React hook managing Web Worker communication for background computing.

**Job Types**:
1. **'training'**: Single model training with progress updates
2. **'repeat'**: Multiple model training for uncertainty bounds
3. **'bootstrap'**: Bootstrap resampling for confidence intervals

**Message Protocol**:
```typescript
// Outbound (Main → Worker)
{ type: 'train', data: { points, modelConfig, seed } }
{ type: 'repeatTraining', data: { points, modelConfig, numRuns, seed } }
{ type: 'bootstrap', data: { points, modelWeights, meanX, stdX, numSamples, seed } }

// Inbound (Worker → Main)  
{ type: 'progress', epoch, loss, trainAccuracy, valAccuracy }
{ type: 'complete', result: ModelState }
{ type: 'repeatComplete', results: ModelState[] }
{ type: 'bootstrapComplete', accuracies: number[], confidenceInterval: [number, number] }
```

**Error Handling**:
- Worker termination and recreation on job cancellation
- Graceful error propagation to UI
- Job state tracking to prevent race conditions

### `public/training-worker.js` ⚙️
**Purpose**: Web Worker implementation for CPU-intensive machine learning computations.

**Why Web Worker?**
- **Non-blocking UI**: Keeps interface responsive during training
- **Parallel Processing**: Leverages additional CPU cores
- **Progress Reporting**: Real-time training updates
- **Cancellable Jobs**: Can terminate long-running operations

**Inlined Dependencies**:
Since workers can't import ES modules, all utilities are inlined:
- SeededRandom class (identical to utils/random.ts)
- Sigmoid, loss, accuracy functions (from utils/logisticRegression.ts)
- Feature standardization and data splitting
- Bootstrap sampling logic

**Bootstrap Algorithm**:
```javascript
1. For each bootstrap sample:
   a. Resample original dataset with replacement
   b. Standardize using original μ and σ  
   c. Calculate accuracy with trained model
   d. Store accuracy value

2. Sort accuracies ascending
3. Extract 2.5% and 97.5% percentiles  
4. Return distribution + confidence interval
```

---

## 🔄 Data Flow Architecture

### Application State Flow
```
User Input (ControlPanel)
    ↓
App.tsx State Updates
    ↓
Dataset Generation (utils/dataGenerator)
    ↓
Training Request (hooks/useTrainingWorker)
    ↓
Web Worker Processing (public/training-worker.js)
    ↓
Model State Updates (App.tsx)
    ↓
Visualization Updates (PlotCanvas, StatsPanel, etc.)
```

### Training Pipeline
```
Raw DataPoints 
    → standardizeFeatures() 
    → trainValSplit() 
    → pointsToArrays()
    → trainLogisticRegression()
    → ModelState
```

### Uncertainty Analysis Pipeline
```
Original Dataset + Trained Model
    ↓
Repeat Training: Multiple bootstrap datasets → Multiple ModelStates
    ↓  
Bootstrap Sampling: Resampled datasets → Accuracy distribution
    ↓
Statistical Analysis: Percentile CI + Mean/Std calculation
```

---

## 🎓 Educational Value & Use Cases

### Core Learning Objectives
1. **Bias-Variance Tradeoff**: Visual demonstration through uncertainty bounds
2. **Regularization Effects**: λ parameter impact on model complexity
3. **Sample Size Impact**: How dataset size affects model stability  
4. **Distribution Sensitivity**: Linear vs non-linear separability
5. **Statistical Uncertainty**: Bootstrap confidence intervals

### Classroom Integration
- **Interactive Demonstrations**: Real-time parameter exploration
- **Homework Assignments**: Share specific configurations via URLs
- **Research Projects**: Export configurations for reproducible experiments
- **Self-Study Tool**: Guided experimentation with interpretation tips

### Advanced Features for Educators
- **Preset Scenarios**: Quick setup for common demonstrations
- **Shareable URLs**: Exact configuration reproduction
- **Visual Comparisons**: Side-by-side uncertainty visualization
- **Statistical Rigor**: Proper confidence interval methodology

---

## 🚀 Performance Considerations

### Optimization Strategies
1. **Canvas Rendering**: High-performance 2D graphics over SVG/HTML
2. **Web Workers**: Background processing prevents UI blocking
3. **Efficient Algorithms**: Numerically stable implementations
4. **Memory Management**: Float32Array for reduced memory footprint
5. **Selective Updates**: Only redraw when necessary

### Scalability Limits
- **Dataset Size**: Optimized for 50-1000 points (educational scale)
- **Training Epochs**: Reasonable limits (50-200) for responsiveness
- **Bootstrap Samples**: 100-1000 range for statistical validity
- **Uncertainty Runs**: 5-30 models for variance visualization

### Browser Compatibility
- **ES2017+ Features**: Modern JavaScript for performance
- **Canvas 2D Support**: Universal across modern browsers  
- **Web Workers**: Background processing capability
- **Clipboard API**: Share functionality with fallbacks

---

## 🔧 Development Workflow

### Getting Started
```bash
# Install dependencies
npm install

# Start development server  
npm start        # → http://localhost:3000

# Production build
npm run build    # → optimized build/ directory
```

### Key Development Commands
```bash
# Type checking
npx tsc --noEmit

# Tailwind class scanning
npx tailwindcss -i ./src/index.css -o ./dist/output.css --watch

# React development tools
# Install React DevTools browser extension for component inspection
```

### Code Organization Principles
1. **Component Separation**: UI components focus only on presentation
2. **Algorithm Isolation**: Pure functions in utils/ for testability
3. **Type Safety**: Comprehensive TypeScript interfaces
4. **Performance First**: Canvas over DOM manipulation for visualizations
5. **Educational Focus**: Clear naming and extensive documentation

---

## 🐛 Common Issues & Solutions

### Performance Issues
- **Slow Training**: Reduce epochs or use Web Worker cancellation
- **UI Lag**: Ensure computations are in Web Worker, not main thread
- **Memory Usage**: Monitor large datasets; current limits are educational-scale

### Browser Compatibility
- **Canvas Issues**: Ensure 2D context availability
- **Web Worker Errors**: Check console for import/syntax errors
- **Clipboard Fallbacks**: Share URL functionality has manual fallback

### Educational Troubleshooting
- **Confusing Results**: Use presets to demonstrate clear scenarios
- **Reproducibility**: Always check seed locking for consistent results
- **Interpretation**: Refer to built-in "What to Notice" guidance

---

## 📚 Further Reading & Extensions

### Potential Enhancements
1. **Additional Algorithms**: SVM, Neural Networks, Decision Trees
2. **More Distributions**: Circles, Spirals, Real datasets
3. **Advanced Visualizations**: Learning curves, ROC curves
4. **Export Functionality**: Save plots and data as images/CSV
5. **Collaborative Features**: Share live sessions between users

### Educational Extensions  
1. **Guided Tutorials**: Step-by-step interactive lessons
2. **Assessment Integration**: Quiz questions based on configurations
3. **Comparison Mode**: Side-by-side parameter exploration
4. **Real Dataset Upload**: CSV import for real-world examples

### Technical Improvements
1. **Testing Suite**: Unit tests for algorithms and components
2. **Accessibility**: ARIA labels, keyboard navigation
3. **Internationalization**: Multi-language support
4. **PWA Features**: Offline functionality, app installation

---

This documentation provides a comprehensive guide for developers to understand, maintain, and extend the StatML Lab application. Each file serves a specific purpose in creating an educational tool that effectively demonstrates fundamental machine learning concepts through interactive visualization.
