import { useState } from 'react';
import { Puzzle, Check, X, Lightbulb, RefreshCw } from 'lucide-react';

const Round2Puzzle = () => {
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [solutions, setSolutions] = useState({});
  const [showHint, setShowHint] = useState({});

  const puzzles = [
    {
      id: 1,
      title: 'Carbon Footprint Calculator',
      description: 'Arrange these activities from highest to lowest carbon footprint',
      type: 'ordering',
      items: [
        { id: 'a', text: 'Flying 1000 km', correctPosition: 0 },
        { id: 'b', text: 'Driving 1000 km', correctPosition: 1 },
        { id: 'c', text: 'Taking train 1000 km', correctPosition: 2 },
        { id: 'd', text: 'Cycling 1000 km', correctPosition: 3 }
      ],
      hint: 'Air travel typically has the highest carbon footprint per km',
      points: 40
    },
    {
      id: 2,
      title: 'Waste Sorting Challenge',
      description: 'Categorize these items into correct waste bins',
      type: 'matching',
      categories: ['Recyclable', 'Compostable', 'Landfill', 'Hazardous'],
      items: [
        { id: 'a', text: 'Plastic bottle', correctCategory: 'Recyclable' },
        { id: 'b', text: 'Banana peel', correctCategory: 'Compostable' },
        { id: 'c', text: 'Used battery', correctCategory: 'Hazardous' },
        { id: 'd', text: 'Styrofoam', correctCategory: 'Landfill' },
        { id: 'e', text: 'Paper', correctCategory: 'Recyclable' },
        { id: 'f', text: 'Food scraps', correctCategory: 'Compostable' }
      ],
      hint: 'Batteries contain toxic materials and should never go in regular trash',
      points: 50
    },
    {
      id: 3,
      title: 'Energy Efficiency Puzzle',
      description: 'Match appliances with their average power consumption',
      type: 'matching',
      pairs: [
        { id: 1, item: 'LED Light Bulb', value: '10W' },
        { id: 2, item: 'Laptop', value: '50W' },
        { id: 3, item: 'Refrigerator', value: '150W' },
        { id: 4, item: 'Air Conditioner', value: '1000W' }
      ],
      hint: 'LED bulbs are extremely energy efficient compared to other appliances',
      points: 40
    },
    {
      id: 4,
      title: 'Water Conservation Path',
      description: 'Arrange these steps to create the most efficient water-saving routine',
      type: 'ordering',
      items: [
        { id: 'a', text: 'Install low-flow showerhead', correctPosition: 0 },
        { id: 'b', text: 'Fix leaking faucets', correctPosition: 1 },
        { id: 'c', text: 'Take shorter showers', correctPosition: 2 },
        { id: 'd', text: 'Turn off tap while brushing', correctPosition: 3 }
      ],
      hint: 'Start with infrastructure improvements for long-term savings',
      points: 40
    },
    {
      id: 5,
      title: 'Ecosystem Balance',
      description: 'Connect these organisms to show food chain relationships',
      type: 'connections',
      items: [
        { id: 'a', text: 'Sun', connections: ['b'] },
        { id: 'b', text: 'Plants', connections: ['c', 'd'] },
        { id: 'c', text: 'Herbivores', connections: ['e'] },
        { id: 'd', text: 'Insects', connections: ['f'] },
        { id: 'e', text: 'Carnivores', connections: [] },
        { id: 'f', text: 'Birds', connections: ['e'] }
      ],
      hint: 'Energy flows from producers to consumers',
      points: 50
    }
  ];

  const puzzle = puzzles[currentPuzzle];
  const [draggedItem, setDraggedItem] = useState(null);
  const [orderedItems, setOrderedItems] = useState(
    puzzle.type === 'ordering' ? [...puzzle.items].sort(() => Math.random() - 0.5) : []
  );

  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  const handleDrop = (targetIndex) => {
    if (!draggedItem) return;
    
    const newOrder = [...orderedItems];
    const draggedIndex = newOrder.findIndex(i => i.id === draggedItem.id);
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);
    
    setOrderedItems(newOrder);
    setDraggedItem(null);
  };

  const checkSolution = () => {
    if (puzzle.type === 'ordering') {
      const isCorrect = orderedItems.every((item, index) => item.correctPosition === index);
      setSolutions({ ...solutions, [puzzle.id]: isCorrect });
      return isCorrect;
    }
    return false;
  };

  const resetPuzzle = () => {
    setOrderedItems([...puzzle.items].sort(() => Math.random() - 0.5));
    setSolutions({ ...solutions, [puzzle.id]: undefined });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Puzzle className="text-purple-600" size={32} />
              <h1 className="text-2xl font-bold text-gray-800">Round 2: Environmental Puzzles</h1>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Puzzle {currentPuzzle + 1}/{puzzles.length}</div>
              <div className="text-lg font-bold text-purple-600">{puzzle.points} points</div>
            </div>
          </div>

          {/* Progress */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentPuzzle + 1) / puzzles.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Puzzle Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">{puzzle.title}</h2>
          <p className="text-gray-600 mb-6">{puzzle.description}</p>

          {/* Ordering Puzzle */}
          {puzzle.type === 'ordering' && (
            <div className="space-y-3">
              {orderedItems.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 hover:border-purple-400 cursor-move transition flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-800">{item.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Matching Puzzle */}
          {puzzle.type === 'matching' && puzzle.categories && (
            <div>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {puzzle.categories.map(cat => (
                  <div key={cat} className="bg-gray-100 p-3 rounded-lg text-center font-semibold text-gray-700 text-sm">
                    {cat}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {puzzle.items.map(item => (
                  <div
                    key={item.id}
                    draggable
                    className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200 hover:border-blue-400 cursor-move transition text-sm font-medium text-gray-800"
                  >
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hint Button */}
          <button
            onClick={() => setShowHint({ ...showHint, [puzzle.id]: !showHint[puzzle.id] })}
            className="mt-6 flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-semibold"
          >
            <Lightbulb size={20} />
            {showHint[puzzle.id] ? 'Hide Hint' : 'Show Hint'}
          </button>

          {showHint[puzzle.id] && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">{puzzle.hint}</p>
            </div>
          )}

          {/* Solution Feedback */}
          {solutions[puzzle.id] !== undefined && (
            <div className={`mt-6 p-4 rounded-lg ${
              solutions[puzzle.id] 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {solutions[puzzle.id] ? (
                  <>
                    <Check className="text-green-600" size={24} />
                    <span className="font-semibold text-green-800">Correct! +{puzzle.points} points</span>
                  </>
                ) : (
                  <>
                    <X className="text-red-600" size={24} />
                    <span className="font-semibold text-red-800">Try again! Keep arranging the items.</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={resetPuzzle}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition"
          >
            <RefreshCw size={20} />
            Reset
          </button>

          <button
            onClick={checkSolution}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition"
          >
            Check Answer
          </button>

          {solutions[puzzle.id] && (
            <button
              onClick={() => setCurrentPuzzle(Math.min(currentPuzzle + 1, puzzles.length - 1))}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
            >
              {currentPuzzle === puzzles.length - 1 ? 'Finish Round' : 'Next Puzzle'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Round2Puzzle;