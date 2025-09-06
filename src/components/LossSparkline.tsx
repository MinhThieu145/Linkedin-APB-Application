import React, { useRef, useEffect } from 'react';

interface LossSparklineProps {
  losses: number[];
  width: number;
  height: number;
}

export const LossSparkline: React.FC<LossSparklineProps> = ({ losses, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || losses.length === 0) return;

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
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, width, height);

    if (losses.length < 2) return;

    // Find min/max for scaling
    const minLoss = Math.min(...losses);
    const maxLoss = Math.max(...losses);
    const range = maxLoss - minLoss;
    
    if (range === 0) return;

    // Draw sparkline
    ctx.strokeStyle = '#10b981'; // emerald-500
    ctx.lineWidth = 2;
    ctx.beginPath();

    const padding = 4;
    const plotWidth = width - 2 * padding;
    const plotHeight = height - 2 * padding;

    losses.forEach((loss, i) => {
      const x = padding + (i / (losses.length - 1)) * plotWidth;
      const y = padding + (1 - (loss - minLoss) / range) * plotHeight;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw current loss value
    ctx.fillStyle = '#f3f4f6';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Loss: ${losses[losses.length - 1].toFixed(3)}`, width - 4, 12);

  }, [losses, width, height]);

  return (
    <div className="absolute top-2 right-2 bg-black/80 rounded border border-neutral-600">
      <canvas ref={canvasRef} style={{ width, height }} />
    </div>
  );
};
