import React from 'react';
import { GeneratorConfig } from '../utils/dataGenerator';
import { ModelConfig } from '../utils/logisticRegression';
import { PRESETS, generateShareUrl } from '../utils/presets';
import { HelpTooltip, DataGenerationHelp, ModelTrainingHelp, UncertaintyHelp, PresetsHelp } from './HelpTooltip';

interface ControlPanelProps {
  dataConfig: GeneratorConfig;
  modelConfig: ModelConfig;
  uncertaintyConfig: {
    repeatRuns: number;
    bootstrapSamples: number;
  };
  onDataConfigChange: (config: Partial<GeneratorConfig>) => void;
  onModelConfigChange: (config: Partial<ModelConfig>) => void;
  onUncertaintyConfigChange: (config: Partial<{ repeatRuns: number; bootstrapSamples: number }>) => void;
  onResample: () => void;
  onTrain: () => void;
  onPause: () => void;
  onReset: () => void;
  onRunUncertainty: () => void;
  onApplyPreset: (dataConfig: Partial<GeneratorConfig>, modelConfig: Partial<ModelConfig>) => void;
  isTraining: boolean;
  canTrain: boolean;
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  tooltip?: string;
  isLog?: boolean;
}

const Slider: React.FC<SliderProps> = ({ 
  label, 
  value, 
  min, 
  max, 
  step, 
  onChange, 
  tooltip,
  isLog = false 
}) => {
  const displayValue = isLog ? Math.pow(10, value) : value;
  const formatValue = (val: number) => {
    if (isLog) {
      return val < 0.01 ? val.toExponential(1) : val.toFixed(3);
    }
    return val.toFixed(step < 1 ? 2 : 0);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-neutral-200 flex items-center">
          {label}
          {tooltip && (
            <span className="ml-1 text-neutral-400 cursor-help" title={tooltip}>
              ⓘ
            </span>
          )}
        </label>
        <span className="text-xs text-neutral-400 font-mono">
          {formatValue(displayValue)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  );
};

interface SelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

const Select: React.FC<SelectProps> = ({ label, value, options, onChange }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-neutral-200">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 bg-neutral-800 border border-neutral-600 rounded text-neutral-200 text-sm focus:outline-none focus:border-blue-500"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'secondary',
  size = 'md'
}) => {
  const baseClasses = "font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 transition-colors";
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-neutral-700 hover:bg-neutral-600 text-neutral-200 focus:ring-neutral-500"
  };
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm"
  };
  const disabledClasses = "opacity-50 cursor-not-allowed";

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${disabled ? disabledClasses : ''}
  `.trim();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
};

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  helpContent?: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  children, 
  defaultOpen = true,
  helpContent
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border border-neutral-700 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 text-left text-sm font-medium text-neutral-200 hover:bg-neutral-800 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {title}
          {helpContent && (
            <div onClick={(e) => e.stopPropagation()}>
              <HelpTooltip 
                title={title} 
                content={helpContent}
                size="lg"
              />
            </div>
          )}
        </div>
        <span className={`transform transition-transform ${isOpen ? 'rotate-90' : ''}`}>
          ›
        </span>
      </button>
      {isOpen && (
        <div className="p-3 border-t border-neutral-700 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

export const ControlPanel: React.FC<ControlPanelProps> = ({
  dataConfig,
  modelConfig,
  uncertaintyConfig,
  onDataConfigChange,
  onModelConfigChange,
  onUncertaintyConfigChange,
  onResample,
  onTrain,
  onPause,
  onReset,
  onRunUncertainty,
  onApplyPreset,
  isTraining,
  canTrain
}) => {
  const handleShareLink = () => {
    const url = generateShareUrl({ dataConfig, modelConfig });
    navigator.clipboard.writeText(url).then(() => {
      alert('Share link copied to clipboard!');
    }).catch(() => {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Share link copied to clipboard!');
    });
  };
  return (
    <div className="w-80 h-full bg-neutral-900 border-r border-neutral-700 p-4 overflow-y-auto min-h-0 scrollbar-dark">
      <h1 className="text-lg font-bold text-white mb-6">StatML Lab</h1>
      
      <div className="space-y-4">
        <CollapsibleSection 
          title="Presets & Sharing"
          helpContent={<PresetsHelp />}
        >
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-neutral-200 block mb-2">Quick Presets</label>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => onApplyPreset(preset.dataConfig, preset.modelConfig)}
                    className="p-2 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-neutral-600 transition-colors"
                    title={preset.description}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
            
            <Button onClick={handleShareLink} variant="secondary" size="sm">
              📋 Copy Share Link
            </Button>
          </div>
        </CollapsibleSection>

        <CollapsibleSection 
          title="Data Generation"
          helpContent={<DataGenerationHelp />}
        >
          <Select
            label="Distribution"
            value={dataConfig.distribution}
            options={[
              { value: 'blobs', label: 'Blobs (Gaussians)' },
              { value: 'moons', label: 'Moons (Arcs)' }
            ]}
            onChange={(value) => onDataConfigChange({ distribution: value as 'blobs' | 'moons' })}
          />
          
          <Slider
            label="Sample Size"
            value={dataConfig.n}
            min={50}
            max={1000}
            step={10}
            onChange={(value) => onDataConfigChange({ n: Math.round(value) })}
          />
          
          <Slider
            label="Class Balance"
            value={dataConfig.balance}
            min={0.1}
            max={0.9}
            step={0.05}
            onChange={(value) => onDataConfigChange({ balance: value })}
            tooltip="Proportion of class 1 samples"
          />
          
          <Slider
            label={dataConfig.distribution === 'blobs' ? 'Sigma (σ)' : 'Noise'}
            value={dataConfig.noise}
            min={0.1}
            max={1.5}
            step={0.05}
            onChange={(value) => onDataConfigChange({ noise: value })}
            tooltip={dataConfig.distribution === 'blobs' ? 'Standard deviation of Gaussians' : 'Noise level for moon shapes'}
          />
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="seedLock"
              checked={dataConfig.seed !== Date.now()}
              onChange={(e) => {
                if (e.target.checked) {
                  onDataConfigChange({ seed: 42 });
                } else {
                  onDataConfigChange({ seed: Date.now() });
                }
              }}
              className="rounded border-neutral-600 bg-neutral-800 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="seedLock" className="text-sm text-neutral-200">
              Lock seed
            </label>
          </div>
          
          <Button onClick={onResample} variant="secondary">
            Resample Data
          </Button>
        </CollapsibleSection>

        <CollapsibleSection 
          title="Model Training"
          helpContent={<ModelTrainingHelp />}
        >
          <Slider
            label="Regularization (λ)"
            value={Math.log10(modelConfig.lambda)}
            min={-4}
            max={1}
            step={0.1}
            onChange={(value) => onModelConfigChange({ lambda: Math.pow(10, value) })}
            tooltip="L2 regularization strength"
            isLog
          />
          
          <Select
            label="Learning Rate (η)"
            value={modelConfig.learningRate.toString()}
            options={[
              { value: '0.01', label: '0.01' },
              { value: '0.05', label: '0.05' },
              { value: '0.1', label: '0.1' }
            ]}
            onChange={(value) => onModelConfigChange({ learningRate: parseFloat(value) })}
          />
          
          <Select
            label="Epochs"
            value={modelConfig.epochs.toString()}
            options={[
              { value: '50', label: '50' },
              { value: '100', label: '100' },
              { value: '200', label: '200' }
            ]}
            onChange={(value) => onModelConfigChange({ epochs: parseInt(value) })}
          />
          
          <div className="flex space-x-2">
            <Button
              onClick={onTrain}
              disabled={!canTrain || isTraining}
              variant="primary"
            >
              {isTraining ? 'Training...' : 'Train'}
            </Button>
            
            <Button
              onClick={onPause}
              disabled={!isTraining}
              variant="secondary"
            >
              Pause
            </Button>
            
            <Button
              onClick={onReset}
              variant="secondary"
            >
              Reset
            </Button>
          </div>
        </CollapsibleSection>

        <CollapsibleSection 
          title="Uncertainty Analysis"
          helpContent={<UncertaintyHelp />}
        >
          <Slider
            label="Repeat Runs"
            value={uncertaintyConfig.repeatRuns}
            min={5}
            max={30}
            step={1}
            onChange={(value) => onUncertaintyConfigChange({ repeatRuns: Math.round(value) })}
            tooltip="Number of models to train for variance visualization"
          />
          
          <Slider
            label="Bootstrap Samples"
            value={uncertaintyConfig.bootstrapSamples}
            min={100}
            max={1000}
            step={50}
            onChange={(value) => onUncertaintyConfigChange({ bootstrapSamples: Math.round(value) })}
            tooltip="Number of bootstrap samples for confidence interval"
          />
          
          <Button
            onClick={onRunUncertainty}
            variant="primary"
            disabled={!canTrain}
          >
            Run Uncertainty Analysis
          </Button>
        </CollapsibleSection>
      </div>
    </div>
  );
};
