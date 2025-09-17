import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { registerOwner, loginUser } from '../services/api';

const LoginPage = () => {
  const [isRegisterView, setIsRegisterView] = useState(false);
  const [mobileNo, setMobileNo] = useState('');
  const [pin, setPin] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const getErrorMessage = (err) => {
    console.error("Full API Error Object:", err.response);
    if (!err.response) {
      return "Network error. Please check your connection and the API server.";
    }
    const detail = err.response.data?.detail;
    if (detail) {
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail) && detail.length > 0) return detail[0].msg || 'Invalid input.';
    }
    return 'An unexpected error occurred. Please try again.';
  };

  // --- Nayi Client-Side Validation Logic ---
  const validateInputs = () => {
    const mobileRegex = /^[6-9]\d{9}$/;
    const pinRegex = /^\d{6}$/;

    if (!mobileRegex.test(mobileNo)) {
      setError("Please enter a valid 10-digit mobile number.");
      return false;
    }
    if (!pinRegex.test(pin)) {
      setError("PIN must be a 6-digit number.");
      return false;
    }
    // Agar register kar rahe hain, toh owner ka naam bhi check karein
    if (isRegisterView && ownerName.trim() === '') {
        setError("Owner name cannot be empty.");
        return false;
    }
    return true;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // API call se pehle inputs validate karein
    if (!validateInputs()) {
      return;
    }
    setLoading(true);
    try {
      await registerOwner({ ownerName, mobileNo, pin });
      setIsRegisterView(false);
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
    setError('');
    // API call se pehle inputs validate karein
    if (!validateInputs()) {
      return;
    }
    setLoading(true);
    try {
      const response = await loginUser({ mobileNo, pin });
      if (response.data && response.data.access_token) {
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
          {/* Form mein 'noValidate' add karein taaki browser ki default validation band ho jaaye */}
          <form onSubmit={isRegisterView ? handleRegisterSubmit : handleLoginSubmit} className="space-y-6" noValidate>
            {isRegisterView && (
              <div>
                <label htmlFor="ownerName" className="text-sm font-medium text-gray-300 block mb-2">Owner Name</label>
                <input type="text" id="ownerName" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="w-full px-4 py-2 text-white bg-gray-700 rounded-md" required />
              </div>
            )}
            
            <div>
              <label htmlFor="mobileNo" className="text-sm font-medium text-gray-300 block mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                id="mobileNo"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                className="w-full px-4 py-2 text-white bg-gray-700 rounded-md"
                required
                maxLength="10"
              />
            </div>

            <div>
              <label htmlFor="pin" className="text-sm font-medium text-gray-300 block mb-2">
                PIN
              </label>
              <input
                type="password"
                id="pin"
                inputMode="numeric" 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-2 text-white bg-gray-700 rounded-md"
                required
                maxLength="6"
              />
            </div>

            {error && (<div className="text-red-400 text-sm text-center">{error}</div>)}
            <button type="submit" disabled={loading} className="w-full py-3 px-4 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
              {loading ? 'Processing...' : (isRegisterView ? 'Register' : 'Login')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            {isRegisterView ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsRegisterView(!isRegisterView); setError(''); }}
              className="font-medium text-indigo-400 hover:underline"
            >
              {isRegisterView ? 'Login' : 'Register Here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

