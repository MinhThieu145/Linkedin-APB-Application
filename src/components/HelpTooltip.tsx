import React, { useState, useEffect } from 'react';

interface HelpTooltipProps {
  title: string;
  content: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ 
  title, 
  content, 
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl', 
    lg: 'max-w-4xl'
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-neutral-400 hover:border-neutral-300 text-neutral-400 hover:text-neutral-300 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-900 group"
        title="Click for help"
      >
        <span className="font-serif font-bold text-[10px] group-hover:scale-110 transition-transform">?</span>
      </button>
      
      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out"
            onClick={() => setIsOpen(false)}
            style={{
              animation: isOpen ? 'fadeIn 0.3s ease-out' : 'fadeOut 0.3s ease-out'
            }}
          />
          
          {/* Modal Content */}
          <div 
            className={`relative bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden transition-all duration-300 ease-out transform`}
            style={{
              animation: isOpen ? 'modalSlideIn 0.3s ease-out' : 'modalSlideOut 0.3s ease-out'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-700 bg-neutral-800">
              <h2 className="text-xl font-semibold text-white">{title}</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] scrollbar-dark">
              <div className="text-neutral-200 space-y-4 leading-relaxed">
                {content}
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-neutral-700 bg-neutral-800">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Predefined help content components
export const DataGenerationHelp = () => (
  <div className="space-y-3">
    <div>
      <strong className="text-blue-300">What we're simulating:</strong>
      <p>Binary classification with two features (x₁, x₂) and class labels (0 or 1). We want a rule to predict new points.</p>
    </div>
    
    <div>
      <strong className="text-orange-300">Data types:</strong>
      <ul className="list-disc list-inside mt-1 space-y-1">
        <li><strong>Blobs:</strong> Two Gaussian clouds - adjustable means and spread (σ)</li>
        <li><strong>Moons:</strong> Two curved half-circle shapes with noise</li>
      </ul>
    </div>
    
    <div>
      <strong className="text-green-300">Why randomness matters:</strong>
      <p>Random sampling means datasets with same settings won't be identical. This randomness is key to understanding uncertainty!</p>
    </div>
    
    <div className="bg-neutral-700 p-2 rounded text-xs">
      <strong>💡 Try this:</strong> Generate data, then hit "Resample" - notice how the pattern changes slightly each time.
    </div>
  </div>
);

export const ModelTrainingHelp = () => (
  <div className="space-y-3">
    <div>
      <strong className="text-blue-300">Logistic Regression:</strong>
      <p>A linear classifier that draws a straight decision boundary. It outputs probabilities using the sigmoid function.</p>
    </div>
    
    <div>
      <strong className="text-orange-300">Regularization (λ):</strong>
      <ul className="list-disc list-inside mt-1 space-y-1">
        <li><strong>High λ:</strong> Simpler, straighter boundaries (higher bias, lower variance)</li>
        <li><strong>Low λ:</strong> More flexible boundaries (lower bias, higher variance, overfitting risk)</li>
      </ul>
    </div>
    
    <div>
      <strong className="text-green-300">Train/Validation Split:</strong>
      <p>80% for training, 20% for testing generalization. If train accuracy ≫ validation accuracy, you're overfitting!</p>
    </div>
    
    <div className="bg-neutral-700 p-2 rounded text-xs">
      <strong>💡 Experiment:</strong> Try very low λ (0.0001) vs high λ (1.0) and watch how the boundary changes.
    </div>
  </div>
);

export const UncertaintyHelp = () => (
  <div className="space-y-3">
    <div>
      <strong className="text-blue-300">Repeat Sampling:</strong>
      <p>Generates multiple datasets with same settings and trains separate models. Shows model variance as overlapping boundaries.</p>
    </div>
    
    <div>
      <strong className="text-orange-300">Bootstrap Sampling:</strong>
      <p>Resamples your current dataset with replacement many times. Computes accuracy distribution and 95% confidence interval.</p>
    </div>
    
    <div>
      <strong className="text-green-300">What to notice:</strong>
      <ul className="list-disc list-inside mt-1 space-y-1">
        <li>Small n / high noise → boundaries fan out (high variance)</li>
        <li>Large n / reasonable λ → boundaries cluster (low variance)</li>
        <li>Wide CI = uncertain about performance</li>
        <li>Narrow CI = confident about performance</li>
      </ul>
    </div>
    
    <div className="bg-neutral-700 p-2 rounded text-xs">
      <strong>💡 Try this:</strong> Compare uncertainty with n=100 vs n=800. Notice how confidence intervals shrink!
    </div>
  </div>
);

export const PresetsHelp = () => (
  <div className="space-y-3">
    <div>
      <strong className="text-blue-300">Quick Scenarios:</strong>
      <ul className="list-disc list-inside mt-1 space-y-1">
        <li><strong>Small & Noisy:</strong> High variance demonstration</li>
        <li><strong>Bigger Dataset:</strong> Shows variance reduction</li>
        <li><strong>High Regularization:</strong> Bias increase, variance decrease</li>
        <li><strong>Low Regularization:</strong> Overfitting risk demo</li>
      </ul>
    </div>
    
    <div>
      <strong className="text-orange-300">Share Links:</strong>
      <p>Encode your exact settings in a URL. Perfect for homework, discussions, or reproducing interesting results.</p>
    </div>
    
    <div className="bg-neutral-700 p-2 rounded text-xs">
      <strong>💡 Workflow:</strong> Try each preset → Run uncertainty analysis → Compare the results!
    </div>
  </div>
);

export const AppOverviewHelp = () => (
  <div className="space-y-4">
    <div>
      <strong className="text-blue-300 text-lg">📊 StatML Lab Overview</strong>
      <p>An interactive tool for understanding machine learning fundamentals through visual experimentation.</p>
    </div>
    
    <div>
      <strong className="text-orange-300">🎯 What you can learn:</strong>
      <ul className="list-disc list-inside mt-1 space-y-1">
        <li><strong>Bias-Variance Tradeoff:</strong> See how regularization affects model complexity</li>
        <li><strong>Sample Size Effects:</strong> Watch uncertainty decrease with more data</li>
        <li><strong>Overfitting:</strong> Observe train vs validation accuracy gaps</li>
        <li><strong>Statistical Uncertainty:</strong> Bootstrap confidence intervals made visual</li>
        <li><strong>Decision Boundaries:</strong> How linear classifiers separate classes</li>
      </ul>
    </div>
    
    <div>
      <strong className="text-green-300">🔬 Typical workflow:</strong>
      <ol className="list-decimal list-inside mt-1 space-y-1">
        <li>Generate data (adjust size, noise, distribution)</li>
        <li>Train model (experiment with regularization)</li>
        <li>Run uncertainty analysis (see variance and confidence)</li>
        <li>Try different scenarios using presets</li>
        <li>Share interesting findings with others</li>
      </ol>
    </div>
    
    <div>
      <strong className="text-purple-300">🧠 Key insights to discover:</strong>
      <ul className="list-disc list-inside mt-1 space-y-1">
        <li>More data = less uncertainty</li>
        <li>Higher regularization = simpler models</li>
        <li>Train/val gap indicates overfitting</li>
        <li>Bootstrap CIs quantify our confidence</li>
      </ul>
    </div>
    
    <div>
      <strong className="text-yellow-300">💼 Perfect for:</strong>
      <ul className="list-disc list-inside mt-1 space-y-1">
        <li>ML/Statistics courses and homework</li>
        <li>Interview preparation and demonstrations</li>
        <li>Research presentations and explanations</li>
        <li>Self-study and intuition building</li>
      </ul>
    </div>
    
    <div className="bg-blue-900 p-3 rounded text-sm">
      <strong>🚀 Pro tip:</strong> Use the presets to quickly jump between classic scenarios, then experiment with small parameter changes to see how they affect the results!
    </div>
  </div>
);
