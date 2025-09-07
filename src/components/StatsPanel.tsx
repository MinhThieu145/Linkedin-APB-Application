import React from 'react';
import { ModelState } from '../utils/logisticRegression';
import { HelpTooltip, AITooltip, StatsAIAnalysis } from './HelpTooltip';

interface StatsPanelProps {
  model: ModelState | null;
  datasetSize: number;
  uncertaintyStats?: {
    meanAccuracy: number;
    stdAccuracy: number;
    confidenceInterval: [number, number];
  };
  isDemoMode?: boolean;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  model,
  datasetSize,
  uncertaintyStats,
  isDemoMode = false
}) => {
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatNumber = (value: number, decimals: number = 3) => value.toFixed(decimals);

  const statsHelp = (
    <div className="space-y-3">
      <div>
        <strong className="text-blue-300">Performance Metrics:</strong>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li><strong>Train Accuracy:</strong> How well the model fits the training data</li>
          <li><strong>Val Accuracy:</strong> How well it generalizes to new data</li>
          <li><strong>Gap:</strong> Large difference suggests overfitting</li>
        </ul>
      </div>
      
      <div>
        <strong className="text-orange-300">Model Parameters:</strong>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li><strong>Bias (w₀):</strong> Shifts the decision boundary</li>
          <li><strong>Weights (w₁, w₂):</strong> Determine boundary slope and orientation</li>
        </ul>
      </div>
      
      <div>
        <strong className="text-green-300">Uncertainty Analysis:</strong>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li><strong>Mean Accuracy:</strong> Average performance across bootstrap samples</li>
          <li><strong>95% CI:</strong> Range where true accuracy likely lies</li>
          <li><strong>Std Deviation:</strong> Spread of accuracy estimates</li>
        </ul>
      </div>
      
      <div className="bg-neutral-700 p-2 rounded text-xs">
        <strong>💡 Watch for:</strong> Large train-val gaps (overfitting) and wide confidence intervals (high uncertainty).
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-lg h-full overflow-y-auto min-h-0">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-medium text-neutral-200">Model Statistics</h3>
        <HelpTooltip
          title="📊 Understanding the Numbers"
          content={statsHelp}
          size="lg"
        />
        <AITooltip
          title="AI Statistical Analysis"
          content={<StatsAIAnalysis isDemoMode={isDemoMode} />}
          size="lg"
          isDemoMode={isDemoMode}
          show={model !== null}
        />
      </div>
      
      <div className="space-y-4 text-sm">
        {/* Dataset Info */}
        <div>
          <h4 className="text-neutral-300 font-medium mb-2">Dataset</h4>
          <div className="space-y-1 text-neutral-400">
            <div className="flex justify-between">
              <span>Total samples:</span>
              <span className="font-mono">{datasetSize}</span>
            </div>
            <div className="flex justify-between">
              <span>Train/Val split:</span>
              <span className="font-mono">80/20</span>
            </div>
          </div>
        </div>

        {/* Model Performance */}
        {model && (
          <div>
            <h4 className="text-neutral-300 font-medium mb-2">Performance</h4>
            <div className="space-y-1 text-neutral-400">
              <div className="flex justify-between">
                <span>Train accuracy:</span>
                <span className="font-mono text-green-400">
                  {formatPercent(model.trainAccuracy)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Val accuracy:</span>
                <span className="font-mono text-blue-400">
                  {formatPercent(model.valAccuracy)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Final loss:</span>
                <span className="font-mono">
                  {model.losses.length > 0 ? formatNumber(model.losses[model.losses.length - 1]) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Model Parameters */}
        {model && (
          <div>
            <h4 className="text-neutral-300 font-medium mb-2">Parameters</h4>
            <div className="space-y-1 text-neutral-400">
              <div className="flex justify-between">
                <span>Bias (w₀):</span>
                <span className="font-mono">{formatNumber(model.weights[0])}</span>
              </div>
              <div className="flex justify-between">
                <span>Weight 1 (w₁):</span>
                <span className="font-mono">{formatNumber(model.weights[1])}</span>
              </div>
              <div className="flex justify-between">
                <span>Weight 2 (w₂):</span>
                <span className="font-mono">{formatNumber(model.weights[2])}</span>
              </div>
            </div>
          </div>
        )}

        {/* Uncertainty Statistics */}
        {uncertaintyStats && (
          <div>
            <h4 className="text-neutral-300 font-medium mb-2">Uncertainty Analysis</h4>
            <div className="space-y-1 text-neutral-400">
              <div className="flex justify-between">
                <span>Mean accuracy:</span>
                <span className="font-mono text-green-400">
                  {formatPercent(uncertaintyStats.meanAccuracy)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Std deviation:</span>
                <span className="font-mono">
                  {formatPercent(uncertaintyStats.stdAccuracy)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>95% CI lower:</span>
                <span className="font-mono text-red-400">
                  {formatPercent(uncertaintyStats.confidenceInterval[0])}
                </span>
              </div>
              <div className="flex justify-between">
                <span>95% CI upper:</span>
                <span className="font-mono text-red-400">
                  {formatPercent(uncertaintyStats.confidenceInterval[1])}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Interpretation Tips */}
        <div>
          <h4 className="text-neutral-300 font-medium mb-2">What to Notice</h4>
          <div className="text-xs text-neutral-500 space-y-2">
            <p>
              <strong>Large n:</strong> Reduces variance (uncertainty lines closer).
            </p>
            <p>
              <strong>High λ:</strong> Increases bias, reduces variance (simpler model).
            </p>
            <p>
              <strong>Low λ:</strong> May overfit, higher variance.
            </p>
            <p>
              <strong>Bootstrap CI:</strong> Shows uncertainty in accuracy estimates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
