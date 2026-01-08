import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CompetitionList from '@components/Compititions/CompetitionList';
import Loader from '@components/Common/Loader';
import { Trophy, Calendar, Users, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@services/api';

const Competitions = () => {
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, ongoing, completed
  const [stats, setStats] = useState({
    participated: 0,
    won: 0,
    totalPoints: 0
  });

  useEffect(() => {
    fetchCompetitions();
    fetchUserStats();
  }, [activeTab]);

  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      const params = { status: activeTab };
      const response = await api.get('/competitions', { params });
      setCompetitions(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load competitions');
      console.error('Error fetching competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      // This endpoint needs to be added to backend, for now handled gracefully if 404
      const response = await api.get('/competitions/my-stats');
      setStats(response.data.data || { participated: 0, won: 0, totalPoints: 0 });
    } catch (error) {
      console.warn('Stats endpoint might be missing:', error);
    }
  };

  const handleJoinCompetition = async (competitionId) => {
    try {
      await api.post(`/competitions/${competitionId}/register`, {});
      toast.success('Successfully joined competition!');
      fetchCompetitions();
      navigate(`/competitions/${competitionId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join competition');
    }
  };

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', icon: Calendar },
    { id: 'ongoing', label: 'Ongoing', icon: Trophy },
    { id: 'completed', label: 'Completed', icon: Award }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">
                Competitions
              </h1>
              <p className="text-gray-600">
                Compete with students and win amazing prizes
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Participated</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.participated}
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Competitions Won</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.won}
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Points</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalPoints}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white mb-6 animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">
                Test Your Knowledge!
              </h3>
              <p className="text-white/90">
                Join competitions to compete with students from around the world. Win prizes and earn exclusive badges!
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card mb-6 animate-slide-up">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* How Competitions Work */}
        {activeTab === 'upcoming' && competitions.length > 0 && (
          <div className="card mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              How Competitions Work
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Round 1: Quiz</h4>
                  <p className="text-sm text-gray-600">
                    Answer multiple-choice questions to advance
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Round 2: Puzzle</h4>
                  <p className="text-sm text-gray-600">
                    Solve environmental puzzles and challenges
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Round 3: Scenario</h4>
                  <p className="text-sm text-gray-600">
                    Solve real-world environmental scenarios
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Competitions List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : competitions.length === 0 ? (
          <div className="card text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No {activeTab} competitions
            </h3>
            <p className="text-gray-600">
              {activeTab === 'upcoming' && 'Check back soon for new competitions!'}
              {activeTab === 'ongoing' && 'No active competitions at the moment'}
              {activeTab === 'completed' && 'You haven\'t participated in any competitions yet'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {competitions.length} competition{competitions.length !== 1 ? 's' : ''}
            </div>
            <CompetitionList
              competitions={competitions}
              onJoin={handleJoinCompetition}
            />
          </>
        )}

        {/* Prize Information */}
        {activeTab === 'upcoming' && competitions.length > 0 && (
          <div className="card mt-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-8 h-8 text-yellow-600" />
              <h3 className="text-xl font-semibold text-gray-900">
                Prizes & Rewards
              </h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600 mb-1">🥇</div>
                <div className="font-semibold text-gray-900 mb-1">1st Place</div>
                <div className="text-sm text-gray-600">500 EcoPoints + Winner Badge</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-3xl font-bold text-gray-500 mb-1">🥈</div>
                <div className="font-semibold text-gray-900 mb-1">2nd Place</div>
                <div className="text-sm text-gray-600">300 EcoPoints + Runner-up Badge</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-1">🥉</div>
                <div className="font-semibold text-gray-900 mb-1">3rd Place</div>
                <div className="text-sm text-gray-600">200 EcoPoints + Participant Badge</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Competitions;