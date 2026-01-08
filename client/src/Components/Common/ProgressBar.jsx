import { useState, useEffect } from 'react';

// Basic Progress Bar
export const ProgressBar = ({ progress = 0, color = 'blue', showLabel = true, height = 'md' }) => {
  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    purple: 'bg-purple-600',
    yellow: 'bg-yellow-600'
  };

  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4'
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-semibold text-gray-800">{clampedProgress}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heights[height]}`}>
        <div
          className={`${colors[color]} ${heights[height]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        ></div>
      </div>
    </div>
  );
};

// Striped Progress Bar
export const StripedProgressBar = ({ progress = 0, animated = true }) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Loading</span>
        <span className="text-sm font-semibold text-gray-800">{clampedProgress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className={`h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 relative ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{
            width: `${clampedProgress}%`,
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)'
          }}
        ></div>
      </div>
    </div>
  );
};

// Circular Progress
export const CircularProgress = ({ progress = 0, size = 100, strokeWidth = 8, color = 'blue' }) => {
  const colors = {
    blue: '#3b82f6',
    green: '#10b981',
    red: '#ef4444',
    purple: '#8b5cf6',
    yellow: '#f59e0b'
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[color]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-gray-800">{clampedProgress}%</span>
      </div>
    </div>
  );
};

// Multi-step Progress
export const MultiStepProgress = ({ currentStep = 1, totalSteps = 4, steps }) => {
  const defaultSteps = ['Personal Info', 'Account Setup', 'Preferences', 'Complete'];
  const stepLabels = steps || defaultSteps;

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        {stepLabels.map((label, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all ${
                index + 1 < currentStep
                  ? 'bg-green-600 text-white'
                  : index + 1 === currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {index + 1 < currentStep ? '✓' : index + 1}
            </div>
            <span className="text-xs text-center text-gray-600 px-1">{label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center">
        {Array.from({ length: totalSteps - 1 }).map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 ${
              index + 1 < currentStep ? 'bg-green-600' : 'bg-gray-200'
            } transition-all duration-500`}
          ></div>
        ))}
      </div>
    </div>
  );
};

// Demo Component
const ProgressBarDemo = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 0 : prev + 1));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Progress Bar Components</h1>
      
      <div className="space-y-8 max-w-4xl">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Basic Progress Bar</h3>
          <ProgressBar progress={progress} color="blue" />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Different Colors</h3>
          <div className="space-y-4">
            <ProgressBar progress={progress} color="green" height="lg" />
            <ProgressBar progress={75} color="purple" height="md" />
            <ProgressBar progress={50} color="yellow" height="sm" showLabel={false} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Striped Progress Bar</h3>
          <StripedProgressBar progress={progress} animated={true} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Circular Progress</h3>
          <div className="flex gap-8 justify-center">
            <CircularProgress progress={progress} size={120} color="blue" />
            <CircularProgress progress={75} size={100} color="green" />
            <CircularProgress progress={50} size={80} color="purple" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Multi-step Progress</h3>
          <MultiStepProgress currentStep={Math.floor(progress / 25) + 1} totalSteps={4} />
        </div>
      </div>
    </div>
  );
};

export default ProgressBarDemo;