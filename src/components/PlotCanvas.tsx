import React, { useRef, useEffect, useCallback } from 'react';
import { scaleLinear } from 'd3-scale';
import { Dataset } from '../utils/dataGenerator';
import { ModelState, predictProba } from '../utils/logisticRegression';

interface PlotCanvasProps {
  dataset: Dataset | null;
  model: ModelState | null;
  width: number;
  height: number;
  uncertaintyBounds?: Float32Array[]; // Array of boundary lines for uncertainty visualization
}

const COLORS = {
  class0: '#3b82f6', // blue
  class1: '#f97316', // orange
  background: '#0a0a0a',
  grid: '#374151',
  boundary: '#ffffff',
  uncertaintyBound: '#6b7280'
};

export const PlotCanvas: React.FC<PlotCanvasProps> = ({
  dataset,
  model,
  width,
  height,
  uncertaintyBounds = []
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dataset) return;

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
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);

    const { bounds } = dataset;
    
    // Create scales
    const xScale = scaleLinear()
      .domain([bounds.xMin, bounds.xMax])
      .range([40, width - 20]);
    
    const yScale = scaleLinear()
      .domain([bounds.yMin, bounds.yMax])
      .range([height - 40, 20]);

    // Draw grid
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 2]);
    
    // Vertical grid lines
    const xTicks = xScale.ticks(10);
    xTicks.forEach(tick => {
      const x = xScale(tick);
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, height - 40);
      ctx.stroke();
    });
    
    // Horizontal grid lines
    const yTicks = yScale.ticks(8);
    yTicks.forEach(tick => {
      const y = yScale(tick);
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();
    });
    
    ctx.setLineDash([]);

    // Draw probability heatmap if model exists
    if (model) {
      const gridSize = 2; // Coarse grid for performance
      const imageData = ctx.createImageData(Math.ceil(width / gridSize), Math.ceil(height / gridSize));
      const data = imageData.data;
      
      for (let i = 0; i < imageData.width; i++) {
        for (let j = 0; j < imageData.height; j++) {
          const x = xScale.invert(i * gridSize);
          const y = yScale.invert(j * gridSize);
          const prob = predictProba(x, y, model.weights, model.meanX, model.stdX);
          
          const idx = (j * imageData.width + i) * 4;
          if (prob > 0.5) {
            // Orange for class 1
            data[idx] = 249;     // R
            data[idx + 1] = 115; // G
            data[idx + 2] = 22;  // B
            data[idx + 3] = Math.floor(30 * (prob - 0.5) * 2); // Alpha
          } else {
            // Blue for class 0
            data[idx] = 59;      // R
            data[idx + 1] = 130; // G
            data[idx + 2] = 246; // B
            data[idx + 3] = Math.floor(30 * (0.5 - prob) * 2); // Alpha
          }
        }
      }
      
      // Create temporary canvas for the heatmap
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imageData.width;
      tempCanvas.height = imageData.height;
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.putImageData(imageData, 0, 0);
      
      // Draw scaled heatmap
      ctx.drawImage(tempCanvas, 0, 0, width, height);
    }

    // Draw uncertainty boundary lines
    if (uncertaintyBounds.length > 0 && model) {
      ctx.strokeStyle = COLORS.uncertaintyBound;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      
      uncertaintyBounds.forEach(weights => {
        // Draw decision boundary (p = 0.5)
        // w0 + w1*x + w2*y = 0
        // y = -(w0 + w1*x) / w2
        if (Math.abs(weights[2]) > 1e-8) {
          ctx.beginPath();
          const x1 = bounds.xMin;
          const x2 = bounds.xMax;
          const y1 = -(weights[0] + weights[1] * ((x1 - model.meanX[0]) / model.stdX[0])) / weights[2] * model.stdX[1] + model.meanX[1];
          const y2 = -(weights[0] + weights[1] * ((x2 - model.meanX[0]) / model.stdX[0])) / weights[2] * model.stdX[1] + model.meanX[1];
          
          ctx.moveTo(xScale(x1), yScale(y1));
          ctx.lineTo(xScale(x2), yScale(y2));
          ctx.stroke();
        }
      });
      
      ctx.globalAlpha = 1;
    }

    // Draw main decision boundary
    if (model) {
      ctx.strokeStyle = COLORS.boundary;
      ctx.lineWidth = 3;
      
      // Draw decision boundary (p = 0.5)
      if (Math.abs(model.weights[2]) > 1e-8) {
        ctx.beginPath();
        const x1 = bounds.xMin;
        const x2 = bounds.xMax;
        const y1 = -(model.weights[0] + model.weights[1] * ((x1 - model.meanX[0]) / model.stdX[0])) / model.weights[2] * model.stdX[1] + model.meanX[1];
        const y2 = -(model.weights[0] + model.weights[1] * ((x2 - model.meanX[0]) / model.stdX[0])) / model.weights[2] * model.stdX[1] + model.meanX[1];
        
        ctx.moveTo(xScale(x1), yScale(y1));
        ctx.lineTo(xScale(x2), yScale(y2));
        ctx.stroke();
      }
    }

    // Draw data points
    ctx.globalAlpha = 0.7;
    dataset.points.forEach(point => {
      const x = xScale(point.x);
      const y = yScale(point.y);
      
      ctx.fillStyle = point.label === 0 ? COLORS.class0 : COLORS.class1;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw axes labels
    ctx.fillStyle = '#d1d5db';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('X₁', width / 2, height - 10);
    
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('X₂', 0, 0);
    ctx.restore();

    // Draw tick labels
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    xTicks.forEach(tick => {
      const x = xScale(tick);
      ctx.fillText(tick.toFixed(1), x, height - 25);
    });
    
    ctx.textAlign = 'right';
    yTicks.forEach(tick => {
      const y = yScale(tick);
      ctx.fillText(tick.toFixed(1), 35, y + 3);
    });

  }, [dataset, model, width, height, uncertaintyBounds]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="border border-neutral-700 rounded-lg bg-neutral-950"
      style={{ width, height }}
    />
  );
};
