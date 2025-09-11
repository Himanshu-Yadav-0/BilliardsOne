import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOwnerCafes, getOwnerAnalytics } from '../services/api';

const OwnerAnalyticsPage = () => {
    const navigate = useNavigate();
    const [cafes, setCafes] = useState([]);
    const [selectedCafe, setSelectedCafe] = useState('');
    const [period, setPeriod] = useState('week');
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCafes = async () => {
            try {
                const response = await getOwnerCafes();
                setCafes(response.data);
                if (response.data.length > 0) {
                    setSelectedCafe(response.data[0].id);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                setError('Failed to load your cafes.');
                setLoading(false);
            }
        };
        fetchCafes();
    }, []);

    const fetchAnalytics = useCallback(async () => {
        if (!selectedCafe) return;
        setLoading(true);
        setError('');
        try {
            const response = await getOwnerAnalytics(selectedCafe, period);
            setAnalytics(response.data);
        } catch (err) {
            setError(`Failed to load analytics.`);
            setAnalytics(null);
        } finally {
            setLoading(false);
        }
    }, [selectedCafe, period]);

    useEffect(() => {
        if (selectedCafe) {
            fetchAnalytics();
        }
    }, [fetchAnalytics]);

    // --- CORRECTED: Safe currency formatting function ---
    const formatCurrency = (amount) => {
        const num = parseFloat(amount);
        return isNaN(num) ? '₹0.00' : `₹${num.toFixed(2)}`;
    };

    const getPaymentMethodRevenue = (method) => {
        if (analytics && analytics.revenue_by_payment_method && typeof analytics.revenue_by_payment_method === 'object') {
            return formatCurrency(analytics.revenue_by_payment_method[method]);
        }
        return '₹0.00';
    };

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <header className="bg-gray-800 shadow-md p-4 flex items-center">
                <button
                    onClick={() => navigate('/owner/dashboard')}
                    className="mr-4 p-2 rounded-full hover:bg-gray-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-2xl font-bold">Cafe Analytics</h1>
            </header>

            <main className="p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1">
                        <label htmlFor="cafeSelect" className="text-sm font-medium text-gray-300 block mb-1">Select Cafe</label>
                        <select id="cafeSelect" value={selectedCafe} onChange={(e) => setSelectedCafe(e.target.value)} className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md" disabled={cafes.length === 0}>
                           {cafes.map(cafe => (<option key={cafe.id} value={cafe.id}>{cafe.cafeName}</option>))}
                        </select>
                    </div>
                    <div className="flex-1">
                         <label htmlFor="periodSelect" className="text-sm font-medium text-gray-300 block mb-1">Select Period</label>
                        <select id="periodSelect" value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md">
                           <option value="today">Today</option>
                           <option value="week">This Week</option>
                           <option value="month">This Month</option>
                        </select>
                    </div>
                </div>

                {loading && <p className="text-center text-gray-400">Loading analytics...</p>}
                {error && <p className="text-center text-red-400">{error}</p>}
                
                {!loading && !error && analytics && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gray-800 p-6 rounded-lg text-center">
                                <h3 className="text-gray-400 text-sm font-semibold">Total Revenue</h3>
                                <p className="text-3xl font-bold text-green-400">{formatCurrency(analytics.total_revenue)}</p>
                            </div>
                            <div className="bg-gray-800 p-6 rounded-lg text-center">
                                <h3 className="text-gray-400 text-sm font-semibold">Total Sessions</h3>
                                <p className="text-3xl font-bold">{analytics.total_sessions || 0}</p>
                            </div>
                            <div className="bg-gray-800 p-6 rounded-lg text-center">
                                <h3 className="text-gray-400 text-sm font-semibold">Peak Hours</h3>
                                <p className="text-3xl font-bold">{typeof analytics.peak_hours === 'string' && analytics.peak_hours ? analytics.peak_hours : 'N/A'}</p>
                            </div>
                        </div>

                        <div className="bg-gray-800 p-6 rounded-lg">
                            <h3 className="text-xl font-bold mb-4">Revenue by Payment Method</h3>
                            <div className="space-y-2">
                                <p>Cash: <span className="font-semibold">{getPaymentMethodRevenue('Cash')}</span></p>
                                <p>Online: <span className="font-semibold">{getPaymentMethodRevenue('Online')}</span></p>
                            </div>
                        </div>
                    </>
                )}
                 {!loading && !analytics && !error && cafes.length > 0 && <p className="text-center text-gray-400">No analytics data available for this selection.</p>}
                 {!loading && cafes.length === 0 && <p className="text-center text-gray-400">Please add a cafe to view analytics.</p>}
            </main>
        </div>
    );
};

export default OwnerAnalyticsPage;

