import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom'; // Make sure Link is imported

const OwnerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const ownerName = user?.mobileNo || "Owner";
  const cafeName = "Billiards One";

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <header className="bg-gray-800 shadow-md p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{cafeName}</h1>
          <p className="text-sm text-gray-400">Owner: {ownerName}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
        >
          Logout
        </button>
      </header>
      
      <main className="p-6">
        <h2 className="text-3xl font-bold mb-6">Owner Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CORRECTED: Use Link for navigation instead of a div with onClick */}
          <Link 
            to="/owner/manage-cafe" 
            className="bg-gray-800 p-6 rounded-xl shadow-lg hover:bg-gray-700 cursor-pointer transition-colors duration-300 block"
          >
            <h3 className="text-xl font-bold text-indigo-400">Cafe Management</h3>
            <p className="text-gray-400 mt-2">Add/edit cafes, staff, and tables.</p>
          </Link>
          
          {/* This one can also be a Link for consistency */}
          <Link 
            to="/owner/analytics" 
            className="bg-gray-800 p-6 rounded-xl shadow-lg hover:bg-gray-700 cursor-pointer transition-colors duration-300 block"
          >
            <h3 className="text-xl font-bold text-indigo-400">Analytics</h3>
            <p className="text-gray-400 mt-2">View revenue and performance.</p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default OwnerDashboard;

