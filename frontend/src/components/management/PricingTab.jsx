import React, { useState, useEffect, useCallback } from 'react';
import { getPricingForCafe, setPricingForCafe } from '../../services/api';

const PricingTab = ({ cafes }) => {
    const [selectedCafe, setSelectedCafe] = useState(cafes[0]?.id || '');

    const [poolPricing, setPoolPricing] = useState({ hourPrice: '', halfHourPrice: '', extraPlayerPrice: '' });
    const [snookerPricing, setSnookerPricing] = useState({ hourPrice: '', halfHourPrice: '', extraPlayerPrice: '' });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchPricing = useCallback(async () => {
        if (!selectedCafe) return;
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await getPricingForCafe(selectedCafe);
            const pricingRules = response.data || [];

            const poolRule = pricingRules.find(p => p.tableType === '8-Ball Pool');
            setPoolPricing({
                hourPrice: poolRule?.hourPrice ?? '',
                halfHourPrice: poolRule?.halfHourPrice ?? '',
                extraPlayerPrice: poolRule?.extraPlayerPrice ?? ''
            });

            const snookerRule = pricingRules.find(p => p.tableType === 'Snooker');
            setSnookerPricing({
                hourPrice: snookerRule?.hourPrice ?? '',
                halfHourPrice: snookerRule?.halfHourPrice ?? '',
                extraPlayerPrice: snookerRule?.extraPlayerPrice ?? ''
            });

        } catch (err) {
            setError('Failed to fetch pricing data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [selectedCafe]);

    useEffect(() => {
        fetchPricing();
    }, [fetchPricing]);

    const handleSavePricing = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const formatPrice = (price) => (price === '' || price == null ? null : Number(price));
            
            // Ek "to-do" list banayein jismein sirf valid requests hongi
            const requestsToProcess = [];

            // Check karein ki Pool ke liye kam se kam ek price bhara hai ya nahi
            if (poolPricing.hourPrice !== '' || poolPricing.halfHourPrice !== '' || poolPricing.extraPlayerPrice !== '') {
                const poolRequest = setPricingForCafe({
                    cafe_id: selectedCafe,
                    tableType: '8-Ball Pool',
                    hourPrice: formatPrice(poolPricing.hourPrice),
                    halfHourPrice: formatPrice(poolPricing.halfHourPrice),
                    extraPlayerPrice: formatPrice(poolPricing.extraPlayerPrice),
                });
                requestsToProcess.push(poolRequest);
            }

            // Check karein ki Snooker ke liye kam se kam ek price bhara hai ya nahi
            if (snookerPricing.hourPrice !== '' || snookerPricing.halfHourPrice !== '' || snookerPricing.extraPlayerPrice !== '') {
                const snookerRequest = setPricingForCafe({
                    cafe_id: selectedCafe,
                    tableType: 'Snooker',
                    hourPrice: formatPrice(snookerPricing.hourPrice),
                    halfHourPrice: formatPrice(snookerPricing.halfHourPrice),
                    extraPlayerPrice: formatPrice(snookerPricing.extraPlayerPrice),
                });
                requestsToProcess.push(snookerRequest);
            }

            // Agar koi bhi valid request hai, tabhi aage badhein
            if (requestsToProcess.length > 0) {
                await Promise.all(requestsToProcess);
                setSuccess('Pricing saved successfully!');
                fetchPricing(); // Data refresh karein
            } else {
                setError("Please fill in the pricing for at least one table type.");
            }

        } catch (err) {
            setError('Failed to save pricing.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const hasPricing = poolPricing.hourPrice !== '' || snookerPricing.hourPrice !== ''
        || poolPricing.extraPlayerPrice !== '' || snookerPricing.extraPlayerPrice !== '';

    return (
        <div>
            <h3 className="text-xl font-bold mb-4 text-indigo-400">Set Pricing Rules</h3>
            <div className="mb-6">
                <label htmlFor="cafeSelectPricing" className="text-sm font-medium text-gray-300 block mb-1">Select Cafe</label>
                <select id="cafeSelectPricing" value={selectedCafe} onChange={(e) => setSelectedCafe(e.target.value)} className="w-full px-3 py-2 text-white bg-gray-600 rounded-md" disabled={!cafes || cafes.length === 0}>
                    {cafes.map(cafe => (<option key={cafe.id} value={cafe.id}>{cafe.cafeName}</option>))}
                </select>
            </div>

            <div className="mb-8">
                <h4 className="font-bold text-lg mb-3 text-indigo-300">Current Pricing</h4>
                <div className="bg-gray-700 p-4 rounded-lg">
                    {loading ? (
                        <p className="text-gray-400">Loading prices...</p>
                    ) : !hasPricing ? (
                        <p className="text-gray-400">No pricing set for this cafe yet.</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="bg-gray-800 rounded-lg p-4 shadow-md">
                                <h5 className="text-indigo-400 font-semibold mb-2">8-Ball Pool</h5>
                                <ul className="space-y-1 text-sm text-gray-300">
                                    <li><span className="font-medium text-white">Hourly:</span> ₹{poolPricing.hourPrice !== '' ? poolPricing.hourPrice : 'N/A'}</li>
                                    <li><span className="font-medium text-white">Half-Hourly:</span> ₹{poolPricing.halfHourPrice !== '' ? poolPricing.halfHourPrice : 'N/A'}</li>
                                    <li><span className="font-medium text-white">Extra Player:</span> ₹{poolPricing.extraPlayerPrice !== '' ? poolPricing.extraPlayerPrice : 'N/A'}</li>
                                </ul>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-4 shadow-md">
                                <h5 className="text-indigo-400 font-semibold mb-2">Snooker</h5>
                                <ul className="space-y-1 text-sm text-gray-300">
                                    <li><span className="font-medium text-white">Hourly:</span> ₹{snookerPricing.hourPrice !== '' ? snookerPricing.hourPrice : 'N/A'}</li>
                                    <li><span className="font-medium text-white">Half-Hourly:</span> ₹{snookerPricing.halfHourPrice !== '' ? snookerPricing.halfHourPrice : 'N/A'}</li>
                                    <li><span className="font-medium text-white">Extra Player:</span> ₹{snookerPricing.extraPlayerPrice !== '' ? snookerPricing.extraPlayerPrice : 'N/A'}</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <form onSubmit={handleSavePricing} className="space-y-6">
                <h4 className="font-bold text-lg mb-3">{hasPricing ? "Update Pricing" : "Set Pricing"}</h4>

                <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-bold text-lg mb-3">8-Ball Pool</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm text-gray-300 block mb-1">Price per Hour (₹)</label>
                            <input type="number" value={poolPricing.hourPrice} onChange={e => setPoolPricing({ ...poolPricing, hourPrice: e.target.value })} className="w-full px-3 py-2 bg-gray-600 rounded-md" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-300 block mb-1">Price per Half Hour (₹)</label>
                            <input type="number" value={poolPricing.halfHourPrice} onChange={e => setPoolPricing({ ...poolPricing, halfHourPrice: e.target.value })} className="w-full px-3 py-2 bg-gray-600 rounded-md" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-300 block mb-1">Extra Player Charge (₹)</label>
                            <input type="number" value={poolPricing.extraPlayerPrice} onChange={e => setPoolPricing({ ...poolPricing, extraPlayerPrice: e.target.value })} className="w-full px-3 py-2 bg-gray-600 rounded-md" />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-bold text-lg mb-3">Snooker</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm text-gray-300 block mb-1">Price per Hour (₹)</label>
                            <input type="number" value={snookerPricing.hourPrice} onChange={e => setSnookerPricing({ ...snookerPricing, hourPrice: e.target.value })} className="w-full px-3 py-2 bg-gray-600 rounded-md" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-300 block mb-1">Price per Half Hour (₹)</label>
                            <input type="number" value={snookerPricing.halfHourPrice} onChange={e => setSnookerPricing({ ...snookerPricing, halfHourPrice: e.target.value })} className="w-full px-3 py-2 bg-gray-600 rounded-md" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-300 block mb-1">Extra Player Charge (₹)</label>
                            <input type="number" value={snookerPricing.extraPlayerPrice} onChange={e => setSnookerPricing({ ...snookerPricing, extraPlayerPrice: e.target.value })} className="w-full px-3 py-2 bg-gray-600 rounded-md" />
                        </div>
                    </div>
                </div>

                {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}
                {success && <p className="text-green-400 text-sm text-center mt-2">{success}</p>}

                <button type="submit" className="w-full py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700" disabled={!selectedCafe || loading}>
                    {loading ? 'Saving...' : 'Save All Pricing'}
                </button>
            </form>
        </div>
    );
};

export default PricingTab;

