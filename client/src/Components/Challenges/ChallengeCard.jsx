import React, { useContext, useState } from 'react';
import { Trophy, Clock, Users, Star, CheckCircle, Camera, Loader2, ArrowRight } from 'lucide-react';
import { AuthContext } from '../../Context/AuthContext';
import toast from 'react-hot-toast';

const ChallengeCard = ({ challenge, onJoin, onSubmitProof }) => {
  const { user } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProofInput, setShowProofInput] = useState(false);
  const [proofUrl, setProofUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setProofUrl(file.name);
    }
  };

  const {
    _id,
    title,
    description,
    difficulty = 'Medium',
    category,
    participants = [],
    rewards = { xp: 0, coins: 0 },
    status = 'active'
  } = challenge || {};

  const participant = participants.find(p => p.user === user?._id || p.user?._id === user?._id);
  const isJoined = !!participant;
  const isCompleted = participant?.isCompleted;

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    hard: 'bg-red-100 text-red-800 border-red-300',
    expert: 'bg-purple-100 text-purple-800 border-purple-300'
  };

  const handleAction = async () => {
    if (!isJoined) {
      onJoin && onJoin(_id);
    } else if (!isCompleted) {
      setShowProofInput(true);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile && !proofUrl) {
      toast.error('Please provide a proof image or URL');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmitProof(_id, selectedFile || proofUrl);
      setShowProofInput(false);
      setSelectedFile(null);
      setProofUrl('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group">
      <div className="relative">
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border capitalize shadow-sm z-10 ${difficultyColors[difficulty.toLowerCase()]}`}>
          {difficulty}
        </div>

        {isCompleted && (
          <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg z-10 animate-bounce">
            <CheckCircle size={14} />
            Completed
          </div>
        )}

        <div className="bg-gradient-to-br from-primary-500 to-primary-700 h-40 flex items-center justify-center relative overflow-hidden">
          <Trophy className="text-white/20 absolute -right-4 -bottom-4" size={120} />
          <div className="relative z-1 w-20 h-20 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/30 transform group-hover:scale-110 transition-transform duration-500">
            <Trophy className="text-white" size={40} />
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{title}</h3>
        <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">{description}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-200">
            {category || 'ENVIRONMENT'}
          </span>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">
            {challenge.type || 'CHALLENGE'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase mb-1">Participants</span>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-primary-500" />
              <span className="font-bold text-gray-700">{participants.length}</span>
            </div>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-gray-400 font-bold uppercase mb-1">Rewards</span>
            <div className="flex items-center justify-end gap-2">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-gray-700">{rewards.xp} XP</span>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          {showProofInput ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="relative">
                <input
                  type="file"
                  id={`proof-upload-${_id}`}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor={`proof-upload-${_id}`}
                  className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary-400 cursor-pointer transition-all bg-gray-50 flex items-center justify-center gap-2 text-sm text-gray-500"
                >
                  {selectedFile ? (
                    <span className="text-primary-600 font-bold flex items-center gap-2 truncate px-4">
                      <CheckCircle size={16} className="flex-shrink-0" />
                      <span className="truncate">{selectedFile.name}</span>
                    </span>
                  ) : (
                    <>
                      <Camera size={18} />
                      Click to select image proof
                    </>
                  )}
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowProofInput(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-[2] px-4 py-3 rounded-xl font-bold text-sm bg-primary-600 text-white hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-200 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  Submit Proof
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleAction}
              disabled={isCompleted}
              className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm
                ${isCompleted
                  ? 'bg-green-50 text-green-500 cursor-default'
                  : isJoined
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-yellow-100'
                    : 'bg-gray-900 text-white hover:bg-gray-800 shadow-gray-200'}`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Challenge Completed
                </>
              ) : isJoined ? (
                <>
                  <Camera className="w-5 h-5" />
                  Submit Proof
                </>
              ) : (
                <>
                  Start Mission
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;