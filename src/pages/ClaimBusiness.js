import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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

const ClaimBusiness = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [requiredDocInputs, setRequiredDocInputs] = useState([{ type: '', files: [] }]);
  const [additionalDocInputs, setAdditionalDocInputs] = useState([{ files: [] }]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await axios.get(`${REACT_APP_API_URL}/api/users/business/id/${id}`);
        setBusiness(response.data);
      } catch (err) {
        setError('Failed to load business details.');
      }
    };
    fetchBusiness();
  }, [id]);

  const handleRequiredDocTypeChange = (idx, value) => {
    setRequiredDocInputs((prev) => prev.map((input, i) => i === idx ? { ...input, type: value } : input));
  };

  const handleRequiredDocFileChange = (idx, files) => {
    setRequiredDocInputs((prev) => prev.map((input, i) => i === idx ? { ...input, files: Array.from(files) } : input));
  };

  const addRequiredDocInput = () => {
    setRequiredDocInputs((prev) => [...prev, { type: '', files: [] }]);
  };

  const handleAdditionalDocFileChange = (idx, files) => {
    setAdditionalDocInputs((prev) => prev.map((input, i) => i === idx ? { files: Array.from(files) } : input));
  };

  const addAdditionalDocInput = () => {
    setAdditionalDocInputs((prev) => [...prev, { files: [] }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasRequired = requiredDocInputs.some(doc => doc.type && doc.files.length > 0);
    const hasAdditional = additionalDocInputs.some(doc => doc.files.length > 0);
    if (!hasRequired && !hasAdditional) {
      setError('Please upload at least one required or additional document.');
      return;
    }
    setError('');
    const formData = new FormData();
    formData.append('businessId', id);
    requiredDocInputs.forEach((doc, idx) => {
      if (doc.type && doc.files.length > 0) {
        doc.files.forEach(file => {
          formData.append('requiredDocs', file);
          formData.append('requiredDocTypes', doc.type);
        });
      }
    });
    additionalDocInputs.forEach(doc => {
      if (doc.files.length > 0) {
        doc.files.forEach(file => formData.append('additionalDocs', file));
      }
    });
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${REACT_APP_API_URL}/api/users/business-claim`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Claim submitted successfully!');
      setTimeout(() => navigate(`/business/${business.businessName}`), 2000);
    } catch (err) {
      setError('Failed to submit claim.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      <NavBar />
      <main className="flex-grow pt-28 pb-10 px-4 md:px-0 max-w-2xl mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          <h1 className="text-2xl font-bold text-blue-900 mb-4">Claim Business</h1>
          {business && (
            <div className="mb-6">
              <div className="font-semibold text-lg text-blue-700">{business.businessName}</div>
              <div className="text-gray-600">{business.address}</div>
              <div className="text-gray-600">{business.category}</div>
              <div className="text-gray-600">{business.website}</div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-semibold mb-2">Upload at least one required document:</label>
              {requiredDocInputs.map((input, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <select
                    className="border rounded px-2 py-1"
                    value={input.type}
                    onChange={e => handleRequiredDocTypeChange(idx, e.target.value)}
                  >
                    <option value="">Select document type</option>
                    {REQUIRED_DOCS.map(doc => (
                      <option key={doc} value={doc}>{doc}</option>
                    ))}
                  </select>
                  <input
                    type="file"
                    multiple
                    onChange={e => handleRequiredDocFileChange(idx, e.target.files)}
                    className="w-full"
                  />
                  {idx === requiredDocInputs.length - 1 && (
                    <button type="button" onClick={addRequiredDocInput} className="text-blue-600 text-2xl font-bold px-2">+</button>
                  )}
                </div>
              ))}
            </div>
            <div>
              <label className="block font-semibold mb-2">Or upload additional document(s):</label>
              {additionalDocInputs.map((input, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <input
                    type="file"
                    multiple
                    onChange={e => handleAdditionalDocFileChange(idx, e.target.files)}
                    className="w-full"
                  />
                  {idx === additionalDocInputs.length - 1 && (
                    <button type="button" onClick={addAdditionalDocInput} className="text-blue-600 text-2xl font-bold px-2">+</button>
                  )}
                </div>
              ))}
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            <button type="submit" className="bg-blue-600 hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200">Submit Claim</button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ClaimBusiness; 