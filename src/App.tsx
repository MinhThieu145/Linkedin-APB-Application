import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { PlotCanvas } from './components/PlotCanvas';
import { LossSparkline } from './components/LossSparkline';
import { BootstrapHistogram } from './components/BootstrapHistogram';
import { StatsPanel } from './components/StatsPanel';
import { generateData, GeneratorConfig } from './utils/dataGenerator';
import { ModelConfig, ModelState } from './utils/logisticRegression';
import { useTrainingWorker } from './hooks/useTrainingWorker';
import { loadStateFromUrl } from './utils/presets';

// Default configurations
const DEFAULT_DATA_CONFIG: GeneratorConfig = {
  distribution: 'blobs',
  n: 300,
  balance: 0.5,
  noise: 0.9,
  seed: 42
};

const DEFAULT_MODEL_CONFIG: ModelConfig = {
  lambda: 0.01,
  learningRate: 0.05,
  epochs: 100
};

const DEFAULT_UNCERTAINTY_CONFIG = {
  repeatRuns: 10,
  bootstrapSamples: 300
};

function App() {
  // Configuration states
  const [dataConfig, setDataConfig] = useState<GeneratorConfig>(DEFAULT_DATA_CONFIG);
  const [modelConfig, setModelConfig] = useState<ModelConfig>(DEFAULT_MODEL_CONFIG);
  const [uncertaintyConfig, setUncertaintyConfig] = useState(DEFAULT_UNCERTAINTY_CONFIG);

  // Load state from URL on mount
  useEffect(() => {
    const urlState = loadStateFromUrl();
    if (urlState) {
      if (urlState.dataConfig) {
        setDataConfig(prev => ({ ...prev, ...urlState.dataConfig }));
      }
      if (urlState.modelConfig) {
        setModelConfig(prev => ({ ...prev, ...urlState.modelConfig }));
      }
    }
  }, []);

  // App states
  const [model, setModel] = useState<ModelState | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [uncertaintyBounds, setUncertaintyBounds] = useState<Float32Array[]>([]);
  const [bootstrapAccuracies, setBootstrapAccuracies] = useState<number[]>([]);
  const [confidenceInterval, setConfidenceInterval] = useState<[number, number] | undefined>();

  // Generate dataset
  const dataset = useMemo(() => generateData(dataConfig), [dataConfig]);

  // Training worker
  const trainingWorker = useTrainingWorker({
    onTrainingProgress: (epoch, loss, trainAcc, valAcc) => {
      // Update model state with progress
      if (model) {
        setModel(prev => prev ? {
          ...prev,
          trainAccuracy: trainAcc,
          valAccuracy: valAcc,
          losses: [...prev.losses, loss]
        } : null);
      }
    },
    onTrainingComplete: (result) => {
      setModel(result);
      setIsTraining(false);
    },
    onRepeatComplete: (results) => {
      // Extract boundary weights for uncertainty visualization
      const bounds = results.map(result => result.weights);
      setUncertaintyBounds(bounds);
    },
    onBootstrapComplete: (accuracies, ci) => {
      setBootstrapAccuracies(accuracies);
      setConfidenceInterval(ci);
    },
    onError: (error) => {
      console.error('Training worker error:', error);
      setIsTraining(false);
    }
  });

  // Event handlers
  const handleDataConfigChange = useCallback((config: Partial<GeneratorConfig>) => {
    setDataConfig(prev => ({ ...prev, ...config }));
    // Reset model when data changes
    setModel(null);
    setUncertaintyBounds([]);
    setBootstrapAccuracies([]);
    setConfidenceInterval(undefined);
  }, []);

  const handleModelConfigChange = useCallback((config: Partial<ModelConfig>) => {
    setModelConfig(prev => ({ ...prev, ...config }));
  }, []);

  const handleUncertaintyConfigChange = useCallback((config: Partial<typeof uncertaintyConfig>) => {
    setUncertaintyConfig(prev => ({ ...prev, ...config }));
  }, []);

  const handleResample = useCallback(() => {
    const newSeed = Date.now();
    setDataConfig(prev => ({ ...prev, seed: newSeed }));
  }, []);

  const handleTrain = useCallback(() => {
    if (dataset.points.length === 0) return;
    
    setIsTraining(true);
    setModel(null);
    trainingWorker.trainModel(dataset.points, modelConfig, dataConfig.seed);
  }, [dataset.points, modelConfig, dataConfig.seed, trainingWorker]);

  const handlePause = useCallback(() => {
    trainingWorker.cancelCurrentJob();
    setIsTraining(false);
  }, [trainingWorker]);

  const handleReset = useCallback(() => {
    trainingWorker.cancelCurrentJob();
    setModel(null);
    setIsTraining(false);
    setUncertaintyBounds([]);
    setBootstrapAccuracies([]);
    setConfidenceInterval(undefined);
  }, [trainingWorker]);

  const handleRunUncertainty = useCallback(() => {
    if (!model || dataset.points.length === 0) return;
    
    // Run repeat training for uncertainty bounds
    trainingWorker.runRepeatTraining(
      dataset.points, 
      modelConfig, 
      uncertaintyConfig.repeatRuns, 
      dataConfig.seed
    );
    
    // Run bootstrap for confidence intervals
    trainingWorker.runBootstrap(
      dataset.points,
      model.weights,
      model.meanX,
      model.stdX,
      uncertaintyConfig.bootstrapSamples,
      dataConfig.seed
    );
  }, [model, dataset.points, modelConfig, uncertaintyConfig, dataConfig.seed, trainingWorker]);

  const handleApplyPreset = useCallback((dataConfigUpdate: Partial<GeneratorConfig>, modelConfigUpdate: Partial<ModelConfig>) => {
    setDataConfig(prev => ({ ...prev, ...dataConfigUpdate }));
    setModelConfig(prev => ({ ...prev, ...modelConfigUpdate }));
    // Reset model when preset is applied
    setModel(null);
    setUncertaintyBounds([]);
    setBootstrapAccuracies([]);
    setConfidenceInterval(undefined);
  }, []);

  // Calculate uncertainty statistics
  const uncertaintyStats = useMemo(() => {
    if (bootstrapAccuracies.length === 0) return undefined;
    
    const mean = bootstrapAccuracies.reduce((sum, acc) => sum + acc, 0) / bootstrapAccuracies.length;
    const variance = bootstrapAccuracies.reduce((sum, acc) => sum + Math.pow(acc - mean, 2), 0) / bootstrapAccuracies.length;
    const std = Math.sqrt(variance);
    
    return {
      meanAccuracy: mean,
      stdAccuracy: std,
      confidenceInterval: confidenceInterval || [0, 0] as [number, number]
    };
  }, [bootstrapAccuracies, confidenceInterval]);

  const canTrain = dataset.points.length > 0 && !isTraining;

  return (
    <div className="h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100">
      <div className="grid h-full grid-cols-[360px_1fr] gap-4 p-4">
        {/* Left Panel - Controls */}
        <ControlPanel
          dataConfig={dataConfig}
          modelConfig={modelConfig}
          uncertaintyConfig={uncertaintyConfig}
          onDataConfigChange={handleDataConfigChange}
          onModelConfigChange={handleModelConfigChange}
          onUncertaintyConfigChange={handleUncertaintyConfigChange}
          onResample={handleResample}
          onTrain={handleTrain}
          onPause={handlePause}
          onReset={handleReset}
          onRunUncertainty={handleRunUncertainty}
          onApplyPreset={handleApplyPreset}
          isTraining={isTraining}
          canTrain={canTrain}
        />

        {/* Right Area */}
        <div className="flex flex-col gap-4 min-h-0 max-h-full">
          {/* Main Plot Area - Fixed height to prevent overflow */}
          <div className="relative flex-1 min-h-[350px] max-h-[450px] flex items-center justify-center">
            <PlotCanvas
              dataset={dataset}
              model={model}
              width={750} // Fixed reasonable width
              height={400} // Fixed reasonable height
              uncertaintyBounds={uncertaintyBounds}
            />
            
            {/* Loss Sparkline Overlay */}
            {model && model.losses.length > 0 && (
              <LossSparkline
                losses={model.losses}
                width={200}
                height={80}
              />
            )}
          </div>

          {/* Bottom Strip - Fixed height */}
          <div className="grid grid-cols-2 gap-4 h-60 min-h-60 max-h-60">
            {/* Bootstrap Histogram */}
            <div className="min-h-0 overflow-auto scrollbar-dark">
              {bootstrapAccuracies.length > 0 ? (
                <BootstrapHistogram
                  accuracies={bootstrapAccuracies}
                  width={380} // Fixed width that fits well
                  height={220}
                  confidenceInterval={confidenceInterval}
                />
              ) : (
                <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-lg h-full flex items-center justify-center">
                  <span className="text-neutral-500 text-sm">
                    Run uncertainty analysis to see bootstrap distribution
                  </span>
                </div>
              )}
            </div>

            {/* Stats Panel */}
            <div className="min-h-0 overflow-auto scrollbar-dark">
              <StatsPanel
                model={model}
                datasetSize={dataset.points.length}
                uncertaintyStats={uncertaintyStats}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
