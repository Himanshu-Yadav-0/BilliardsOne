import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getStaffDashboard } from '../services/api';
import SessionModal from '../components/SessionModal';
import Toast from '../components/Toast';
import LiveTimer from '../components/LiveTimer';

// --- SVG Icon Components ---
const TableIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>);
const PaymentIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>);
const AnalyticsIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>);

const StaffDashboard = () => {
  // logout ke saath-saath switchBackToOwner function bhi lein
  const { user, logout, switchBackToOwner } = useAuth();
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState({ cafeName: '', tables: [], pricing_rules: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedTable, setSelectedTable] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const fetchDashboard = useCallback(async () => {
    setError('');
    try {
      const response = await getStaffDashboard();
      setDashboardData(response.data);
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      if (loading) setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'In Use': return 'bg-sky-800 hover:bg-sky-700';
      case 'Available': return 'bg-emerald-800 hover:bg-emerald-700';
      default: return 'bg-gray-700 hover:bg-gray-600';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // "Switch Back" ke liye naya handler
  const handleSwitchBack = () => {
    switchBackToOwner();
    // App.jsx ka router automatically owner dashboard pe bhej dega
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col">
      <header className="bg-gray-800 shadow-md p-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">{dashboardData.cafeName || 'Loading...'}</h1>
            <p className="text-sm text-gray-400">
              {/* Ab hum dikhayenge ki owner as a staff act kar raha hai */}
              {user?.is_owner ? `Acting as Staff (Owner: ${user.mobileNo})` : `Staff: ${user?.mobileNo}`}
            </p>
          </div>
          
          {/* --- Naya, Dynamic Button Logic --- */}
          <div className="flex items-center space-x-2">
            {user?.is_owner && (
              <button 
                onClick={handleSwitchBack} 
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                Switch to Owner
              </button>
            )}
            <button 
              onClick={handleLogout} 
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-6">
        {loading && <p className="text-center text-gray-400">Loading tables...</p>}
        {error && <p className="text-center text-red-400">{error}</p>}
        {!loading && !error && (
          <>
            <div className="mb-6 bg-gray-800 p-4 rounded-lg">
              <h2 className="text-lg font-bold text-indigo-400 mb-2">Rate Card</h2>
              <div className="flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0 text-sm text-gray-300">
                {dashboardData.pricing_rules && dashboardData.pricing_rules.map(rule => (
                  <div key={rule.tableType}>
                    <span className="font-semibold">{rule.tableType}:</span>
                    <span> ₹{parseFloat(rule.hourPrice).toFixed(2)}/hr, ₹{parseFloat(rule.halfHourPrice).toFixed(2)}/half-hr</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {dashboardData.tables.map(table => (
                <div 
                  key={table.id} 
                  onClick={() => setSelectedTable(table)}
                  className={`aspect-square rounded-lg shadow-lg text-white cursor-pointer transition-transform hover:scale-105 flex flex-col items-center justify-center p-2 ${getStatusColor(table.status)}`}
                >
                  <h3 className="font-bold text-lg">{table.tableName}</h3>
                  <p className="text-sm opacity-80">{table.tableType}</p>
                  {table.status === 'In Use' && table.startTime && (
                    <div className="mt-2 bg-black bg-opacity-30 p-2 rounded w-full text-center">
                      <LiveTimer startTime={table.startTime} />
                      <p className="text-xs opacity-80">{table.current_players} Players</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="bg-gray-800 p-2 text-white sticky bottom-0">
        <nav className="flex justify-around text-center">
          <button onClick={() => navigate('/staff/dashboard')} className="flex-1 p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex flex-col items-center justify-center"><TableIcon className="h-6 w-6 mb-1" /><span className="text-xs">Tables</span></button>
          <button onClick={() => navigate('/staff/payments')} className="flex-1 p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex flex-col items-center justify-center"><PaymentIcon className="h-6 w-6 mb-1" /><span className="text-xs">Payments</span></button>
          <button onClick={() => navigate('/staff/analytics')} className="flex-1 p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex flex-col items-center justify-center"><AnalyticsIcon className="h-6 w-6 mb-1" /><span className="text-xs">Analytics</span></button>
        </nav>
      </footer>
      
      <SessionModal 
        table={selectedTable} 
        onClose={() => setSelectedTable(null)} 
        onSessionUpdate={(message) => {
          showToast(message);
          fetchDashboard();
        }}
      />
      
      {toast.show && (<Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: 'success' })} />)}
    </div>
  );
};

export default StaffDashboard;

