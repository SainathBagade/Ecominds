import api from './api';

const proofReviewService = {
  // Get all pending proofs (teacher only)
  getPendingProofs: async (params = {}) => {
    try {
      const response = await api.get('/proofs/pending', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get proof by ID
  getProofById: async (proofId) => {
    try {
      const response = await api.get(`/proofs/${proofId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Approve proof (teacher only)
  approveProof: async (proofId) => {
    try {
      const response = await api.put(`/proofs/${proofId}/approve`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reject proof (teacher only)
  rejectProof: async (proofId, reason) => {
    try {
      const response = await api.put(`/proofs/${proofId}/reject`, { reason });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get review history (teacher only)
  getReviewHistory: async (params = {}) => {
    try {
      const response = await api.get('/proofs/history', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get proof statistics (teacher only)
  getProofStats: async () => {
    try {
      const response = await api.get('/proofs/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's proof submissions (student)
  getMyProofSubmissions: async (params = {}) => {
    try {
      const response = await api.get('/proofs/my-submissions', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get proof status (student)
  getProofStatus: async (proofId) => {
    try {
      const response = await api.get(`/proofs/${proofId}/status`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get proofs by status
  getProofsByStatus: async (status) => {
    try {
      const response = await api.get('/proofs/pending', {
        params: { status }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Bulk approve proofs (teacher only)
  bulkApprove: async (proofIds) => {
    try {
      const response = await api.post('/proofs/bulk-approve', { proofIds });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Bulk reject proofs (teacher only)
  bulkReject: async (proofIds, reason) => {
    try {
      const response = await api.post('/proofs/bulk-reject', { proofIds, reason });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default proofReviewService;