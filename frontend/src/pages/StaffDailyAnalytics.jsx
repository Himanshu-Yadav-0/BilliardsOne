import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStaffDailyAnalytics } from '../services/api';

const StaffDailyAnalytics = () => {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await getStaffDailyAnalytics();
                setAnalytics(response.data);
            } catch (err) {
                setError('Failed to load analytics.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    // Helper to safely format currency values from the backend
    const formatCurrency = (amount) => {
        const num = parseFloat(amount);
        return isNaN(num) ? '₹0.00' : `₹${num.toFixed(2)}`;
    }

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
                <h1 className="text-2xl font-bold">Today's Analytics</h1>
            </header>

            <main className="p-6">
                {loading && <p className="text-center text-gray-400">Loading analytics...</p>}
                {error && <p className="text-center text-red-400">{error}</p>}
                
                {!loading && !error && analytics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-800 p-6 rounded-lg">
                            <h3 className="text-gray-400 text-sm font-semibold">Total Revenue Today</h3>
                            <p className="text-3xl font-bold text-green-400">{formatCurrency(analytics.total_revenue)}</p>
                        </div>
                         <div className="bg-gray-800 p-6 rounded-lg">
                            <h3 className="text-gray-400 text-sm font-semibold">Sessions Managed Today</h3>
                            <p className="text-3xl font-bold">{analytics.sessions_managed}</p>
                        </div>
                         <div className="bg-gray-800 p-6 rounded-lg">
                            <h3 className="text-gray-400 text-sm font-semibold">Cash Collected</h3>
                            <p className="text-3xl font-bold">{formatCurrency(analytics.cash_collected)}</p>
                        </div>
                         <div className="bg-gray-800 p-6 rounded-lg">
                            <h3 className="text-gray-400 text-sm font-semibold">Online Collected</h3>
                            <p className="text-3xl font-bold">{formatCurrency(analytics.online_collected)}</p>
                        </div>
                    </div>
                )}
                 {!loading && !analytics && !error && (
                    <p className="text-center text-gray-400">No analytics data available for today yet.</p>
                 )}
            </main>
        </div>
    );
};

export default StaffDailyAnalytics;

