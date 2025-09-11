import React, { useState } from 'react';
import { createOwnerCafe } from '../../services/api';

const CafesTab = ({ initialCafes, onCafeAdded }) => {
  const [cafes, setCafes] = useState(initialCafes || []);
  const [cafeName, setCafeName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddCafeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createOwnerCafe({ cafeName });
      setCafeName('');
      onCafeAdded(); // Notify parent to refresh the cafe list
    } catch (err) {
      setError('Failed to add cafe.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    setCafes(initialCafes);
  }, [initialCafes]);

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-indigo-400">Your Cafes</h3>
      <div className="space-y-4 mb-6">
        {cafes.length > 0 ? (
          cafes.map(cafe => (
            <div key={cafe.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
              <p className="font-semibold">{cafe.cafeName}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400">You haven't added any cafes yet.</p>
        )}
      </div>
      
      <div className="bg-gray-700 p-4 rounded-lg">
        <h4 className="font-bold mb-3">Add New Cafe</h4>
        <form onSubmit={handleAddCafeSubmit} className="space-y-3">
          <div>
            <label htmlFor="cafeName" className="text-sm font-medium text-gray-300 block mb-1">Cafe Name</label>
            <input 
              type="text" id="cafeName" value={cafeName}
              onChange={(e) => setCafeName(e.target.value)}
              className="w-full px-3 py-2 text-white bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-2 px-4 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
            {loading ? 'Adding...' : 'Add Cafe'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CafesTab;

