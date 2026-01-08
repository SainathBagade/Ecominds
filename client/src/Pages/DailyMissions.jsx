import React, { useState, useEffect } from 'react';
import { useMission } from '@hooks/useDailyMissions';
import MissionCard from '@components/Dashboard/MissionCard';
import ProofUploadModal from '@components/Dashboard/ProofUploadModal';
import MissionDetailModal from '@components/Dashboard/MissionDetailModal';
import Loader from '@components/Common/Loader';
import { Target, CheckCircle, Clock, Flame, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

const DailyMissions = () => {
  const { missions, loading, completeMission, submitMissionProof } = useMission();
  const [selectedMission, setSelectedMission] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const completedMissions = missions?.filter(m => m.status === 'completed') || [];
  const activeMissions = missions?.filter(m => m.status !== 'completed') || [];
  const completionRate = missions?.length > 0
    ? Math.round((completedMissions.length / missions.length) * 100)
    : 0;

  const handleMissionClick = (mission) => {
    setSelectedMission(mission);
    setShowDetailModal(true);
  };

  const handleMissionAction = async (mission) => {
    if (mission.requiresProof) {
      setSelectedMission(mission);
      setShowProofModal(true);
    } else {
      try {
        await completeMission(mission._id);
        toast.success('🎯 Mission completed!');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to complete mission');
      }
    }
  };

  const handleProofUpload = async (missionId, file, description) => {
    try {
      await submitMissionProof(missionId, file, description);
      toast.success('📸 Proof submitted for review!');
      setShowProofModal(false);
      setSelectedMission(null);
    } catch (error) {
      toast.error('Failed to submit proof');
    }
  };

  const getTotalPoints = () => {
    return missions?.reduce((sum, m) => sum + (m.status === 'completed' ? m.rewardPoints : 0), 0) || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

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
                Daily Missions
              </h1>
              <p className="text-gray-600">
                Complete today's missions to earn bonus points
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Missions</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {missions?.length || 0}
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Completed</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {completedMissions.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Points Earned</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {getTotalPoints()}
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {completionRate}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Banner */}
        <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold mb-1">
                Today's Progress
              </h3>
              <p className="text-white/90">
                {completedMissions.length} of {missions?.length || 0} missions completed
              </p>
            </div>
            <div className="text-right">
              <Clock className="w-8 h-8 mx-auto mb-1" />
              <div className="text-sm text-white/80">Resets at midnight</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-white rounded-full h-3 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Bonus Reward Banner */}
        {completionRate === 100 && (
          <div className="card bg-gradient-to-r from-yellow-400 to-yellow-600 text-white mb-6 animate-bounce-slow">
            <div className="flex items-center gap-4">
              <Trophy className="w-12 h-12" />
              <div>
                <h3 className="text-xl font-bold mb-1">
                  🎉 All Missions Complete!
                </h3>
                <p className="text-white/90">
                  You've earned a +50 bonus points for completing all daily missions!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Active Missions */}
        {activeMissions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-primary-600" />
              Active Missions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeMissions.map((mission) => (
                <MissionCard
                  key={mission._id}
                  mission={mission}
                  onClick={() => handleMissionClick(mission)}
                  onAction={() => handleMissionAction(mission)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Missions */}
        {completedMissions.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Completed Missions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedMissions.map((mission) => (
                <MissionCard
                  key={mission._id}
                  mission={mission}
                  onClick={() => handleMissionClick(mission)}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Missions */}
        {missions?.length === 0 && (
          <div className="card text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No missions available
            </h3>
            <p className="text-gray-600">
              Your daily missions will be generated at midnight. Check back tomorrow!
            </p>
          </div>
        )}

        {/* How It Works */}
        <div className="card mt-8 bg-blue-50 border border-blue-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            How Daily Missions Work
          </h3>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <strong>New missions daily:</strong> Get 3-5 fresh missions every day at midnight
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <strong>Complete tasks:</strong> Finish lessons, take quizzes, or complete challenges
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <strong>Submit proof:</strong> Some missions require photo proof of completion
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                4
              </div>
              <div>
                <strong>Earn rewards:</strong> Get bonus points for each completed mission
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                5
              </div>
              <div>
                <strong>Complete all:</strong> Finish all daily missions for a +50 bonus points reward!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proof Upload Modal */}
      {showProofModal && (
        <ProofUploadModal
          mission={selectedMission}
          onClose={() => {
            setShowProofModal(false);
            setSelectedMission(null);
          }}
          onSubmit={handleProofUpload}
        />
      )}
      {/* Mission Detail Modal */}
      <MissionDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        mission={selectedMission}
        onAction={handleMissionAction}
      />
    </div>
  );
};

export default DailyMissions;