import React, { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import Loader from '@components/Common/Loader';
import { Image, CheckCircle, XCircle, Clock, TrendingUp, Brain, Sparkles, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@services/api';
import { USER_ROLES, PROOF_STATUS, SITE_URL } from '@utils/constants';

const ProofReview = () => {
  const { user } = useAuth();
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(PROOF_STATUS.PENDING);
  const [processingId, setProcessingId] = useState(null);
  const [formStates, setFormStates] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  const fetchProofs = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/submissions/proofs', {
        params: { status: activeTab }
      });
      const fetchedProofs = response.data.proofs || [];
      setProofs(fetchedProofs);

      const initialFormState = {};
      fetchedProofs.forEach(p => {
        initialFormState[p._id] = {
          score: p.score || 100,
          feedback: p.feedback || '',
          aiSuggestion: null
        };
      });
      setFormStates(initialFormState);
    } catch (error) {
      toast.error('Failed to load proofs');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const fetchStats = React.useCallback(async () => {
    try {
      const response = await api.get('/submissions/proofs/stats');
      setStats(response.data.stats || { pending: 0, approved: 0, rejected: 0, total: 0 });
    } catch (error) {
      console.error('Stats error:', error);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== USER_ROLES.TEACHER) {
      toast.error('Access denied. Teachers only.');
      window.location.href = '/dashboard';
      return;
    }
    fetchProofs();
    fetchStats();
  }, [fetchProofs, fetchStats, user]);

  const handleUpdateForm = (id, key, value) => {
    setFormStates(prev => ({
      ...prev,
      [id]: { ...prev[id], [key]: value }
    }));
  };

  const handleApprove = async (proofId) => {
    const state = formStates[proofId];
    const toastId = toast.loading('Verifying proof...');
    try {
      await api.put(`/submissions/proofs/${proofId}/approve`, {
        score: state.score,
        reason: state.feedback
      });
      toast.success('Proof approved successfully!', { id: toastId });
      fetchProofs();
      fetchStats();
    } catch (error) {
      toast.error('Failed to approve.', { id: toastId });
    }
  };

  const handleReject = async (proofId) => {
    const state = formStates[proofId];
    if (!state.feedback) {
      toast.error('Please provide a reason for rejection.');
      return;
    }
    const toastId = toast.loading('Rejecting proof...');
    try {
      await api.put(`/submissions/proofs/${proofId}/reject`, { reason: state.feedback });
      toast.success('Proof rejected.', { id: toastId });
      fetchProofs();
      fetchStats();
    } catch (error) {
      toast.error('Rejection failed.', { id: toastId });
    }
  };

  const handleAIVerify = async (proofId) => {
    setProcessingId(proofId);
    const toastId = toast.loading('AI analyzing evidence...');
    try {
      const response = await api.post(`/submissions/proofs/${proofId}/verify-ai`);
      const { score, feedback } = response.data.data;
      handleUpdateForm(proofId, 'score', score);
      handleUpdateForm(proofId, 'feedback', `[AI]: ${feedback}`);
      toast.success('AI check complete!', { id: toastId });
    } catch (error) {
      toast.error('AI check failed.', { id: toastId });
    } finally {
      setProcessingId(null);
    }
  };

  const tabs = [
    { id: PROOF_STATUS.PENDING, label: 'Pending', icon: Clock, count: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: PROOF_STATUS.APPROVED, label: 'Approved', icon: CheckCircle, count: stats.approved, color: 'text-green-600', bg: 'bg-green-50' },
    { id: PROOF_STATUS.REJECTED, label: 'Rejected', icon: XCircle, count: stats.rejected, color: 'text-red-600', bg: 'bg-red-50' }
  ];

  if (user?.role !== USER_ROLES.TEACHER) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShieldCheck className="text-primary-600 w-8 h-8" />
              Proof Review Hub
            </h1>
            <p className="text-gray-500 mt-1">Verify student evidence and award eco-points.</p>
          </div>

          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-50'
                  }`}
              >
                <tab.icon size={16} />
                {tab.label}
                <span className={`ml-1 px-2 py-0.5 rounded-full text-[11px] ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader />
            <p className="text-gray-400 text-sm mt-4 animate-pulse">Fetching submissions...</p>
          </div>
        ) : proofs.length === 0 ? (
          <div className="card text-center py-20 bg-white shadow-sm border border-gray-100">
            <Image className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No submissions found</h3>
            <p className="text-gray-500 mt-1">There are no proofs to review in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proofs.map((proof) => (
              <div key={proof._id} className="card bg-white flex flex-col overflow-hidden border border-gray-200">
                {/* Image */}
                <div
                  className="h-56 bg-gray-100 relative overflow-hidden cursor-zoom-in group/img"
                  onClick={() => setSelectedImage(proof.proofImage.startsWith('http') ? proof.proofImage : `${SITE_URL}${proof.proofImage}`)}
                >
                  {proof.proofImage ? (
                    <img
                      src={proof.proofImage.startsWith('http') ? proof.proofImage : `${SITE_URL}${proof.proofImage}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                      alt="Proof"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <Image size={40} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                    <Sparkles className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity w-8 h-8" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg uppercase tracking-wide">
                      {proof.type}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 leading-tight">{proof.studentName}</h4>
                      <p className="text-sm text-primary-600 font-semibold">{proof.challengeTitle}</p>
                    </div>
                    <p className="text-[11px] text-gray-400 font-bold uppercase">{new Date(proof.submittedAt).toLocaleDateString()}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100 flex-1">
                    <p className="text-gray-600 text-sm italic leading-relaxed">
                      "{proof.description || "No description provided."}"
                    </p>
                  </div>

                  {activeTab === PROOF_STATUS.PENDING ? (
                    <div className="space-y-4">
                      {/* AI Toggle */}
                      <button
                        onClick={() => handleAIVerify(proof._id)}
                        disabled={processingId === proof._id}
                        className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors disabled:opacity-50"
                      >
                        {processingId === proof._id ? <Loader2 size={14} /> : <Sparkles size={14} />}
                        Check with AI
                      </button>

                      {/* Inputs */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Score (0-100)</label>
                          <input
                            type="number"
                            value={formStates[proof._id]?.score}
                            onChange={(e) => handleUpdateForm(proof._id, 'score', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Feedback</label>
                          <input
                            type="text"
                            placeholder="Add a note..."
                            value={formStates[proof._id]?.feedback}
                            onChange={(e) => handleUpdateForm(proof._id, 'feedback', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(proof._id)}
                          className="flex-1 py-3 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 shadow-md shadow-green-100 flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(proof._id)}
                          className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-600 border border-gray-200 flex items-center justify-center gap-2"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-auto space-y-3">
                      <div className={`py-4 rounded-xl text-center border-dashed border-2 flex flex-col items-center gap-1 ${activeTab === PROOF_STATUS.APPROVED ? 'border-green-100 bg-green-50/50 text-green-700' : 'border-red-100 bg-red-50/50 text-red-700'
                        }`}>
                        <span className="text-[10px] uppercase font-bold opacity-60">Result</span>
                        <div className="flex items-center gap-2 font-bold">
                          <TrendingUp size={14} /> {proof.score || 0} Points
                        </div>
                      </div>
                      {proof.feedback && (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-[11px] text-gray-500 italic">
                          <span className="font-bold block mb-1 uppercase tracking-tight not-italic">Teacher Feedback:</span>
                          "{proof.feedback}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 bg-indigo-900 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-xl">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Brain className="text-indigo-300 w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Smart Verification Protocol</h3>
            <p className="text-indigo-200 text-sm leading-relaxed max-w-2xl">
              Our AI scanning tool helps you verify the authenticity of environmental proof.
              It checks for scene relevance, image quality, and keyword matches.
              The final decision and score are always at your discretion.
            </p>
          </div>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[100] flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <XCircle size={40} />
            </button>
            <img
              src={selectedImage}
              alt="Full Proof"
              className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl animate-scale-up"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const Loader2 = ({ size }) => (
  <div className="animate-spin" style={{ width: size, height: size }}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  </div>
);

export default ProofReview;
