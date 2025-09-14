import React, { useState, useEffect } from 'react';
// Dono functions import karein: create aur update
import { createOwnerCafe, updateCafe } from '../../services/api';

const CafesTab = ({ initialCafes, onCafeAdded }) => {
  const [cafes, setCafes] = useState(initialCafes || []);
  
  // Nayi State: Yeh track karegi ki hum kaunsa cafe edit kar rahe hain
  const [editingCafe, setEditingCafe] = useState(null);

  // Form ke liye state
  const [cafeName, setCafeName] = useState('');
  const [billingStrategy, setBillingStrategy] = useState('Pro-Rata');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setCafes(initialCafes);
  }, [initialCafes]);

  // Yeh function form ko reset karta hai
  const resetForm = () => {
    setEditingCafe(null);
    setCafeName('');
    setBillingStrategy('Pro-Rata');
    setError('');
  };

  // Jab "Edit" button click hoga, yeh function call hoga
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
        // --- EDIT MODE ---
        // Agar hum edit kar rahe hain, toh update API call karein
        await updateCafe(editingCafe.id, { cafeName, billingStrategy });
      } else {
        // --- ADD MODE ---
        // Agar naya cafe bana rahe hain, toh create API call karein
        await createOwnerCafe({ cafeName, billingStrategy });
      }
      resetForm();
      onCafeAdded(); // Parent ko refresh ke liye bolein
    } catch (err) {
      setError(editingCafe ? 'Failed to update cafe.' : 'Failed to add cafe.');
      console.error(err);
    } finally {
      setLoading(false);
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
                <button 
                  onClick={() => handleEditClick(cafe)}
                  className="text-sm bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1 px-3 rounded-lg"
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">You haven't added any cafes yet.</p>
        )}
      </div>
      
      <div className="bg-gray-700 p-4 rounded-lg">
        {/* Form ka title ab dynamic hai */}
        <h4 className="font-bold mb-3">{editingCafe ? `Editing: ${editingCafe.cafeName}` : 'Add New Cafe'}</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cafeName" className="text-sm font-medium text-gray-300 block mb-1">Cafe Name</label>
            <input type="text" id="cafeName" value={cafeName} onChange={(e) => setCafeName(e.target.value)} className="w-full px-3 py-2 text-white bg-gray-600 rounded-md" required />
          </div>

          <div>
            <label htmlFor="billingStrategy" className="text-sm font-medium text-gray-300 block mb-1">Billing Method</label>
            <select id="billingStrategy" value={billingStrategy} onChange={(e) => setBillingStrategy(e.target.value)} className="w-full px-3 py-2 text-white bg-gray-600 rounded-md">
              <option value="Pro_Rata">Pro-Rata</option>
              <option value="Per_Minute">Per-Minute</option>
              <option value="Fixed_Hour">Fixed-Hour</option>
            </select>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex space-x-4">
            {/* Submit button bhi ab dynamic hai */}
            <button type="submit" disabled={loading} className="flex-1 py-2 px-4 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
              {loading ? 'Saving...' : (editingCafe ? 'Update Cafe' : 'Add Cafe')}
            </button>
            {/* Agar edit mode mein hain, toh "Cancel" button dikhayein */}
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

