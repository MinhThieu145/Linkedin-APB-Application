import React from 'react';
import { ModelState } from '../utils/logisticRegression';

interface StatsPanelProps {
  model: ModelState | null;
  datasetSize: number;
  uncertaintyStats?: {
    meanAccuracy: number;
    stdAccuracy: number;
    confidenceInterval: [number, number];
  };
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  model,
  datasetSize,
  uncertaintyStats
}) => {
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatNumber = (value: number, decimals: number = 3) => value.toFixed(decimals);

  return (
    <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-lg h-full overflow-y-auto min-h-0">
      <h3 className="text-sm font-medium text-neutral-200 mb-4">Model Statistics</h3>
      
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
