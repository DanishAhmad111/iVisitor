import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { visitorService } from '../../services/api';

export default function ApprovalPage({ action = 'approve' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [visitor, setVisitor] = useState(null);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);

  // Fetch visitor details on page load
  useEffect(() => {
    const fetchVisitorDetails = async () => {
      try {
        const response = await visitorService.getById(id);
        setVisitor(response);
      } catch (error) {
        setError('Failed to load visitor details. Please try again.');
        toast.error('Failed to load visitor details.');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVisitorDetails();
    }
  }, [id]);

  // Handle approve/reject button click
  const handleAction = async () => {
    setProcessing(true);
    try {
      const status = action === 'approve' ? 'approved' : 'rejected';
      const response = await visitorService.updateStatus(id, status);
      setVisitor(response);
      setCompleted(true);
      toast.success(
        action === 'approve'
          ? 'Visitor request approved successfully!'
          : 'Visitor request rejected successfully!'
      );
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      const errorMessage = action === 'approve'
        ? 'Failed to approve visitor.'
        : 'Failed to reject visitor.';
      toast.error(errorMessage + ' Please try again.');
      console.error('Error:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading visitor details...</p>
        </div>
      </div>
    );
  }

  if (error || !visitor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Error</h2>
            <p className="mt-2 text-sm text-gray-600">
              {error || 'Unable to load visitor details. Please try again or contact support.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              {action === 'approve' ? 'Visitor Approved!' : 'Visitor Rejected'}
            </h2>
            <div className="mt-4 text-sm text-gray-600">
              <p>Visitor: {visitor.visitorName}</p>
              <p>Email: {visitor.visitorEmail}</p>
              {action === 'approve' && (
                <p className="mt-2">An email with the verification code has been sent to the visitor.</p>
              )}
            </div>
            <p className="mt-4 text-sm text-gray-500">Redirecting to home page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-2xl w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {action === 'approve' ? 'Approve Visitor Request' : 'Reject Visitor Request'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Please review the visitor details below
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Visitor Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Visitor Name:</span>
              <span className="text-gray-900">{visitor.visitorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Visitor Email:</span>
              <span className="text-gray-900">{visitor.visitorEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Visit Reason:</span>
              <span className="text-gray-900">{visitor.visitReason}</span>
            </div>
            {visitor.carNumber && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Car Number:</span>
                <span className="text-gray-900">{visitor.carNumber}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Status:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {visitor.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            disabled={processing}
          >
            Cancel
          </button>
          <button
            onClick={handleAction}
            disabled={processing}
            className={`flex-1 px-6 py-3 rounded-lg font-medium text-white transition-colors ${action === 'approve'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              action === 'approve' ? 'Approve Visitor' : 'Reject Visitor'
            )}
          </button>
        </div>

        {action === 'approve' && (
          <p className="mt-4 text-xs text-gray-500 text-center">
            By approving, a verification code will be sent to the visitor's email.
          </p>
        )}
      </div>
    </div>
  );
}
