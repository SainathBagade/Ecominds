import { useState } from 'react';
import { FileText, Check, AlertCircle, Lightbulb } from 'lucide-react';

const Round3Scenario = () => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [answers, setAnswers] = useState({});

  const scenarios = [
    {
      id: 1,
      title: 'School Waste Management Crisis',
      context: 'Your school generates 500kg of waste daily. 70% is recyclable but ends up in landfills. The principal asks you to propose a waste management system.',
      question: 'Design a comprehensive waste management plan for your school',
      requirements: [
        'Identify waste types and quantities',
        'Propose sorting system',
        'Suggest recycling partnerships',
        'Include student education plan',
        'Estimate cost and environmental impact'
      ],
      rubric: {
        completeness: 30,
        feasibility: 25,
        environmental_impact: 25,
        cost_effectiveness: 20
      },
      sampleAnswer: `
1. Waste Audit: Paper (40%), Plastic (20%), Food waste (30%), Other (10%)
2. Sorting System: 4-bin system in each classroom
3. Partnerships: Local recycling center + composting facility
4. Education: Weekly workshops + poster campaigns
5. Impact: 70% waste reduction, ₹50,000 annual savings
      `,
      points: 50
    },
    {
      id: 2,
      title: 'Community Water Conservation',
      context: 'Your neighborhood faces water shortage during summer. Average household uses 500L daily. You\'re tasked with reducing consumption by 30%.',
      question: 'Create a community water conservation program',
      requirements: [
        'Identify high-consumption areas',
        'Propose conservation methods',
        'Design awareness campaign',
        'Set measurable targets',
        'Plan implementation timeline'
      ],
      rubric: {
        analysis: 25,
        solutions: 30,
        campaign: 25,
        implementation: 20
      },
      sampleAnswer: `
1. High-use areas: Bathroom (40%), Kitchen (30%), Garden (20%), Laundry (10%)
2. Methods: Low-flow fixtures, rainwater harvesting, drip irrigation
3. Campaign: Door-to-door education, social media, rewards system
4. Targets: 150L daily reduction per household in 3 months
5. Timeline: Month 1 - Education, Month 2 - Installation, Month 3 - Monitoring
      `,
      points: 50
    },
    {
      id: 3,
      title: 'Urban Air Quality Improvement',
      context: 'Your city\'s AQI averages 200 (Poor). Major sources: vehicles (50%), industries (30%), construction (20%). Mayor seeks actionable solutions.',
      question: 'Develop an air quality improvement strategy',
      requirements: [
        'Analyze pollution sources',
        'Propose short-term solutions',
        'Design long-term strategies',
        'Address stakeholder concerns',
        'Project outcomes and timeline'
      ],
      rubric: {
        source_analysis: 20,
        short_term: 25,
        long_term: 25,
        stakeholder_mgmt: 15,
        projections: 15
      },
      sampleAnswer: `
1. Source Analysis: Vehicle emissions primary cause, industrial zones secondary
2. Short-term: Odd-even vehicle policy, construction dust control, green zones
3. Long-term: Public transport expansion, industrial emission standards, urban forests
4. Stakeholders: Compensate businesses, subsidize public transport, job creation
5. Outcomes: AQI < 100 in 2 years, 40% emission reduction
      `,
      points: 50
    }
  ];

  const scenario = scenarios[currentScenario];

  const handleAnswerChange = (scenarioId, text) => {
    setAnswers({
      ...answers,
      [scenarioId]: text
    });
  };

  const handleSubmit = () => {
    alert('Scenario submitted for review! Teacher will evaluate and provide feedback.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText className="text-green-600" size={32} />
              <h1 className="text-2xl font-bold text-gray-800">Round 3: Real-World Scenarios</h1>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Scenario {currentScenario + 1}/{scenarios.length}</div>
              <div className="text-lg font-bold text-green-600">{scenario.points} points</div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentScenario + 1) / scenarios.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Scenario Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{scenario.title}</h2>

          {/* Context */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Context</h3>
            <p className="text-blue-800">{scenario.context}</p>
          </div>

          {/* Question */}
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <h3 className="font-semibold text-green-900 mb-2">Your Task</h3>
            <p className="text-green-800 font-medium">{scenario.question}</p>
          </div>

          {/* Requirements */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Requirements (Must address all):</h3>
            <ul className="space-y-2">
              {scenario.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Rubric */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Evaluation Rubric:</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(scenario.rubric).map(([criterion, points]) => (
                <div key={criterion} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">
                      {criterion.replace('_', ' ')}
                    </span>
                    <span className="font-bold text-purple-600">{points} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Answer Box */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">Your Solution:</h3>
            <textarea
              value={answers[scenario.id] || ''}
              onChange={(e) => handleAnswerChange(scenario.id, e.target.value)}
              placeholder="Write your detailed solution here... Be specific and address all requirements."
              className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-500">
                {(answers[scenario.id] || '').length} characters
              </span>
              <span className="text-sm text-gray-500">
                Min. 500 characters recommended
              </span>
            </div>
          </div>

          {/* Sample Answer Hint */}
          <details className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <summary className="cursor-pointer font-semibold text-yellow-900 flex items-center gap-2">
              <Lightbulb size={20} />
              Show Sample Answer Structure
            </summary>
            <pre className="mt-3 text-sm text-yellow-800 whitespace-pre-wrap font-mono">
              {scenario.sampleAnswer}
            </pre>
          </details>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentScenario(Math.max(0, currentScenario - 1))}
            disabled={currentScenario === 0}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition disabled:opacity-50"
          >
            Previous
          </button>

          <div className="flex gap-3">
            <button className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 transition">
              Save Draft
            </button>
            
            {currentScenario === scenarios.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!answers[scenario.id] || answers[scenario.id].length < 100}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
              >
                Submit Round 3
              </button>
            ) : (
              <button
                onClick={() => setCurrentScenario(currentScenario + 1)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
              >
                Next Scenario
              </button>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-purple-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-purple-800">
            <strong>Note:</strong> Your answers will be reviewed by teachers. 
            Focus on practical, implementable solutions with clear action steps and measurable outcomes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Round3Scenario;