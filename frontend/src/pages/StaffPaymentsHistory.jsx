import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStaffPayments } from '../services/api';

const StaffPaymentsHistory = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await getStaffPayments();
        setPayments(response.data);
      } catch (err) {
        setError('Failed to fetch payment history.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // Calculate total from the live data
  const total = payments.reduce((sum, p) => sum + parseFloat(p.totalAmount), 0);

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <header className="bg-gray-800 shadow-md p-4 flex items-center">
        <button
          onClick={() => navigate('/staff/dashboard')}
          className="mr-4 p-2 rounded-full hover:bg-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">Today's Payments</h1>
      </header>

      <main className="p-6">
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold">Total Collected Today: <span className="text-green-400">₹{total.toFixed(2)}</span></h2>
        </div>
        
        {loading && <p className="text-center text-gray-400">Loading payment history...</p>}
        {error && <p className="text-center text-red-400">{error}</p>}

        {!loading && !error && (
          <div className="space-y-4">
            {payments.length > 0 ? payments.map(p => (
              <div key={p.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                <div>
                  {/* Safely access nested data with optional chaining */}
                  <p className="font-bold">{p.game_session?.table?.tableName || 'Unknown Table'}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(p.paymentTimestamp).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-lg">₹{parseFloat(p.totalAmount).toFixed(2)}</p>
                  <p className={`text-xs text-right ${p.paymentMethod === 'Online' ? 'text-blue-400' : 'text-green-400'}`}>{p.paymentMethod}</p>
                </div>
              </div>
            )) : <p className="text-center text-gray-400">No payments have been recorded today.</p>}
          </div>
        )}
      </main>
    </div>
  );
};

export default StaffPaymentsHistory;

