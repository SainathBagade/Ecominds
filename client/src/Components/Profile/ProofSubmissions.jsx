import React, { useState, useEffect } from 'react';
import { Image, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@services/api';
import { PROOF_STATUS, SITE_URL } from '@utils/constants';

const ProofSubmissions = ({ userId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchSubmissions = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/submissions/proofs/user/${userId}`);
      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchSubmissions();
    }
  }, [userId, fetchSubmissions]);

  const getStatusBadge = (status) => {
    const badges = {
      [PROOF_STATUS.PENDING]: {
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800',
        label: 'Pending',
      },
      [PROOF_STATUS.APPROVED]: {
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800',
        label: 'Approved',
      },
      [PROOF_STATUS.REJECTED]: {
        icon: XCircle,
        color: 'bg-red-100 text-red-800',
        label: 'Rejected',
      },
      [PROOF_STATUS.NEEDS_REVISION]: {
        icon: Clock,
        color: 'bg-blue-100 text-blue-800',
        label: 'Needs Revision',
      },
    };

    const badge = badges[status] || badges[PROOF_STATUS.PENDING];
    const Icon = badge.icon;

    return (
      <span className={`badge ${badge.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Proof Submissions</h3>
        <span className="text-sm text-gray-600">
          {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {submissions.length === 0 ? (
        <div className="card text-center py-12">
          <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            No Submissions Yet
          </h4>
          <p className="text-gray-600">
            Your proof submissions for challenges and missions will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {submissions.map((submission) => (
            <div key={submission._id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {submission.challengeTitle || submission.missionTitle || 'Submission'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(submission.status)}
              </div>

              {submission.proofImage && (
                <div className="mb-3">
                  <img
                    src={submission.proofImage?.startsWith('http') ? submission.proofImage : `${SITE_URL}${submission.proofImage}`}
                    alt="Proof"
                    className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(submission.proofImage?.startsWith('http') ? submission.proofImage : `${SITE_URL}${submission.proofImage}`)}
                  />
                </div>
              )}

              {submission.description && (
                <p className="text-sm text-gray-700 mb-3">{submission.description}</p>
              )}

              {submission.feedback && (
                <div className={`p-3 rounded-lg ${submission.status === PROOF_STATUS.APPROVED
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
                  }`}>
                  <p className="text-sm font-medium text-gray-900 mb-1">Feedback:</p>
                  <p className="text-sm text-gray-700">{submission.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <XCircle className="w-6 h-6 text-gray-600" />
            </button>
            <img
              src={selectedImage?.startsWith('http') ? selectedImage : `${SITE_URL}${selectedImage}`}
              alt="Proof"
              className="max-w-full max-h-[90vh] rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProofSubmissions;

