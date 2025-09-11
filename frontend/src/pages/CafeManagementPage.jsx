import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOwnerCafes } from '../services/api';

// Import the final, dynamic tab components
import CafesTab from '../components/management/CafesTab';
import StaffTab from '../components/management/StaffTab';
import TablesTab from '../components/management/TablesTab';
import PricingTab from '../components/management/PricingTab';

const CafeManagementPage = () => {
  const [activeTab, setActiveTab] = useState('cafes');
  const [cafes, setCafes] = useState([]);
  const [loadingCafes, setLoadingCafes] = useState(true);
  const navigate = useNavigate();

  // This function fetches the list of cafes from the backend.
  // useCallback is used for optimization, so the function isn't recreated on every render.
  const fetchCafes = useCallback(async () => {
    try {
      setLoadingCafes(true);
      const response = await getOwnerCafes();
      setCafes(response.data);
    } catch (error) {
      console.error("Failed to fetch cafes", error);
      // Optionally, set an error state here to show in the UI
    } finally {
      setLoadingCafes(false);
    }
  }, []);

  // This useEffect hook calls fetchCafes once when the component first mounts.
  useEffect(() => {
    fetchCafes();
  }, [fetchCafes]);

  // This function determines which tab component to render based on the activeTab state.
  const renderContent = () => {
    if (loadingCafes) {
      return <p className="text-gray-400">Loading your cafe data...</p>;
    }

    switch (activeTab) {
      case 'cafes': 
        // We pass the initial list of cafes and a function to refresh the list
        return <CafesTab initialCafes={cafes} onCafeAdded={fetchCafes} />;
      case 'staff': 
        // We pass the list of cafes to the StaffTab for its dropdown
        return <StaffTab cafes={cafes} />;
      case 'tables': 
        // We pass the list of cafes to the TablesTab
        return <TablesTab cafes={cafes} />;
      case 'pricing': 
        // We pass the list of cafes to the PricingTab
        return <PricingTab cafes={cafes} />;
      default: 
        return null;
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <header className="bg-gray-800 shadow-md p-4 flex items-center sticky top-0 z-10">
        <button onClick={() => navigate('/owner/dashboard')} className="mr-4 p-2 rounded-full hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">Cafe Management</h1>
      </header>
      
      <main className="p-4 md:p-6">
        <div className="border-b border-gray-700 mb-6">
          <nav className="flex space-x-2 md:space-x-4 overflow-x-auto">
            <button onClick={() => setActiveTab('cafes')} className={`py-2 px-3 md:px-4 font-semibold whitespace-nowrap ${activeTab === 'cafes' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}>My Cafes</button>
            <button onClick={() => setActiveTab('staff')} className={`py-2 px-3 md:px-4 font-semibold whitespace-nowrap ${activeTab === 'staff' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}>Staff</button>
            <button onClick={() => setActiveTab('tables')} className={`py-2 px-3 md:px-4 font-semibold whitespace-nowrap ${activeTab === 'tables' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}>Tables</button>
            <button onClick={() => setActiveTab('pricing')} className={`py-2 px-3 md:px-4 font-semibold whitespace-nowrap ${activeTab === 'pricing' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}>Pricing</button>
          </nav>
        </div>
        
        <div className="bg-gray-800 p-4 md:p-6 rounded-lg">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default CafeManagementPage;

