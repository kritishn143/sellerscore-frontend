import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './NavBar';
import Footer from './Footer';
import { Link } from 'react-router-dom';

const BusinessRequestForm = () => {
  const navigate = useNavigate();
  const [currentYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    businessName: '',
    address: '',
    website: '',
    category: '',
    image: null,
    imageUrl: '',
  });
  const [websiteError, setWebsiteError] = useState('');
  const [imageUrlError, setImageUrlError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0], imageUrl: '' }); // Clear imageUrl when file is selected
      setImageUrlError('');
    } else if (name === 'imageUrl') {
      setFormData({ ...formData, imageUrl: value, image: null }); // Clear image when URL is entered
      setImageUrlError('');
    } else if (name === 'website') {
      // Only allow domains without http://, https://, or www.
      const forbiddenPattern = /^(www\.|http:\/\/|https:\/\/)/i;
      const domainPattern = /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})*$/;
      if (forbiddenPattern.test(value)) {
        setWebsiteError('Please enter only the domain (e.g., google.com), without www., http://, or https://');
      } else if (!domainPattern.test(value)) {
        setWebsiteError('Please enter a valid domain (e.g., google.com, mysite.co, abc.org).');
      } else {
        setWebsiteError('');
      }
      setFormData({ ...formData, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateImageUrl = (url) => {
    if (!url) return true; // Empty URL is valid (optional field)
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setFormData(prev => ({ ...prev, image: file, imageUrl: '' })); // use functional update
    setImageUrl(""); // Clear URL if file is selected
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setFormData(prev => ({ ...prev, imageUrl: url, image: null })); // use functional update
    setImageFile(null); // Clear file if URL is entered
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!imageFile && !imageUrl) {
      setError("Please upload a file or enter an image URL.");
      return;
    }
    if (websiteError) return;
    
    // Validate image URL if provided
    if (formData.imageUrl && !validateImageUrl(formData.imageUrl)) {
      setImageUrlError('Please enter a valid image URL (e.g., https://example.com/image.jpg)');
      return;
    }

    console.log('Submitting:', formData); // Debug log

    const formDataToSend = new FormData();
    formDataToSend.append('businessName', formData.businessName);
    formDataToSend.append('address', formData.address);
    formDataToSend.append('website', formData.website);
    formDataToSend.append('category', formData.category);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }
    if (formData.imageUrl) {
      formDataToSend.append('imageUrl', formData.imageUrl);
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/business-request`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setFormData(response.data);
      alert('Business request submitted successfully!');
    } catch (error) {
      console.error('Submission error details:', error);
      if (error.response) {
        alert(`Error (${error.response.status}): ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        alert('No response from server. Please try again later.');
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      <Navbar navItems={
        <button
          className="bg-blue-500 hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
          onClick={() => navigate('/useraccount')}
        >
          profile
        </button>
      } />
      <main className="flex-grow pt-28 pb-10 px-4 md:px-0 flex flex-col items-center">
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-lg">
          <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Business Request Form</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Business Name:</label>
              <input type="text" name="businessName" value={formData.businessName || ""} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Address:</label>
              <input type="text" name="address" value={formData.address || ""} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Website or Social Media:</label>
              <input type="text" name="website" value={formData.website || ""} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="e.g. google.com" />
              {websiteError && <div className="text-red-600 text-xs mt-1">{websiteError}</div>}
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Category:</label>
              <select name="category" value={formData.category || ""} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Select a category</option>
                <option value="Finance">Finance</option>
                <option value="Travel Company">Travel Company</option>
                <option value="Health">Health</option>
                <option value="Store">Store</option>
                <option value="Food and Beverage">Food & Beverage</option>
                <option value="Electronics and Technology">Electronics & Technology</option>
                <option value="Insurance Agency">Insurance Agency</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Business Image:</label>
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Upload Image File:</label>
                  <input 
                    type="file" 
                    name="image" 
                    onChange={handleFileChange} 
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
                    disabled={!!imageUrl}
                  />
                </div>
                <div className="text-center text-gray-500 text-sm">- OR -</div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Image URL:</label>
                  <input 
                    type="url" 
                    name="imageUrl" 
                    value={imageUrl} 
                    onChange={handleUrlChange} 
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
                    disabled={!!imageFile}
                  />
                  {imageUrlError && <div className="text-red-600 text-xs mt-1">{imageUrlError}</div>}
                </div>
              </div>
            </div>
            {(formData.image || formData.imageUrl) && (
              <div className="flex justify-center">
                <img 
                  src={formData.image ? URL.createObjectURL(formData.image) : formData.imageUrl} 
                  alt="Business Preview" 
                  className="w-48 h-auto rounded-lg shadow" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow transition duration-200 mt-4">Submit</button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessRequestForm;
