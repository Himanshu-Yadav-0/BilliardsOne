import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { registerOwner, loginUser } from '../services/api';

const LoginPage = () => {
  // State for toggling between Login and Register views
  const [isRegisterView, setIsRegisterView] = useState(false);
  
  // State for form fields
  const [mobileNo, setMobileNo] = useState('');
  const [pin, setPin] = useState('');
  const [ownerName, setOwnerName] = useState('');
  
  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Get the login function from our AuthContext
  const { login } = useAuth();

  const getErrorMessage = (err) => {
    console.error("API Error Response:", err.response);
    const detail = err.response?.data?.detail;
    if (detail) {
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail) && detail.length > 0) return detail[0].msg || 'Invalid input.';
    }
    return 'An unexpected error occurred. Please try again.';
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerOwner({ ownerName, mobileNo, pin });
      // On success, automatically switch to the login view
      setIsRegisterView(false);
      // Clear fields for a better user experience
      setOwnerName('');
      setMobileNo('');
      setPin('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await loginUser({ mobileNo, pin });
      if (response.data && response.data.access_token) {
        // Call the login function from our context to update the global state
        login(response.data.access_token);
      } else {
        setError('Login failed to return a valid token.');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">Billiards One</h1>
          <p className="text-gray-400">Your Modern Cafe Manager</p>
        </div>
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-center text-white mb-6">
            {isRegisterView ? 'Owner Registration' : 'Welcome Back'}
          </h2>
          <form onSubmit={isRegisterView ? handleRegisterSubmit : handleLoginSubmit} className="space-y-6">
            {isRegisterView && (
              <div>
                <label htmlFor="ownerName" className="text-sm font-medium text-gray-300 block mb-2">Owner Name</label>
                <input type="text" id="ownerName" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
              </div>
            )}
            <div>
              <label htmlFor="mobileNo" className="text-sm font-medium text-gray-300 block mb-2">Mobile Number</label>
              <input type="tel" id="mobileNo" value={mobileNo} onChange={(e) => setMobileNo(e.target.value)} className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label htmlFor="pin" className="text-sm font-medium text-gray-300 block mb-2">PIN</label>
              <input type="password" id="pin" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            {error && (<div className="text-red-400 text-sm text-center">{error}</div>)}
            <button type="submit" disabled={loading} className="w-full py-3 px-4 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors duration-300 disabled:bg-indigo-400 disabled:cursor-not-allowed">
              {loading ? 'Processing...' : (isRegisterView ? 'Register' : 'Login')}
            </button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-6">
            {isRegisterView ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setIsRegisterView(!isRegisterView); setError(''); }} className="font-medium text-indigo-400 hover:underline focus:outline-none">
              {isRegisterView ? 'Login' : 'Register Here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

