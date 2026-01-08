import { useState, useEffect } from 'react';
import proofReviewService from '@services/proofReviewService';
import toast from 'react-hot-toast';

export const useProofReview = () => {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  useEffect(() => {
    fetchProofs();
    fetchStats();
  }, []);

  const fetchProofs = async (status = 'pending') => {
    setLoading(true);
    try {
      const data = await proofReviewService.getPendingProofs({ status });
      setProofs(data.proofs || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching proofs:', err);
      toast.error('Failed to load proofs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await proofReviewService.getProofStats();
      setStats(data.stats || { pending: 0, approved: 0, rejected: 0, total: 0 });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const approveProof = async (proofId) => {
    try {
      await proofReviewService.approveProof(proofId);
      toast.success('✅ Proof approved successfully!');
      
      // Remove from local state
      setProofs(prevProofs => prevProofs.filter(p => p._id !== proofId));
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        pending: prevStats.pending - 1,
        approved: prevStats.approved + 1
      }));
      
      return true;
    } catch (err) {
      toast.error('Failed to approve proof');
      console.error('Error approving proof:', err);
      throw err;
    }
  };

  const rejectProof = async (proofId, reason) => {
    try {
      await proofReviewService.rejectProof(proofId, reason);
      toast.success('Proof rejected');
      
      // Remove from local state
      setProofs(prevProofs => prevProofs.filter(p => p._id !== proofId));
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        pending: prevStats.pending - 1,
        rejected: prevStats.rejected + 1
      }));
      
      return true;
    } catch (err) {
      toast.error('Failed to reject proof');
      console.error('Error rejecting proof:', err);
      throw err;
    }
  };

  const getProofById = async (proofId) => {
    try {
      const data = await proofReviewService.getProofById(proofId);
      return data.proof;
    } catch (err) {
      toast.error('Failed to load proof details');
      throw err;
    }
  };

  const refreshProofs = (status = 'pending') => {
    fetchProofs(status);
    fetchStats();
  };

  const bulkApprove = async (proofIds) => {
    try {
      await proofReviewService.bulkApprove(proofIds);
      toast.success(`✅ ${proofIds.length} proofs approved!`);
      refreshProofs();
      return true;
    } catch (err) {
      toast.error('Failed to approve proofs');
      throw err;
    }
  };

  const bulkReject = async (proofIds, reason) => {
    try {
      await proofReviewService.bulkReject(proofIds, reason);
      toast.success(`${proofIds.length} proofs rejected`);
      refreshProofs();
      return true;
    } catch (err) {
      toast.error('Failed to reject proofs');
      throw err;
    }
  };

  return {
    proofs,
    loading,
    error,
    stats,
    approveProof,
    rejectProof,
    getProofById,
    refreshProofs,
    bulkApprove,
    bulkReject,
  };
};