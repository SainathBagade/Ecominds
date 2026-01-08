import { useState } from 'react';
import { Zap, Target, Flame } from 'lucide-react';

const DifficultySelector = ({ onSelect }) => {
  const [selected, setSelected] = useState('Medium');

  const difficulties = [
    {
      level: 'Easy',
      icon: Zap,
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      textColor: 'text-green-700',
      description: 'Perfect for beginners',
      estimatedTime: '15-30 min',
      points: '50-100'
    },
    {
      level: 'Medium',
      icon: Target,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-700',
      description: 'Good challenge level',
      estimatedTime: '30-60 min',
      points: '100-200'
    },
    {
      level: 'Hard',
      icon: Flame,
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: 'text-red-700',
      description: 'Expert level problems',
      estimatedTime: '60-120 min',
      points: '200-500'
    }
  ];

  const handleSelect = (level) => {
    setSelected(level);
    if (onSelect) {
      onSelect(level);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-800 mb-3">
            Choose Your Difficulty
          </h2>
          <p className="text-gray-600 text-lg">
            Select the challenge level that matches your skill
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {difficulties.map(({ level, icon: Icon, bgColor, borderColor, textColor, description, estimatedTime, points }) => {
            const isSelected = selected === level;
            
            return (
              <button
                key={level}
                onClick={() => handleSelect(level)}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  isSelected
                    ? `${bgColor} ${borderColor} shadow-2xl`
                    : 'bg-white border-gray-200 hover:border-gray-300 shadow-lg'
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-3 -right-3 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    ✓
                  </div>
                )}

                <div className={`mb-4 ${isSelected ? textColor : 'text-gray-400'}`}>
                  <Icon size={48} strokeWidth={2} />
                </div>

                <h3 className={`text-2xl font-bold mb-2 ${isSelected ? textColor : 'text-gray-800'}`}>
                  {level}
                </h3>

                <p className="text-gray-600 text-sm mb-4">
                  {description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Time:</span>
                    <span className="font-semibold text-gray-700">{estimatedTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Points:</span>
                    <span className="font-semibold text-gray-700">{points}</span>
                  </div>
                </div>

                <div className={`mt-6 py-2 px-4 rounded-lg font-semibold transition ${
                  isSelected
                    ? `${textColor} bg-white bg-opacity-70`
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {isSelected ? 'Selected' : 'Select'}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => alert(`Starting ${selected} challenge!`)}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition shadow-lg"
          >
            Continue with {selected}
          </button>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 text-center">
            💡 <strong>Tip:</strong> You can change difficulty anytime during the challenge
          </p>
        </div>
      </div>
    </div>
  );
};

export default DifficultySelector;