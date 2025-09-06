import { useCallback, useRef, useEffect } from 'react';
import { DataPoint } from '../utils/dataGenerator';
import { ModelConfig, ModelState } from '../utils/logisticRegression';

interface TrainingWorkerHook {
  trainModel: (points: DataPoint[], config: ModelConfig, seed?: number) => void;
  runRepeatTraining: (points: DataPoint[], config: ModelConfig, numRuns: number, seed?: number) => void;
  runBootstrap: (points: DataPoint[], weights: Float32Array, meanX: Float32Array, stdX: Float32Array, numSamples: number, seed?: number) => void;
  cancelCurrentJob: () => void;
}

interface UseTrainingWorkerProps {
  onTrainingProgress?: (epoch: number, loss: number, trainAcc: number, valAcc: number) => void;
  onTrainingComplete?: (result: ModelState) => void;
  onRepeatProgress?: (completed: number, total: number) => void;
  onRepeatComplete?: (results: ModelState[]) => void;
  onBootstrapProgress?: (completed: number, total: number) => void;
  onBootstrapComplete?: (accuracies: number[], confidenceInterval: [number, number]) => void;
  onError?: (error: string) => void;
}

export const useTrainingWorker = ({
  onTrainingProgress,
  onTrainingComplete,
  onRepeatProgress,
  onRepeatComplete,
  onBootstrapProgress,
  onBootstrapComplete,
  onError
}: UseTrainingWorkerProps): TrainingWorkerHook => {
  const workerRef = useRef<Worker | null>(null);
  const currentJobRef = useRef<string | null>(null);

  // Initialize worker
  useEffect(() => {
    workerRef.current = new Worker(`${process.env.PUBLIC_URL}/training-worker.js`);
    
    workerRef.current.onmessage = (e) => {
      const { type, ...data } = e.data;
      
      switch (type) {
        case 'progress':
          if (currentJobRef.current === 'training' && onTrainingProgress) {
            onTrainingProgress(data.epoch, data.loss, data.trainAccuracy, data.valAccuracy);
          }
          break;
          
        case 'complete':
          if (currentJobRef.current === 'training' && onTrainingComplete) {
            onTrainingComplete(data.result);
          }
          currentJobRef.current = null;
          break;
          
        case 'repeatProgress':
          if (currentJobRef.current === 'repeat' && onRepeatProgress) {
            onRepeatProgress(data.completed, data.total);
          }
          break;
          
        case 'repeatComplete':
          if (currentJobRef.current === 'repeat' && onRepeatComplete) {
            onRepeatComplete(data.results);
          }
          currentJobRef.current = null;
          break;
          
        case 'bootstrapProgress':
          if (currentJobRef.current === 'bootstrap' && onBootstrapProgress) {
            onBootstrapProgress(data.completed, data.total);
          }
          break;
          
        case 'bootstrapComplete':
          if (currentJobRef.current === 'bootstrap' && onBootstrapComplete) {
            onBootstrapComplete(data.accuracies, data.confidenceInterval);
          }
          currentJobRef.current = null;
          break;
          
        case 'error':
          if (onError) {
            onError(data.error);
          }
          currentJobRef.current = null;
          break;
      }
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [onTrainingProgress, onTrainingComplete, onRepeatProgress, onRepeatComplete, onBootstrapProgress, onBootstrapComplete, onError]);

  const trainModel = useCallback((points: DataPoint[], config: ModelConfig, seed?: number) => {
    if (!workerRef.current) return;
    
    currentJobRef.current = 'training';
    workerRef.current.postMessage({
      type: 'train',
      data: {
        points,
        modelConfig: config,
        seed: seed || Date.now()
      }
    });
  }, []);

  const runRepeatTraining = useCallback((points: DataPoint[], config: ModelConfig, numRuns: number, seed?: number) => {
    if (!workerRef.current) return;
    
    currentJobRef.current = 'repeat';
    workerRef.current.postMessage({
      type: 'repeatTraining',
      data: {
        points,
        modelConfig: config,
        numRuns,
        seed: seed || Date.now()
      }
    });
  }, []);

  const runBootstrap = useCallback((
    points: DataPoint[], 
    weights: Float32Array, 
    meanX: Float32Array, 
    stdX: Float32Array, 
    numSamples: number, 
    seed?: number
  ) => {
    if (!workerRef.current) return;
    
    currentJobRef.current = 'bootstrap';
    workerRef.current.postMessage({
      type: 'bootstrap',
      data: {
        points,
        modelWeights: weights,
        meanX,
        stdX,
        numSamples,
        seed: seed || Date.now()
      }
    });
  }, []);

  const cancelCurrentJob = useCallback(() => {
    if (workerRef.current && currentJobRef.current) {
      workerRef.current.terminate();
      workerRef.current = new Worker(`${process.env.PUBLIC_URL}/training-worker.js`);
      currentJobRef.current = null;
      
      // Re-setup message handler (same logic as in useEffect)
      // We would need to duplicate the message handler logic here
    }
  }, []);

  return {
    trainModel,
    runRepeatTraining,
    runBootstrap,
    cancelCurrentJob
  };
};
