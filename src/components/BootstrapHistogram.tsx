import React, { useRef, useEffect } from 'react';
import { HelpTooltip, AITooltip, BootstrapAIAnalysis } from './HelpTooltip';

interface BootstrapHistogramProps {
  accuracies: number[];
  width: number;
  height: number;
  confidenceInterval?: [number, number];
  isDemoMode?: boolean;
}

export const BootstrapHistogram: React.FC<BootstrapHistogramProps> = ({
  accuracies,
  width,
  height,
  confidenceInterval,
  isDemoMode = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || accuracies.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = '#171717'; // neutral-900
    ctx.fillRect(0, 0, width, height);

    // Calculate histogram
    const minAcc = Math.min(...accuracies);
    const maxAcc = Math.max(...accuracies);
    const range = maxAcc - minAcc;
    
    if (range === 0) return;

    const numBins = Math.min(20, Math.max(5, Math.floor(Math.sqrt(accuracies.length))));
    const binWidth = range / numBins;
    const bins = new Array(numBins).fill(0);

    // Fill bins
    accuracies.forEach(acc => {
      const binIndex = Math.min(numBins - 1, Math.floor((acc - minAcc) / binWidth));
      bins[binIndex]++;
    });

    const maxCount = Math.max(...bins);
    if (maxCount === 0) return;

    // Drawing setup
    const padding = { left: 40, right: 20, top: 20, bottom: 40 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    // Draw bars
    ctx.fillStyle = '#3b82f6'; // blue-500
    bins.forEach((count, i) => {
      const barWidth = plotWidth / numBins;
      const barHeight = (count / maxCount) * plotHeight;
      const x = padding.left + i * barWidth;
      const y = padding.top + plotHeight - barHeight;
      
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });

    // Draw confidence interval if provided
    if (confidenceInterval) {
      ctx.strokeStyle = '#ef4444'; // red-500
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      // Lower bound
      const lowerX = padding.left + ((confidenceInterval[0] - minAcc) / range) * plotWidth;
      ctx.beginPath();
      ctx.moveTo(lowerX, padding.top);
      ctx.lineTo(lowerX, padding.top + plotHeight);
      ctx.stroke();
      
      // Upper bound
      const upperX = padding.left + ((confidenceInterval[1] - minAcc) / range) * plotWidth;
      ctx.beginPath();
      ctx.moveTo(upperX, padding.top);
      ctx.lineTo(upperX, padding.top + plotHeight);
      ctx.stroke();
      
      ctx.setLineDash([]);
    }

    // Draw mean line
    const mean = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    const meanX = padding.left + ((mean - minAcc) / range) * plotWidth;
    ctx.strokeStyle = '#10b981'; // emerald-500
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(meanX, padding.top);
    ctx.lineTo(meanX, padding.top + plotHeight);
    ctx.stroke();

    // Draw axes
    ctx.strokeStyle = '#6b7280'; // neutral-500
    ctx.lineWidth = 1;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + plotHeight);
    ctx.lineTo(padding.left + plotWidth, padding.top + plotHeight);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + plotHeight);
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = '#d1d5db'; // neutral-300
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    
    // X-axis labels
    const xTicks = 5;
    for (let i = 0; i <= xTicks; i++) {
      const value = minAcc + (range * i) / xTicks;
      const x = padding.left + (plotWidth * i) / xTicks;
      ctx.fillText(value.toFixed(3), x, height - 20);
    }
    
    // Y-axis labels
    ctx.textAlign = 'right';
    const yTicks = 4;
    for (let i = 0; i <= yTicks; i++) {
      const value = (maxCount * i) / yTicks;
      const y = padding.top + plotHeight - (plotHeight * i) / yTicks;
      ctx.fillText(Math.round(value).toString(), padding.left - 5, y + 3);
    }
    
    // Axis titles
    ctx.textAlign = 'center';
    ctx.fillText('Accuracy', width / 2, height - 5);
    
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Count', 0, 0);
    ctx.restore();

  }, [accuracies, width, height, confidenceInterval]);

  const bootstrapHelp = (
    <div className="space-y-3">
      <div>
        <strong className="text-blue-300">What is Bootstrap?</strong>
        <p>Resamples your dataset with replacement many times to estimate the uncertainty in your accuracy measurement.</p>
      </div>
      
      <div>
        <strong className="text-orange-300">What you see:</strong>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li><strong>Blue bars:</strong> Frequency of different accuracy values</li>
          <li><strong>Green line:</strong> Mean accuracy across all samples</li>
          <li><strong>Red dashed lines:</strong> 95% confidence interval bounds</li>
        </ul>
      </div>
      
      <div>
        <strong className="text-green-300">Interpretation:</strong>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li><strong>Narrow distribution:</strong> Confident about performance</li>
          <li><strong>Wide distribution:</strong> Uncertain about true accuracy</li>
          <li><strong>CI width:</strong> Shows precision of your estimate</li>
        </ul>
      </div>
      
      <div className="bg-neutral-700 p-2 rounded text-xs">
        <strong>💡 Key insight:</strong> Larger datasets typically produce narrower confidence intervals (more certainty).
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-sm font-medium text-neutral-200">Bootstrap Accuracy Distribution</h3>
        <HelpTooltip
          title="🔄 Bootstrap Uncertainty"
          content={bootstrapHelp}
          size="lg"
        />
        <AITooltip
          title="AI Bootstrap Analysis"
          content={<BootstrapAIAnalysis isDemoMode={isDemoMode} />}
          size="lg"
          isDemoMode={isDemoMode}
          show={accuracies.length > 0}
        />
      </div>
      <canvas
        ref={canvasRef}
        className="border border-neutral-700 rounded bg-neutral-900"
        style={{ width, height }}
      />
    </div>
  );
};
