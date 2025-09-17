import React, { useState, useEffect } from 'react';
import { createOwnerCafe, updateCafe, assumeStaffRole } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CafesTab = ({ initialCafes, onCafeAdded }) => {
  const [cafes, setCafes] = useState(initialCafes || []);
  const [editingCafe, setEditingCafe] = useState(null);

  const [cafeName, setCafeName] = useState('');
  const [billingStrategy, setBillingStrategy] = useState('Pro-Rata');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // AuthContext se naya function lein
  const { switchToStaff } = useAuth();

  useEffect(() => {
    setCafes(initialCafes);
  }, [initialCafes]);

  const resetForm = () => {
    setEditingCafe(null);
    setCafeName('');
    setBillingStrategy('Pro-Rata');
    setError('');
  };

  const handleEditClick = (cafe) => {
    setEditingCafe(cafe);
    setCafeName(cafe.cafeName);
    setBillingStrategy(cafe.billingStrategy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (editingCafe) {
        await updateCafe(editingCafe.id, { cafeName, billingStrategy });
      } else {
        await createOwnerCafe({ cafeName, billingStrategy });
      }
      resetForm();
      onCafeAdded();
    } catch (err) {
      setError(editingCafe ? 'Failed to update cafe.' : 'Failed to add cafe.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // "Act as Staff" button ke liye naya handler
  const handleSwitchToStaff = async (cafeId) => {
    try {
      const response = await assumeStaffRole(cafeId);
      if (response.data && response.data.access_token) {
        // AuthContext ka naya function use karein
        switchToStaff(response.data.access_token);
        // App.jsx ka router automatically staff dashboard pe redirect kar dega
      }
    } catch (err) {
      console.error("Failed to switch role:", err);
      setError("Could not switch to staff view.");
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-indigo-400">Your Cafes</h3>
      <div className="space-y-4 mb-6">
        {cafes.length > 0 ? (
          cafes.map(cafe => (
            <div key={cafe.id} className="bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{cafe.cafeName}</p>
                  <p className="text-xs text-gray-400">{cafe.billingStrategy}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleEditClick(cafe)}
                    className="text-sm bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1 px-3 rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleSwitchToStaff(cafe.id)}
                    className="text-sm bg-green-700 hover:bg-green-500 text-white font-semibold py-1 px-3 rounded-lg"
                  >
                    Act as Staff
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">You haven't added any cafes yet.</p>
        )}
      </div>
      
      <div className="bg-gray-700 p-4 rounded-lg">
        <h4 className="font-bold mb-3">{editingCafe ? `Editing: ${editingCafe.cafeName}` : 'Add New Cafe'}</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cafeName" className="text-sm font-medium text-gray-300 block mb-1">Cafe Name</label>
            <input type="text" id="cafeName" value={cafeName} onChange={(e) => setCafeName(e.target.value)} className="w-full px-3 py-2 text-white bg-gray-600 rounded-md" required />
          </div>

          <div>
            <label htmlFor="billingStrategy" className="text-sm font-medium text-gray-300 block mb-1">Billing Method</label>
            <select id="billingStrategy" value={billingStrategy} onChange={(e) => setBillingStrategy(e.target.value)} className="w-full px-3 py-2 text-white bg-gray-600 rounded-md">
              <option value="Pro_Rata">Pro_Rata</option>
              <option value="Per_Minute">Per_Minute</option>
              <option value="Fixed_Hour">Fixed_Hour</option>
            </select>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex space-x-4">
            <button type="submit" disabled={loading} className="flex-1 py-2 px-4 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
              {loading ? 'Saving...' : (editingCafe ? 'Update Cafe' : 'Add Cafe')}
            </button>
            {editingCafe && (
              <button type="button" onClick={resetForm} className="flex-1 py-2 px-4 font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-500">
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CafesTab;

