import React, { useState, useEffect } from "react";
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [businessRequests, setBusinessRequests] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentYear] = useState(new Date().getFullYear());
  const [currentRequest, setCurrentRequest] = useState({
    id: null,
    name: "",
    category: "",
    address: "",
    website: "",
    image: null,
  });
  const [imageFile, setImageFile] = useState(null); // New state for the image file
  const [websiteEditError, setWebsiteEditError] = useState("");
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [claimRequests, setClaimRequests] = useState([]);

  const navigate = useNavigate();

  // Dummy categories for the dropdown
  const categories = [
    "Finance",
    "Travel Company",
    "Health",
    "Store",
    "Food and Beverage",
    "Electronics and Technology",
    "Insurance Agency"
  ];

  // Fetch user data and business requests when the component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/users/myprofile  `,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUser(data);
        setUsername(data?.username || "");
        setEmail(data?.email || "");
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchBusinessRequests = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/users/mybusiness`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch business requests");
        const data = await response.json();
        setBusinessRequests(data);
      } catch (error) {
        setError(error.message);
      }
    };

    const fetchClaimRequests = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/users/my-claims`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error("Failed to fetch claim requests");
        const data = await response.json();
        setClaimRequests(data);
      } catch (error) {
        // Optionally handle error
      }
    };

    fetchUserData();
    fetchBusinessRequests();
    fetchClaimRequests();
  }, [navigate]);

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/users/updateuserprofile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username, email }),
        }
      );

      if (!response.ok) throw new Error("Failed to update profile");
      setUser({ ...user, username, email });
      alert("Profile updated successfully!");
      setEditMode(false);
    } catch (error) {
      setError(error.message);
    }
  };

  // Handle request edit
  const handleEditRequest = (request) => {
    setCurrentRequest({
      id: request._id,
      name: request.businessName,
      category: request.category,
      address: request.address,
      website: request.website,
    });
    setImageFile(null); // Reset the image file when editing a request
  };

  const handleUpdateRequest = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("businessName", currentRequest.name);
    formData.append("category", currentRequest.category);
    formData.append("address", currentRequest.address);
    formData.append("website", currentRequest.website);
    if (imageFile) {
      formData.append("image", imageFile); // Add image file if provided
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/business-request/${currentRequest.id}/edit`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` }, // Don't set Content-Type for FormData
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to update business request");
      const updatedRequest = await response.json();
      setBusinessRequests(
        businessRequests.map((req) =>
          req._id === updatedRequest.updatedRequest._id
            ? updatedRequest.updatedRequest
            : req
        )
      );

      // Reset the current request state
      setCurrentRequest({
        id: null,
        name: "",
        category: "",
        address: "",
        website: "",
      });
      setImageFile(null); // Reset image file after update
      alert("Business request updated successfully!");
    } catch (error) {
      setError(error.message);
    }
  };

  // Handle delete request
  const handleDeleteRequest = async (id) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/business-request/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to delete business request");
      setBusinessRequests(businessRequests.filter((req) => req._id !== id));
      alert("Business request deleted successfully!");
    } catch (error) {
      setError(error.message);
    }
  };

  // Send verification request for a business
  const handleRequestVerification = async (businessId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/business-request/${businessId}/request-verification`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to send verification request");
      alert("Verification request sent!");
      setVerificationRequests([...verificationRequests, businessId]);
    } catch (error) {
      alert(error.message);
    }
  };

  // Handle delete claim
  const handleDeleteClaim = async (id) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Are you sure you want to delete this claim?")) return;
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/business-claim/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to delete claim");
      setClaimRequests(claimRequests.filter((claim) => claim._id !== id));
      alert("Claim deleted successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  // Group claims by businessId and only show the most recent claim for each business
  const latestClaims = Object.values(
    claimRequests.reduce((acc, claim) => {
      const bId = claim.businessId?._id || (typeof claim.businessId === 'string' ? claim.businessId : undefined);
      if (!bId) return acc;
      if (!acc[bId] || new Date(claim.createdAt) > new Date(acc[bId].createdAt)) {
        acc[bId] = claim;
      }
      return acc;
    }, {})
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      <NavBar navItems={null} />
      <main className="flex-grow pt-28 pb-10 px-4 md:px-0 max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">My Profile</h1>
          </div>
          <div className="flex gap-4">
            {!user && (
              <button
                className="bg-blue-500 hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
            )}
            {user && user.role === 'admin' && (
              <button
                className="bg-blue-700 hover:bg-blue-900 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
                onClick={() => navigate('/admin-dashboard')}
              >
                Admin Dashboard
              </button>
            )}
            {user && (
              <button
                className="bg-green-600 hover:bg-green-800 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
                onClick={() => navigate('/business-request')}
              >
                Business Request
              </button>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">User Profile</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Username:</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!editMode}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!editMode}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <button
                type="button"
                onClick={() => setEditMode(!editMode)}
                className="bg-blue-500 hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
              >
                {editMode ? "Cancel" : "Edit Profile"}
              </button>
              {editMode && (
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-800 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
                >
                  Save Changes
                </button>
              )}
            </div>
          </form>
        </div>
        <div className="bg-white rounded-xl shadow-md p-8">
          <h3 className="text-xl font-bold text-blue-700 mb-4">My Business Requests</h3>
          {businessRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {businessRequests.map((request) => (
                <div key={request._id} className="bg-gray-50 rounded-lg shadow p-6 flex flex-col gap-2 relative">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-blue-700">
                      {request.businessName}
                      {request.verificationStatus === 'approved' && (
                        <span title="Verified" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 6 }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M8 0L9.99182 1.3121L12.3696 1.29622L13.3431 3.48797L15.3519 4.77336L14.9979 7.14888L16 9.32743L14.431 11.1325L14.1082 13.5126L11.8223 14.1741L10.277 16L8 15.308L5.72296 16L4.17772 14.1741L1.89183 13.5126L1.569 11.1325L0 9.32743L1.00206 7.14888L0.648112 4.77336L2.65693 3.48797L3.6304 1.29622L6.00818 1.3121L8 0Z" fill="#0095F6"></path>
                            <path fillRule="evenodd" clipRule="evenodd" d="M10.4036 5.20536L7.18853 8.61884L6.12875 7.49364C5.8814 7.23102 5.46798 7.21864 5.20536 7.466C4.94274 7.71335 4.93036 8.12677 5.17771 8.38939L6.71301 10.0195C6.9709 10.2933 7.40616 10.2933 7.66405 10.0195L11.3546 6.10111C11.6019 5.83848 11.5896 5.42507 11.3269 5.17771C11.0643 4.93036 10.6509 4.94274 10.4036 5.20536Z" fill="white"></path>
                          </svg>
                        </span>
                      )}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ml-2 ${request.status === 'approved' ? 'bg-green-100 text-green-700' : request.status === 'declined' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{request.status || 'pending'}</span>
                  </div>
                  <div className="text-gray-600 text-sm mb-1">{request.category}</div>
                  <div className="text-gray-500 text-sm mb-1">{request.address}</div>
                  <a
                    href={request.website?.startsWith('http') ? request.website : `http://${request.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline mb-2 text-sm"
                  >
                    {request.website}
                  </a>
                  {request.status === 'declined' && request.feedback && (
                    <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-2 text-xs font-semibold">
                      Reason: {request.feedback}
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEditRequest(request)}
                      className="bg-blue-500 hover:bg-blue-800 text-white font-semibold py-1 px-4 rounded-lg shadow text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(request._id)}
                      className="bg-red-600 hover:bg-red-800 text-white font-semibold py-1 px-4 rounded-lg shadow text-sm"
                    >
                      Delete
                    </button>
                    {request.status === 'approved' && !verificationRequests.includes(request._id) && (
                      <button
                        onClick={() => handleRequestVerification(request._id)}
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-semibold py-1 px-4 rounded-lg shadow text-sm"
                      >
                        Request Verification
                      </button>
                    )}
                    {request.status === 'approved' && verificationRequests.includes(request._id) && (
                      <span className="text-yellow-700 font-semibold text-xs ml-2">Verification Requested</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No business requests found.</p>
          )}

          {currentRequest.id && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <form onSubmit={handleUpdateRequest} className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md space-y-4 relative">
                <h4 className="text-lg font-bold text-blue-700 mb-2">Edit Business Request</h4>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Business Name:</label>
                  <input
                    type="text"
                    value={currentRequest.name}
                    onChange={(e) => setCurrentRequest({
                      ...currentRequest,
                      name: e.target.value,
                    })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Category:</label>
                  <select
                    value={currentRequest.category}
                    onChange={(e) => setCurrentRequest({
                      ...currentRequest,
                      category: e.target.value,
                    })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Address:</label>
                  <input
                    type="text"
                    value={currentRequest.address}
                    onChange={(e) => setCurrentRequest({
                      ...currentRequest,
                      address: e.target.value,
                    })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Website:</label>
                  <input
                    type="text"
                    value={currentRequest.website}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCurrentRequest({
                        ...currentRequest,
                        website: value,
                      });
                      // Uniqueness check (ignore current editing request)
                      const isDuplicate = businessRequests.some(req => req.website === value && req._id !== currentRequest.id);
                      if (isDuplicate) {
                        setWebsiteEditError("This domain is already used by another business request.");
                      } else {
                        setWebsiteEditError("");
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="e.g. google.com"
                  />
                  {websiteEditError && (
                    <div className="text-red-600 text-xs mt-1">{websiteEditError}</div>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Upload New Image:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-4 mt-4">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-800 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
                    disabled={!!websiteEditError}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentRequest({ id: null, name: '', category: '', address: '', website: '', image: null })}
                    className="bg-gray-400 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        {/* My Business Claim Requests */}
        {latestClaims.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">My Business Claim Requests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {latestClaims.map((claim) => (
                <div key={claim._id} className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-blue-700 mb-1">{claim.businessId?.businessName || 'Business'}</h3>
                  <div className="text-gray-600 mb-1">{claim.businessId?.category}</div>
                  <div className="text-gray-500 mb-1 text-sm">{claim.businessId?.address}</div>
                  <a
                    href={claim.businessId?.website?.startsWith('http') ? claim.businessId.website : `http://${claim.businessId?.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline mb-2 text-sm"
                  >
                    {claim.businessId?.website}
                  </a>
                  {/* Show submitted documents */}
                  {(claim.requiredDocs?.length > 0 || claim.additionalDocs?.length > 0) && (
                    <div className="mb-2">
                      <span className="font-semibold">Submitted Documents:</span>
                      <ul className="list-disc ml-6 mt-1">
                        {claim.requiredDocs && claim.requiredDocs.map((doc, idx) => (
                          <li key={idx}>
                            <span className="text-gray-700 font-semibold mr-2">{doc.type ? doc.type : 'Required Document'}:</span>
                            <a href={`${process.env.REACT_APP_API_URL?.split('/api')[0]}${doc.file || doc}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{doc.type ? doc.type : `Document ${idx + 1}`}</a>
                          </li>
                        ))}
                        {claim.additionalDocs && claim.additionalDocs.map((doc, idx) => (
                          <li key={idx}>
                            <span className="text-gray-700 font-semibold mr-2">Additional Document:</span>
                            <a href={`${process.env.REACT_APP_API_URL?.split('/api')[0]}${doc}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Document {idx + 1}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${claim.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : claim.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{claim.status}</span>
                  {claim.status === 'declined' && claim.feedback && (
                    <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-2 text-xs font-semibold">
                      Reason: {claim.feedback}
                    </div>
                  )}
                  {claim.status === 'declined' && claim.businessId?._id && (
                    <button
                      onClick={() => navigate(`/claim-business/${claim.businessId._id}`)}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-semibold py-1 px-4 rounded-lg shadow text-sm mt-2"
                    >
                      Submit Again
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteClaim(claim._id)}
                    className="bg-red-600 hover:bg-red-800 text-white font-semibold py-1 px-4 rounded-lg shadow text-sm mt-2"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;
