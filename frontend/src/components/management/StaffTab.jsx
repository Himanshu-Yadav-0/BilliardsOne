import React, { useState, useEffect } from 'react';
import { getStaffForCafe, addStaffToCafe } from '../../services/api';

const StaffTab = ({ cafes }) => {
    // State to keep track of which cafe is selected in the dropdown
    const [selectedCafe, setSelectedCafe] = useState(cafes[0]?.id || '');
    
    // State for the list of staff, loading indicators, and errors
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // State for the "Add New Staff" form fields
    const [staffName, setStaffName] = useState('');
    const [mobileNo, setMobileNo] = useState('');
    const [pin, setPin] = useState('');

    // This function fetches the staff list from the backend for the selected cafe
    const fetchStaff = async () => {
        if (!selectedCafe) {
            setStaff([]); // Clear staff list if no cafe is selected
            return;
        };
        setLoading(true);
        setError('');
        try {
            const response = await getStaffForCafe(selectedCafe);
            setStaff(response.data);
        } catch (err) {
            setError('Failed to fetch staff for this cafe.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // This useEffect hook runs the fetchStaff function whenever the selectedCafe changes
    useEffect(() => {
        fetchStaff();
    }, [selectedCafe]);

    // This handler is called when the "Add New Staff" form is submitted
    const handleAddStaff = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await addStaffToCafe({ 
                staffName, 
                mobileNo, 
                pin, 
                cafe_id: selectedCafe 
            });
            // Clear the form fields on success
            setStaffName('');
            setMobileNo('');
            setPin('');
            // Refresh the staff list to show the newly added member
            fetchStaff();
        } catch (err) {
            setError(err.response.data.detail);
            console.error(err);
        }
    };

    return (
        <div>
            <h3 className="text-xl font-bold mb-4 text-indigo-400">Manage Staff</h3>
            <div className="mb-6">
                <label htmlFor="cafeSelect" className="text-sm font-medium text-gray-300 block mb-1">Select Cafe</label>
                <select 
                    id="cafeSelect" 
                    value={selectedCafe} 
                    onChange={(e) => setSelectedCafe(e.target.value)} 
                    className="w-full px-3 py-2 text-white bg-gray-600 border border-gray-500 rounded-md" 
                    disabled={!cafes || cafes.length === 0}
                >
                    {cafes.map(cafe => ( <option key={cafe.id} value={cafe.id}>{cafe.cafeName}</option> ))}
                </select>
            </div>
            
            <div className="space-y-4 mb-6 min-h-[100px]">
                {loading ? <p className="text-gray-400">Loading staff...</p> : staff.map(s => (
                    <div key={s.id} className="bg-gray-700 p-4 rounded-lg">
                        <p className="font-semibold">{s.staffName}</p>
                        <p className="text-sm text-gray-400">{s.mobileNo}</p>
                    </div>
                ))}
                 {!loading && staff.length === 0 && <p className="text-gray-400">No staff have been added to this cafe yet.</p>}
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-bold mb-3">Add New Staff</h4>
                <form onSubmit={handleAddStaff} className="space-y-3">
                    <div>
                        <label htmlFor="staffName" className="text-sm font-medium text-gray-300 block mb-1">Staff Name</label>
                        <input type="text" id="staffName" value={staffName} onChange={e => setStaffName(e.target.value)} className="w-full px-3 py-2 text-white bg-gray-600 rounded-md" required />
                    </div>
                     <div>
                        <label htmlFor="staffMobile" className="text-sm font-medium text-gray-300 block mb-1">Mobile Number</label>
                        <input type="tel" id="staffMobile" value={mobileNo} onChange={e => setMobileNo(e.target.value)} className="w-full px-3 py-2 text-white bg-gray-600 rounded-md" required />
                    </div>
                     <div>
                        <label htmlFor="staffPin" className="text-sm font-medium text-gray-300 block mb-1">PIN</label>
                        <input type="password" id="staffPin" value={pin} onChange={e => setPin(e.target.value)} className="w-full px-3 py-2 text-white bg-gray-600 rounded-md" required />
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button type="submit" className="w-full py-2 px-4 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700" disabled={!selectedCafe}>Add Staff</button>
                </form>
            </div>
        </div>
    );
};

export default StaffTab;

