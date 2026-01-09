import React, { useState, useEffect } from 'react';
import ChallengePage from '@components/Challenges/ChallengePage';
import Loader from '@components/Common/Loader';
import { Target, Filter, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@services/api';
import { DIFFICULTY_LEVELS } from '@utils/constants';

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // active, completed, all
  const [filters, setFilters] = useState({
    difficulty: '',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0
  });

  const fetchChallenges = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab === 'active') {
        params.status = 'active';
      } else if (activeTab === 'completed') {
        params.completed = true;
      }

      const response = await api.get('/challenges', { params });
      setChallenges(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load challenges');
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchChallenges();
    fetchUserStats();
  }, [fetchChallenges]);

  const fetchUserStats = async () => {
    try {
      const response = await api.get('/challenges/my-stats');
      setStats(response.data.data || { total: 0, completed: 0, pending: 0 });
    } catch (error) {
      console.warn('Error fetching challenge stats:', error);
      setStats({ total: 0, completed: 0, pending: 0 });
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    setFilters({ difficulty: '', search: '' });
  };

  const filteredChallenges = challenges.filter(challenge => {
    // Difficulty filter
    if (filters.difficulty && challenge.difficulty !== filters.difficulty) {
      return false;
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return challenge.title.toLowerCase().includes(searchLower) ||
        challenge.description?.toLowerCase().includes(searchLower);
    }

    return true;
  });

  const handleJoinChallenge = async (challengeId) => {
    try {
      await api.post(`/challenges/${challengeId}/join`);
      toast.success('Joined challenge!');
      fetchChallenges();
      fetchUserStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join challenge');
    }
  };

  const handleSubmitProof = async (challengeId, proofData) => {
    try {
      // Robust check for File or Blob object
      const isFile = proofData && (
        proofData instanceof File ||
        proofData instanceof Blob ||
        (typeof proofData === 'object' && proofData.name && proofData.size)
      );

      if (isFile) {
        const formData = new FormData();
        formData.append('proof', proofData);
        await api.post(`/challenges/${challengeId}/submit-proof`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Ensure proofData is a string before sending
        const urlToSend = typeof proofData === 'string' ? proofData : String(proofData || '');
        await api.post(`/challenges/${challengeId}/submit-proof`, { proofUrl: urlToSend });
      }
      toast.success('Proof submitted! Rewards earned.');
      fetchChallenges();
      fetchUserStats();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit proof');
    }
  };

  const tabs = [
    { id: 'active', label: 'Active', count: stats.total - stats.completed },
    { id: 'completed', label: 'Completed', count: stats.completed },
    { id: 'all', label: 'All', count: stats.total }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">
                Challenges
              </h1>
              <p className="text-gray-600">
                Complete real-world environmental challenges
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Challenges</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Completed</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.completed}
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">In Progress</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.pending}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card mb-6 animate-slide-up">
          <div className="flex flex-wrap gap-2 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {tab.label}
                <span className="ml-2 text-sm">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="input"
                >
                  <option value="">All Difficulties</option>
                  <option value={DIFFICULTY_LEVELS.EASY}>Easy</option>
                  <option value={DIFFICULTY_LEVELS.MEDIUM}>Medium</option>
                  <option value={DIFFICULTY_LEVELS.HARD}>Hard</option>
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search challenges..."
                  className="input"
                />
              </div>

              {/* Clear Filters Button */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full btn btn-secondary"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Active Filters Display */}
            {(filters.difficulty || filters.search) && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {filters.difficulty && (
                  <span className="badge badge-info capitalize">
                    {filters.difficulty}
                  </span>
                )}
                {filters.search && (
                  <span className="badge badge-info">
                    Search: {filters.search}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white mb-6 animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">
                Make a Real Impact!
              </h3>
              <p className="text-white/90">
                Complete challenges in the real world, submit photo proof, and earn points. Your actions matter!
              </p>
            </div>
          </div>
        </div>

        {/* Challenges List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="card text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No challenges found
            </h3>
            <p className="text-gray-600 mb-4">
              {filters.difficulty || filters.search
                ? 'Try adjusting your filters'
                : 'Check back soon for new challenges!'}
            </p>
            {(filters.difficulty || filters.search) && (
              <button onClick={clearFilters} className="btn btn-primary">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredChallenges.length} challenge{filteredChallenges.length !== 1 ? 's' : ''}
            </div>
            <ChallengePage
              challenges={filteredChallenges}
              onJoin={handleJoinChallenge}
              onSubmitProof={handleSubmitProof}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Challenges;