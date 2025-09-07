import React, { useState, useEffect } from 'react';

interface AITooltipProps {
  title: string;
  content: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  isDemoMode?: boolean;
  show?: boolean;
}

export const AITooltip: React.FC<AITooltipProps> = ({ 
  title, 
  content, 
  size = 'md',
  isDemoMode = false,
  show = true
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

  if (!show) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-neutral-400 hover:border-neutral-300 text-neutral-400 hover:text-neutral-300 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-900 group"
        title="AI Analysis"
      >
        <svg className="w-3 h-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
        </svg>
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
            className={`relative bg-gradient-to-br from-green-900 to-neutral-900 border border-green-700 rounded-xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden transition-all duration-300 ease-out transform`}
            style={{
              animation: isOpen ? 'modalSlideIn 0.3s ease-out' : 'modalSlideOut 0.3s ease-out'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-green-700 bg-green-800/20">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  🤖 {title}
                </h2>
                {isDemoMode && (
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full border-2 border-blue-400 shadow-lg animate-pulse">
                    🎬 DEMO
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-green-700/30 text-green-300 hover:text-green-200 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)] scrollbar-dark">
              <div className="text-green-100 space-y-4 leading-relaxed">
                {content}
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-green-700 bg-green-800/20 flex-shrink-0">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-green-700 hover:bg-green-600 text-green-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
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
  <div className="space-y-4">
    <div>
      <strong className="text-blue-300">What we're creating:</strong>
      <p>We're making fake datasets to practice with. Each point has two numbers (x₁, x₂) that describe its position, plus a color label (blue=0, orange=1). Think of it like sorting dots into two groups based on where they sit on a map.</p>
    </div>
    
    <div>
      <strong className="text-orange-300">Types of data patterns:</strong>
      <div className="space-y-2 mt-2">
        <div>
          <strong>Blobs (Gaussian clouds):</strong>
          <p className="text-sm">Two circular clusters of dots. Like having blue dots mostly on the left side and orange dots mostly on the right side. Easy for the computer to learn the pattern.</p>
        </div>
        <div>
          <strong>Moons (curved shapes):</strong>
          <p className="text-sm">Two curved, crescent-moon shapes that interlock. Much trickier pattern! Tests whether our straight-line classifier can handle curves.</p>
        </div>
      </div>
    </div>
    
    <div>
      <strong className="text-green-300">What the controls do:</strong>
      <div className="space-y-2 mt-2">
        <div>
          <strong>Sample Size (50-1000):</strong>
          <p className="text-sm">How many dots to create. More dots = more examples for the computer to learn from = better predictions. But it takes longer to process.</p>
        </div>
        <div>
          <strong>Class Balance (0.1-0.9):</strong>
          <p className="text-sm">What fraction are orange vs blue. 0.5 = half and half. 0.1 = mostly blue dots. 0.9 = mostly orange dots. Unbalanced data is harder to learn from.</p>
        </div>
        <div>
          <strong>Noise/Sigma (0.1-1.5):</strong>
          <p className="text-sm">How "messy" or scattered the pattern is. Low values = clean, tight patterns. High values = messy, spread-out dots that are harder to classify correctly.</p>
        </div>
      </div>
    </div>
    
    <div>
      <strong className="text-purple-300">Why randomness is important:</strong>
      <p>Real data is never exactly the same twice. Each time you hit "Resample," you get a slightly different pattern with the same settings. This teaches us that machine learning results can vary!</p>
    </div>
    
    <div className="bg-neutral-700 p-2 rounded text-xs">
      <strong>💡 Experiment:</strong> Try: Small sample (100) vs Large (800) with same noise level. Then try Low noise (0.3) vs High noise (1.2) with same sample size. Notice the difference!
    </div>
  </div>
);

export const ModelTrainingHelp = () => (
  <div className="space-y-4">
    <div>
      <strong className="text-blue-300">What the computer is learning:</strong>
      <p>We're teaching the computer to draw a straight line that best separates blue dots from orange dots. The computer looks at where dots are positioned and learns: "If a new dot appears here, it's probably blue. If it appears there, it's probably orange."</p>
    </div>
    
    <div>
      <strong className="text-orange-300">The controls explained:</strong>
      <div className="space-y-2 mt-2">
        <div>
          <strong>Regularization (λ) - "How strict should we be?"</strong>
          <p className="text-sm">This controls how "picky" the computer is about fitting every single dot perfectly:</p>
          <ul className="list-disc list-inside mt-1 text-xs space-y-1">
            <li><strong>Low values (0.0001):</strong> "Fit every dot perfectly!" - May learn noise instead of real patterns</li>
            <li><strong>Medium values (0.01):</strong> "Find a good balance" - Usually works best</li>
            <li><strong>High values (1.0):</strong> "Keep it simple!" - Straighter lines, ignores some details</li>
          </ul>
        </div>
        <div>
          <strong>Learning Rate (η) - "How big steps to take?"</strong>
          <p className="text-sm">How quickly the computer adjusts its guesses. Like learning to ride a bike - too fast and you crash, too slow and you never get anywhere!</p>
        </div>
        <div>
          <strong>Epochs - "How many tries?"</strong>
          <p className="text-sm">How many times the computer looks at all the data to improve its line. More tries usually = better results, but eventually you stop improving.</p>
        </div>
      </div>
    </div>
    
    <div>
      <strong className="text-green-300">Train vs Validation scores:</strong>
      <p>We split the data: 80% to teach the computer, 20% to test how well it learned. It's like studying with practice problems (train) then taking a real test (validation).</p>
      <div className="text-xs mt-1 space-y-1">
        <p><strong>Good learning:</strong> Both scores are similar and high</p>
        <p><strong>Overfitting:</strong> Train score much higher than validation = memorized instead of learned</p>
        <p><strong>Underfitting:</strong> Both scores low = didn't learn enough</p>
      </div>
    </div>
    
    <div>
      <strong className="text-purple-300">What you'll see:</strong>
      <p>A white line appears showing the computer's best guess for separating the colors. The background gets colored to show confidence - darker colors mean "I'm really sure," lighter colors mean "I'm not so sure."</p>
    </div>
    
    <div className="bg-neutral-700 p-2 rounded text-xs">
      <strong>💡 Experiment:</strong> Try the moons pattern with very low regularization (0.0001) - watch how the straight line struggles with the curved pattern! Then try high regularization (1.0) - see how it keeps things simple.
    </div>
  </div>
);

export const UncertaintyHelp = () => (
  <div className="space-y-4">
    <div>
      <strong className="text-blue-300">Why uncertainty matters:</strong>
      <p>In real life, we never know exactly how good our model is. This analysis helps us understand: "How confident should we be in our results?" It's like asking "If I did this experiment again, would I get similar results?"</p>
    </div>
    
    <div>
      <strong className="text-orange-300">What this analysis does:</strong>
      <div className="space-y-2 mt-2">
        <div>
          <strong>Repeat Training (Gray lines):</strong>
          <p className="text-sm">Creates several slightly different datasets and trains a separate model on each one. Then shows all the decision lines together. If they're close together = stable results. If they spread out = unstable results.</p>
        </div>
        <div>
          <strong>Bootstrap Analysis (Histogram):</strong>
          <p className="text-sm">Takes your trained model and tests it on many random samples of your data. Creates a chart showing "Sometimes accuracy was 85%, sometimes 90%, mostly around 87%..." This tells us how much the accuracy might vary.</p>
        </div>
      </div>
    </div>
    
    <div>
      <strong className="text-green-300">Reading the results:</strong>
      <div className="space-y-2 mt-2">
        <div>
          <strong>Gray boundary lines (Main plot):</strong>
          <ul className="list-disc list-inside mt-1 text-xs space-y-1">
            <li>Lines close together = "This model is stable and trustworthy"</li>
            <li>Lines spread apart = "Results depend heavily on the specific data"</li>
          </ul>
        </div>
        <div>
          <strong>Confidence Interval (Red dashed lines):</strong>
          <ul className="list-disc list-inside mt-1 text-xs space-y-1">
            <li>Narrow range = "I'm confident the true accuracy is close to this"</li>
            <li>Wide range = "The true accuracy could be anywhere in this range"</li>
          </ul>
        </div>
      </div>
    </div>
    
    <div>
      <strong className="text-purple-300">What affects uncertainty:</strong>
      <div className="text-sm space-y-1">
        <p><strong>More data (larger sample size):</strong> Less uncertainty, more confidence</p>
        <p><strong>Less noise:</strong> Cleaner patterns = more reliable results</p>
        <p><strong>Appropriate regularization:</strong> Not too simple, not too complex</p>
        <p><strong>Simpler problems:</strong> Well-separated data is easier to learn reliably</p>
      </div>
    </div>
    
    <div className="bg-neutral-700 p-2 rounded text-xs">
      <strong>💡 Try this:</strong> Run uncertainty analysis on "Small & Noisy" preset, then on "Bigger Dataset" preset. Watch how the confidence interval gets narrower with more data!
    </div>
  </div>
);

export const PresetsHelp = () => (
  <div className="space-y-4">
    <div>
      <strong className="text-blue-300">Ready-made learning scenarios:</strong>
      <p>These are pre-configured setups that demonstrate specific machine learning concepts. Instead of guessing what settings to use, click a preset and instantly see an educational example!</p>
    </div>
    
    <div>
      <strong className="text-orange-300">What each preset teaches:</strong>
      <div className="space-y-2 mt-2">
        <div>
          <strong>"Small & Noisy":</strong>
          <p className="text-sm">Shows what happens with limited, messy data. You'll see lots of uncertainty and unstable results. Teaches: "More data is usually better!"</p>
        </div>
        <div>
          <strong>"Bigger Dataset":</strong>
          <p className="text-sm">Uses lots of clean data. Results are much more stable and confident. Teaches: "Sample size really matters for reliable learning!"</p>
        </div>
        <div>
          <strong>"High Regularization":</strong>
          <p className="text-sm">Uses curved moons data but forces simple straight lines. Shows how being too strict can miss important patterns. Teaches: "Sometimes simple is too simple!"</p>
        </div>
        <div>
          <strong>"Low Regularization":</strong>
          <p className="text-sm">Lets the model be very flexible, maybe too flexible. Might fit noise instead of real patterns. Teaches: "Sometimes flexible is too flexible!"</p>
        </div>
      </div>
    </div>
    
    <div>
      <strong className="text-green-300">How to explore:</strong>
      <div className="text-sm space-y-1">
        <p>1. Click a preset to load its settings</p>
        <p>2. Hit "Train" to see the results</p>
        <p>3. Run "Uncertainty Analysis" to see stability</p>
        <p>4. Try another preset and compare!</p>
      </div>
    </div>
    
    <div className="bg-neutral-700 p-2 rounded text-xs">
      <strong>💡 Learning path:</strong> Start with "Bigger Dataset" to see good results, then try "Small & Noisy" to see problems, then explore the regularization presets to understand the tradeoffs!
    </div>
  </div>
);

export const AppOverviewHelp = () => (
  <div className="space-y-4">
    <div>
      <strong className="text-blue-300 text-lg">📊 Welcome to StatML Lab!</strong>
      <p>This is your playground for learning machine learning concepts through hands-on experimentation. Instead of reading about abstract concepts, you can see them, touch them, and play with them!</p>
    </div>
    
    <div>
      <strong className="text-orange-300">🎯 What makes this special:</strong>
      <div className="space-y-2 mt-2">
        <div>
          <strong>Interactive Learning:</strong>
          <p className="text-sm">Change a setting, see the result immediately. No coding required - just point, click, and learn!</p>
        </div>
        <div>
          <strong>Visual Understanding:</strong>
          <p className="text-sm">Watch the computer draw lines to separate data. See confidence levels as colors. Observe uncertainty as wiggling boundaries.</p>
        </div>
        <div>
          <strong>Real Concepts:</strong>
          <p className="text-sm">Everything you see here happens in real machine learning - we've just made it visible and touchable.</p>
        </div>
      </div>
    </div>
    
    <div>
      <strong className="text-green-300">🎓 Perfect learning sequence:</strong>
      <ol className="list-decimal list-inside mt-1 space-y-1 text-sm">
        <li><strong>Start simple:</strong> Try "Bigger Dataset" preset - see good results first</li>
        <li><strong>See problems:</strong> Try "Small & Noisy" - watch confidence disappear</li>
        <li><strong>Understand tradeoffs:</strong> Compare high vs low regularization</li>
        <li><strong>Run uncertainty analysis:</strong> See how much results can vary</li>
        <li><strong>Experiment freely:</strong> Change settings and see what happens!</li>
      </ol>
    </div>
    
    <div>
      <strong className="text-purple-300">🔍 Key concepts you'll discover:</strong>
      <div className="text-sm space-y-1">
        <p><strong>The Goldilocks principle:</strong> Not too simple, not too complex, but just right</p>
        <p><strong>More data helps:</strong> But there are diminishing returns</p>
        <p><strong>Nothing is certain:</strong> All predictions come with uncertainty</p>
        <p><strong>Validation matters:</strong> How well does it work on NEW data?</p>
      </div>
    </div>
    
    <div>
      <strong className="text-yellow-300">💡 Pro tips for learning:</strong>
      <div className="text-sm space-y-1">
        <p>• Use the ? buttons everywhere - they explain what you're seeing</p>
        <p>• Try extreme values (very high/low) to see dramatic effects</p>
        <p>• Compare presets side-by-side to understand differences</p>
        <p>• Run uncertainty analysis on everything - see the confidence</p>
      </div>
    </div>
    
    <div className="bg-blue-900 p-3 rounded text-sm">
      <strong>🎉 Ready to start?</strong> Click "Quick Presets" and choose "Bigger Dataset" for your first experiment. Train the model, then run uncertainty analysis. Welcome to machine learning!
    </div>
  </div>
);

// AI Analysis Components  
export const StatsAIAnalysis: React.FC<{ isDemoMode: boolean }> = ({ isDemoMode }) => {
  // Show demo analysis only if we're in demo mode, otherwise show API key message
  if (!isDemoMode) {
    return (
      <div className="text-center space-y-4">
        <div className="text-green-300 text-lg">🚧 Feature In Development</div>
        <p>AI-powered statistical analysis requires an API key configuration.</p>
        <p className="text-sm text-green-200">This feature will provide intelligent insights about your model's performance, potential issues, and recommendations for improvement.</p>
        <div className="bg-green-800/30 p-3 rounded-lg text-sm">
          <strong>Coming Soon:</strong> Real-time AI analysis of your training results!
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-green-800/30 p-4 rounded-lg">
        <div className="text-green-300 font-semibold mb-2">🎯 Model Performance Analysis</div>
        <p>Your logistic regression model shows <strong>solid performance</strong> with a training accuracy of <strong>89.1%</strong> and validation accuracy of <strong>87.4%</strong>.</p>
      </div>

      <div className="space-y-3">
        <div>
          <strong className="text-green-300">📊 Key Insights:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li><strong>Generalization Gap:</strong> The 1.7% gap between training (89.1%) and validation (87.4%) indicates <em>healthy learning</em> - your model generalizes well without significant overfitting.</li>
            <li><strong>Model Weights:</strong> The bias term (0.121) suggests a slight decision boundary shift, while feature weights (1.234, 1.187) show balanced importance between both input features.</li>
            <li><strong>Feature Scaling:</strong> Your standardization worked well - features have means near zero (0.023, 0.019) and unit variance (1.156, 1.142).</li>
          </ul>
        </div>

        <div>
          <strong className="text-green-300">🔍 What This Means:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>The model is <strong>not overfitting</strong> - the small train/val gap is ideal</li>
            <li>Both features contribute meaningfully to classification (similar weight magnitudes)</li>
            <li>The final loss trajectory shows good convergence without oscillation</li>
          </ul>
        </div>

        <div>
          <strong className="text-green-300">💡 Recommendations:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Current regularization (λ=0.01) is well-tuned for this dataset</li>
            <li>Consider collecting more data if you need higher accuracy</li>
            <li>The model is ready for production use on similar blob-type data</li>
          </ul>
        </div>
      </div>

      <div className="bg-blue-900/30 p-3 rounded-lg text-sm">
        <strong>🎓 Educational Note:</strong> This is an excellent example of a well-balanced model that neither underfits nor overfits the data.
      </div>
    </div>
  );
};

export const BootstrapAIAnalysis: React.FC<{ isDemoMode: boolean }> = ({ isDemoMode }) => {
  if (!isDemoMode) {
    return (
      <div className="text-center space-y-4">
        <div className="text-green-300 text-lg">🚧 Feature In Development</div>
        <p>AI-powered uncertainty analysis requires an API key configuration.</p>
        <p className="text-sm text-green-200">This feature will provide intelligent interpretation of your bootstrap results, confidence intervals, and model stability insights.</p>
        <div className="bg-green-800/30 p-3 rounded-lg text-sm">
          <strong>Coming Soon:</strong> Real-time AI analysis of your uncertainty metrics!
        </div>
      </div>
    );
  }

  // Calculate stats from demo data
  const mean = 0.878; // Average of demo accuracies
  const ci_lower = 0.867;
  const ci_upper = 0.894;
  const ci_width = ci_upper - ci_lower;
  const std_dev = 0.009; // Approximate from demo data

  return (
    <div className="space-y-4">
      <div className="bg-green-800/30 p-4 rounded-lg">
        <div className="text-green-300 font-semibold mb-2">🎲 Bootstrap Uncertainty Analysis</div>
        <p>Your model shows <strong>excellent stability</strong> with a tight confidence interval and low variance across bootstrap samples.</p>
      </div>

      <div className="space-y-3">
        <div>
          <strong className="text-green-300">📈 Statistical Summary:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li><strong>Mean Accuracy:</strong> {(mean * 100).toFixed(1)}% across 30 bootstrap samples</li>
            <li><strong>95% Confidence Interval:</strong> [{(ci_lower * 100).toFixed(1)}%, {(ci_upper * 100).toFixed(1)}%] (width: {(ci_width * 100).toFixed(1)}%)</li>
            <li><strong>Standard Deviation:</strong> ±{(std_dev * 100).toFixed(1)}% indicating very low variance</li>
          </ul>
        </div>

        <div>
          <strong className="text-green-300">🔍 Key Insights:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li><strong>High Confidence:</strong> The narrow 2.7% CI width indicates we can be very confident about the true accuracy</li>
            <li><strong>Model Stability:</strong> Bootstrap samples cluster tightly around 87.8%, showing consistent performance</li>
            <li><strong>Sample Size Effect:</strong> With 800 training samples, your model has learned stable patterns</li>
          </ul>
        </div>

        <div>
          <strong className="text-green-300">📊 Distribution Analysis:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Bootstrap accuracies follow a <strong>normal-like distribution</strong> centered at 87.8%</li>
            <li>No outliers detected - all samples fall within expected range</li>
            <li>The distribution is <strong>symmetric</strong>, indicating unbiased estimation</li>
          </ul>
        </div>

        <div>
          <strong className="text-green-300">💡 Practical Implications:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>You can expect similar performance (86.7-89.4%) on new, similar data</li>
            <li>The model is <strong>production-ready</strong> with predictable performance</li>
            <li>Low uncertainty means fewer surprises when deployed</li>
          </ul>
        </div>
      </div>

      <div className="bg-blue-900/30 p-3 rounded-lg text-sm">
        <strong>🎓 Statistical Note:</strong> This narrow confidence interval is a hallmark of a well-trained model on sufficient data. The bootstrap method gives us robust uncertainty estimates without distributional assumptions.
      </div>
    </div>
  );
};
