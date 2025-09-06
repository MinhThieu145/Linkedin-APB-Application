# StatML Lab — Sampling → Train → Uncertainty

A fast, modern, single-page web application for students to generate synthetic data, train a simple logistic regression model, and visualize uncertainty. Built with React, TypeScript, and Tailwind CSS.

## Features

### 🎯 **Core Functionality**
- **Data Generation**: Create 2D classification datasets with Blobs (Gaussians) or Moons distributions
- **Model Training**: Train logistic regression with L2 regularization using gradient descent
- **Interactive Visualization**: Real-time Canvas-based plotting with probability heatmaps and decision boundaries
- **Uncertainty Analysis**: Visualize model variance through repeat sampling and bootstrap confidence intervals

### 🎨 **Modern UI/UX**
- **Desktop-optimized layout**: No global scroll, viewport-fitted design
- **Dark theme**: Professional neutral color scheme with accessible blue/orange class colors
- **Responsive controls**: Collapsible panels, smooth transitions, keyboard navigation
- **Real-time feedback**: Live loss sparkline, training progress indicators

### ⚡ **Performance**
- **Web Workers**: Non-blocking training and bootstrap calculations
- **Canvas 2D rendering**: High-performance visualization with efficient redraws
- **Optimized algorithms**: Numerically stable implementations with proper safeguards

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

The application will be available at `http://localhost:3000`.

## Usage Guide

### 1. **Data Generation**
- Choose between **Blobs** (two Gaussians) or **Moons** (two arcs) distributions
- Adjust sample size (50-1000), class balance (0.1-0.9), and noise level
- Lock seed for reproducible results or resample for new data

### 2. **Model Training**
- Configure regularization strength (λ), learning rate (η), and epochs
- Click **Train** to start gradient descent (runs in Web Worker)
- Monitor progress with live loss sparkline and accuracy metrics
- **Pause** or **Reset** training as needed

### 3. **Uncertainty Analysis**
- Run **Uncertainty Analysis** to see model variance
- **Repeat runs**: Train multiple models to show decision boundary uncertainty
- **Bootstrap samples**: Generate confidence intervals for accuracy estimates
- View histogram of bootstrap accuracies with 95% CI

### 4. **Presets & Sharing**
- Use quick presets: "Small & Noisy", "Bigger Dataset", "High/Low Regularization"
- Copy shareable URLs to reproduce exact configurations
- Perfect for classroom demonstrations and homework assignments

## What to Notice

### **Bias-Variance Tradeoff**
- **Large n**: Reduces variance (uncertainty lines closer together)
- **High λ**: Increases bias, reduces variance (simpler model)
- **Low λ**: May overfit, higher variance (more complex boundary)

### **Sample Size Effects**
- Small datasets show higher uncertainty
- Larger datasets provide more stable estimates
- Bootstrap CI shows uncertainty in accuracy measurements

### **Regularization Impact**
- Strong regularization (high λ) → straighter decision boundaries
- Weak regularization (low λ) → more flexible boundaries
- Balance between underfitting and overfitting

## Technical Architecture

### **Frontend Stack**
- **React 18+** with TypeScript for type safety
- **Tailwind CSS** for modern, utility-first styling
- **d3-scale** for coordinate transformations
- **Canvas 2D API** for high-performance rendering

### **Key Components**
- `PlotCanvas`: Main visualization with scatter plot, heatmap, decision boundary
- `ControlPanel`: Interactive controls with sliders, selects, and buttons
- `BootstrapHistogram`: Statistical visualization of uncertainty
- `LossSparkline`: Real-time training progress indicator

### **Web Workers**
- `training-worker.js`: Handles model training, repeat sampling, and bootstrap calculations
- Keeps UI responsive during computationally intensive operations
- Supports progress reporting and job cancellation

### **Algorithms**
- **Seedable RNG**: Mulberry32 for reproducible results
- **Data generators**: Box-Muller for Gaussians, parametric arcs for moons
- **Logistic regression**: Numerically stable sigmoid, L2 regularization
- **Bootstrap CI**: Percentile method for confidence intervals

## Educational Value

This tool demonstrates key machine learning concepts:

1. **Dataset characteristics** affect model performance
2. **Regularization** controls model complexity
3. **Sample size** impacts estimation uncertainty
4. **Bootstrap methods** quantify statistical uncertainty
5. **Visual intuition** for bias-variance tradeoff

Perfect for:
- **ML/Statistics courses**: Hands-on bias-variance demonstration
- **Data science workshops**: Interactive parameter exploration
- **Research presentations**: Quick scenario generation
- **Self-study**: Experiment with different configurations

## Browser Support

- Modern browsers with ES2017+ support
- Web Workers for background processing
- Canvas 2D for visualization
- Clipboard API for sharing (with fallback)
