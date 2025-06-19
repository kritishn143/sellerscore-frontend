import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

const REQUIRED_DOCS = [
  'Certificate/Articles of Incorporation',
  'Business Registration or License Document',
  'Government-Issued Business Tax Document',
  'Business Bank Statement',
  'Recent utility Bill',
];

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [declineRequestId, setDeclineRequestId] = useState(null);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [currentYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [verificationLoading, setVerificationLoading] = useState(true);
  const [verificationError, setVerificationError] = useState('');
  const [verificationFeedback, setVerificationFeedback] = useState('');
  const [verificationActionId, setVerificationActionId] = useState(null);
  const [bulkDeclineModalOpen, setBulkDeclineModalOpen] = useState(false);
  const [bulkDeclineFeedback, setBulkDeclineFeedback] = useState("");
  const [claimRequests, setClaimRequests] = useState([]);
  const [claimLoading, setClaimLoading] = useState(true);
  const [claimError, setClaimError] = useState('');
  const [claimFeedback, setClaimFeedback] = useState('');
  const [claimActionId, setClaimActionId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${REACT_APP_API_URL}/api/users/api/admin/business-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(response.data);
      } catch (error) {
        setError('Failed to load business requests.');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  useEffect(() => {
    const fetchVerificationRequests = async () => {
      setVerificationLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${REACT_APP_API_URL}/api/users/api/admin/verification-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVerificationRequests(response.data);
      } catch (error) {
        setVerificationError('Failed to load verification requests.');
      } finally {
        setVerificationLoading(false);
      }
    };
    fetchVerificationRequests();
  }, []);

  useEffect(() => {
    const fetchClaimRequests = async () => {
      setClaimLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${REACT_APP_API_URL}/api/users/api/admin/business-claims`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClaimRequests(response.data.filter(r => r.status === 'pending'));
      } catch (error) {
        setClaimError('Failed to load claim requests.');
      } finally {
        setClaimLoading(false);
      }
    };
    fetchClaimRequests();
  }, []);

  const handleAction = async (requestId, action) => {
    if (action === 'decline' && !feedback) {
      setError('Please provide feedback for declining this request.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${REACT_APP_API_URL}/api/users/business-request/${requestId}/${action}`, { feedback }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(`Business request ${action}d successfully!`);
      setRequests(requests.filter(request => request._id !== requestId));
      setFeedback('');
      setDeclineRequestId(null);
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      setError(`Failed to ${action} request. ${error.response?.data?.error || ''}`);
    }
  };

  const handleVerificationAction = async (id, action) => {
    if (action === 'decline' && !verificationFeedback) {
      setVerificationError('Please provide feedback for declining this verification request.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${REACT_APP_API_URL}/api/users/api/admin/verification-requests/${id}`, { action, feedback: verificationFeedback }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVerificationRequests(verificationRequests.filter(req => req._id !== id));
      setVerificationFeedback('');
      setVerificationActionId(null);
      alert(`Verification request ${action}d successfully!`);
    } catch (error) {
      setVerificationError(`Failed to ${action} verification request.`);
    }
  };

  const handleClaimAction = async (id, action) => {
    if (action === 'decline' && !claimFeedback) {
      setClaimError('Please provide feedback for declining this claim.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${REACT_APP_API_URL}/api/users/api/admin/business-claim/${id}/${action}`, { feedback: claimFeedback }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClaimRequests(claimRequests.filter(req => req._id !== id));
      setClaimFeedback('');
      setClaimActionId(null);
      alert(`Claim ${action}d successfully!`);
    } catch (error) {
      setClaimError(`Failed to ${action} claim.`);
    }
  };

  const handleSelect = (id) => {
    setSelectedRequests((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleDeleteSelectedUI = async () => {
    if (selectedRequests.length === 0) return;
    if (!window.confirm('Are you sure you want to delete the selected requests?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${REACT_APP_API_URL}/api/users/business-requests`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { ids: selectedRequests },
      });
      setRequests(requests.filter((req) => !selectedRequests.includes(req._id)));
      setSelectedRequests([]);
      alert('Selected requests deleted successfully!');
    } catch (error) {
      alert('Failed to delete selected requests.');
    }
  };

  const handleCancel = () => {
    setFeedback('');
    setDeclineRequestId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleBulkDecline = async () => {
    if (selectedRequests.length === 0) return;
    if (!bulkDeclineFeedback) {
      alert('Please provide feedback for declining the selected requests.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await Promise.all(selectedRequests.map(id =>
        axios.put(`${REACT_APP_API_URL}/api/users/business-request/${id}/decline`, { feedback: bulkDeclineFeedback }, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ));
      setRequests(requests.map(req =>
        selectedRequests.includes(req._id)
          ? { ...req, status: 'declined', feedback: bulkDeclineFeedback }
          : req
      ));
      setSelectedRequests([]);
      setBulkDeclineModalOpen(false);
      setBulkDeclineFeedback("");
      alert('Selected requests declined successfully!');
    } catch (error) {
      alert('Failed to decline selected requests.');
    }
  };

  // Filtered and sorted requests
  const filteredRequests = requests
    .filter(
      (req) =>
        (statusFilter === 'all' || req.status === statusFilter) &&
        (req.businessName.toLowerCase().includes(search.toLowerCase()) ||
          req.category.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      <NavBar navItems={
        <button
          className="bg-blue-500 hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
          onClick={() => navigate('/useraccount')}
        >
          User Dashboard
        </button>
      } />
      <main className="flex-grow pt-28 pb-10 px-4 md:px-0 max-w-6xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-blue-800 mb-8">Admin Business Requests</h1>
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <input
            type="text"
            placeholder="Search by business name or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
            </select>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
          {selectedRequests.length > 0 && (
            <>
              <button
                className="bg-red-600 hover:bg-red-800 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
                onClick={handleDeleteSelectedUI}
              >
                Delete Selected
              </button>
              <button
                className="bg-yellow-600 hover:bg-yellow-800 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
                onClick={() => setBulkDeclineModalOpen(true)}
              >
                Decline Selected
              </button>
            </>
          )}
        </div>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRequests.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">No business requests found.</div>
            ) : (
              filteredRequests.map((request) => (
                <div key={request._id} className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-2 relative">
                  <input
                    type="checkbox"
                    checked={selectedRequests.includes(request._id)}
                    onChange={() => handleSelect(request._id)}
                    className="absolute top-4 right-4 w-5 h-5 accent-blue-600"
                  />
                  <div className="flex items-center gap-4 mb-2">
                    {request.imageUrl && (
                      <img src={`${REACT_APP_API_URL.split('/api')[0]}${request.imageUrl}`} alt={request.businessName} className="w-16 h-16 rounded-lg object-cover border-2 border-blue-200" />
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-blue-700 mb-1">
                        {request.businessName}
                        {request.verificationStatus === 'approved' && (
                          <span title="Verified" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 6 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <g>
                                <path d="M12 2l2.09 4.26L18 7.27l-3.41 3.32L15.18 15 12 12.77 8.82 15l.59-4.41L6 7.27l3.91-.99L12 2z" fill="#1da1f2"/>
                                <circle cx="12" cy="12" r="10" fill="#1da1f2"/>
                                <path d="M8.5 12.5l2 2 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                              </g>
                            </svg>
                          </span>
                        )}
                      </h2>
                      <div className="flex gap-2 items-center">
                        <span className="text-gray-600 text-sm">{request.category}</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${request.status === 'approved' ? 'bg-green-100 text-green-700' : request.status === 'declined' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{request.status || 'pending'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-500 mb-1 text-sm">{request.address}</div>
                  <a
                    href={request.website?.startsWith('http') ? request.website : `http://${request.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline mb-2 text-sm"
                  >
                    {request.website}
                  </a>
                  {request.feedback && (
                    <div className="text-xs text-red-500 font-semibold mb-1">Feedback: {request.feedback}</div>
                  )}
                  <div className="flex gap-2 mt-2">
                    {request.status === 'pending' && <>
                      <button
                        className="bg-green-600 hover:bg-green-800 text-white font-semibold py-1 px-4 rounded-lg shadow transition duration-200 text-sm"
                        onClick={() => handleAction(request._id, 'approve')}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-800 text-white font-semibold py-1 px-4 rounded-lg shadow transition duration-200 text-sm"
                        onClick={() => setDeclineRequestId(request._id)}
                      >
                        Decline
                      </button>
                    </>}
                  </div>
                  {declineRequestId === request._id && (
                    <div className="mt-2">
                      <textarea
                        className="w-full p-2 border border-gray-300 rounded mb-2"
                        placeholder="Feedback (required)"
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          className="bg-blue-600 hover:bg-blue-800 text-white font-semibold py-1 px-4 rounded-lg shadow text-sm"
                          onClick={() => handleAction(request._id, 'decline')}
                        >
                          Send
                        </button>
                        <button
                          className="bg-gray-400 hover:bg-gray-600 text-white font-semibold py-1 px-4 rounded-lg shadow text-sm"
                          onClick={handleCancel}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">Business Verification Requests</h2>
          {verificationLoading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : verificationError ? (
            <div className="text-center text-red-500">{verificationError}</div>
          ) : verificationRequests.length === 0 ? (
            <div className="text-center text-gray-500">No verification requests found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {verificationRequests.map((request) => (
                <div key={request._id} className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-2 relative">
                  <div className="flex items-center gap-4 mb-2">
                    {request.imageUrl && (
                      <img src={`${REACT_APP_API_URL.split('/api')[0]}${request.imageUrl}`} alt={request.businessName} className="w-16 h-16 rounded-lg object-cover border-2 border-blue-200" />
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-blue-700 mb-1">
                        {request.businessName}
                        {request.verificationStatus === 'approved' && (
                          <span title="Verified" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 6 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <g>
                                <path d="M12 2l2.09 4.26L18 7.27l-3.41 3.32L15.18 15 12 12.77 8.82 15l.59-4.41L6 7.27l3.91-.99L12 2z" fill="#1da1f2"/>
                                <circle cx="12" cy="12" r="10" fill="#1da1f2"/>
                                <path d="M8.5 12.5l2 2 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                              </g>
                            </svg>
                          </span>
                        )}
                      </h2>
                      <div className="flex gap-2 items-center">
                        <span className="text-gray-600 text-sm">{request.category}</span>
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">Verification Pending</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-500 mb-1 text-sm">{request.address}</div>
                  <a
                    href={request.website?.startsWith('http') ? request.website : `http://${request.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline mb-2 text-sm"
                  >
                    {request.website}
                  </a>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="bg-green-600 hover:bg-green-800 text-white font-semibold py-1 px-4 rounded-lg shadow transition duration-200 text-sm"
                      onClick={() => handleVerificationAction(request._id, 'approve')}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-red-600 hover:bg-red-800 text-white font-semibold py-1 px-4 rounded-lg shadow transition duration-200 text-sm"
                      onClick={() => setVerificationActionId(request._id)}
                    >
                      Decline
                    </button>
                  </div>
                  {verificationActionId === request._id && (
                    <div className="mt-2">
                      <textarea
                        className="w-full p-2 border border-gray-300 rounded mb-2"
                        placeholder="Feedback (required)"
                        value={verificationFeedback}
                        onChange={e => setVerificationFeedback(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          className="bg-blue-600 hover:bg-blue-800 text-white font-semibold py-1 px-4 rounded-lg shadow text-sm"
                          onClick={() => handleVerificationAction(request._id, 'decline')}
                        >
                          Send
                        </button>
                        <button
                          className="bg-gray-400 hover:bg-gray-600 text-white font-semibold py-1 px-4 rounded-lg shadow text-sm"
                          onClick={() => { setVerificationActionId(null); setVerificationFeedback(''); }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">Business Claim Requests</h2>
          {claimLoading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : claimError ? (
            <div className="text-center text-red-500">{claimError}</div>
          ) : claimRequests.length === 0 ? (
            <div className="text-center text-gray-500">No claim requests found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {claimRequests.map((claim) => (
                <div key={claim._id} className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-2 relative">
                  <div className="flex items-center gap-4 mb-2">
                    {claim.businessId?.imageUrl && (
                      <img src={`${REACT_APP_API_URL.split('/api')[0]}${claim.businessId.imageUrl}`} alt={claim.businessId.businessName} className="w-16 h-16 rounded-lg object-cover border-2 border-blue-200" />
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-blue-700 mb-1">{claim.businessId?.businessName}</h2>
                      <div className="flex gap-2 items-center">
                        <span className="text-gray-600 text-sm">{claim.businessId?.category}</span>
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">Claim Pending</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-500 mb-1 text-sm">{claim.businessId?.address}</div>
                  <a
                    href={claim.businessId?.website?.startsWith('http') ? claim.businessId.website : `http://${claim.businessId?.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline mb-2 text-sm"
                  >
                    {claim.businessId?.website}
                  </a>
                  <div className="mb-2">
                    <span className="font-semibold">Documents:</span>
                    <ul className="list-disc ml-6 mt-1">
                      {claim.requiredDocs && claim.requiredDocs.map((doc, idx) => (
                        <li key={idx}>
                          <span className="text-gray-700 font-semibold mr-2">{doc.type ? doc.type : 'Required Document'}:</span>
                          <a href={`${REACT_APP_API_URL.split('/api')[0]}${doc.file || doc}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{doc.type ? doc.type : `Document ${idx + 1}`}</a>
                        </li>
                      ))}
                      {claim.additionalDocs && claim.additionalDocs.map((doc, idx) => (
                        <li key={idx}>
                          <span className="text-gray-700 font-semibold mr-2">Additional Document:</span>
                          <a href={`${REACT_APP_API_URL.split('/api')[0]}${doc}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Document {idx + 1}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="bg-green-600 hover:bg-green-800 text-white font-semibold py-1 px-4 rounded-lg shadow transition duration-200 text-sm"
                      onClick={() => handleClaimAction(claim._id, 'approve')}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-red-600 hover:bg-red-800 text-white font-semibold py-1 px-4 rounded-lg shadow transition duration-200 text-sm"
                      onClick={() => setClaimActionId(claim._id)}
                    >
                      Decline
                    </button>
                  </div>
                  {claimActionId === claim._id && (
                    <div className="mt-2">
                      <textarea
                        className="w-full p-2 border border-gray-300 rounded mb-2"
                        placeholder="Feedback (required)"
                        value={claimFeedback}
                        onChange={e => setClaimFeedback(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          className="bg-blue-600 hover:bg-blue-800 text-white font-semibold py-1 px-4 rounded-lg shadow text-sm"
                          onClick={() => handleClaimAction(claim._id, 'decline')}
                        >
                          Send
                        </button>
                        <button
                          className="bg-gray-400 hover:bg-gray-600 text-white font-semibold py-1 px-4 rounded-lg shadow text-sm"
                          onClick={() => { setClaimActionId(null); setClaimFeedback(''); }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
      {bulkDeclineModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md space-y-4 relative">
            <h4 className="text-lg font-bold text-blue-700 mb-2">Decline Selected Requests</h4>
            <textarea
              className="w-full p-2 border border-gray-300 rounded mb-2"
              placeholder="Feedback (required)"
              value={bulkDeclineFeedback}
              onChange={e => setBulkDeclineFeedback(e.target.value)}
            />
            <div className="flex gap-2 mt-4">
              <button
                className="bg-yellow-600 hover:bg-yellow-800 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
                onClick={handleBulkDecline}
              >
                Decline
              </button>
              <button
                className="bg-gray-400 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
                onClick={() => { setBulkDeclineModalOpen(false); setBulkDeclineFeedback(""); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
