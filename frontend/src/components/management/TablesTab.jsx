import React, { useState, useEffect } from 'react';
import { getTablesForCafe, addTableToCafe } from '../../services/api';

const TablesTab = ({ cafes }) => {
    const [selectedCafe, setSelectedCafe] = useState(cafes[0]?.id || '');
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // State for the "Add New Table" form fields
    const [tableName, setTableName] = useState('');
    const [tableType, setTableType] = useState('8-Ball Pool'); // Default to 'Pool'

    // Fetches the tables for the currently selected cafe
    const fetchTables = async () => {
        if (!selectedCafe) {
            setTables([]);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await getTablesForCafe(selectedCafe);
            setTables(response.data);
        } catch (err) {
            setError('Failed to fetch tables for this cafe.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // This effect re-runs the fetch function whenever the selected cafe changes
    useEffect(() => {
        fetchTables();
    }, [selectedCafe]);

    // Handles the submission of the "Add New Table" form
    const handleAddTable = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await addTableToCafe({ 
                tableName, 
                tableType, 
                cafe_id: selectedCafe 
            });
            // Clear form and refresh the table list on success
            setTableName('');
            setTableType('8-Ball Pool');
            fetchTables();
        } catch (err) {
            setError(err.response);
            console.error(err);
        }
    };

    return (
        <div>
            <h3 className="text-xl font-bold mb-4 text-indigo-400">Manage Tables</h3>
             <div className="mb-6">
                <label htmlFor="cafeSelectTables" className="text-sm font-medium text-gray-300 block mb-1">Select Cafe</label>
                <select 
                    id="cafeSelectTables" 
                    value={selectedCafe} 
                    onChange={(e) => setSelectedCafe(e.target.value)} 
                    className="w-full px-3 py-2 text-white bg-gray-600 border border-gray-500 rounded-md" 
                    disabled={!cafes || cafes.length === 0}
                >
                    {cafes.map(cafe => ( <option key={cafe.id} value={cafe.id}>{cafe.cafeName}</option> ))}
                </select>
            </div>
            
            <div className="space-y-4 mb-6 min-h-[100px]">
                 {loading ? <p className="text-gray-400">Loading tables...</p> : tables.map(t => (
                    <div key={t.id} className="bg-gray-700 p-4 rounded-lg">
                        <p className="font-semibold">{t.tableName}</p>
                        <p className="text-sm text-gray-400">{t.tableType}</p>
                    </div>
                ))}
                 {!loading && tables.length === 0 && <p className="text-gray-400">No tables have been added to this cafe yet.</p>}
            </div>

             <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-bold mb-3">Add New Table</h4>
                <form onSubmit={handleAddTable} className="space-y-3">
                    <div>
                        <label htmlFor="tableName" className="text-sm font-medium text-gray-300 block mb-1">Table Name (e.g., Table 1)</label>
                        <input 
                            type="text" 
                            id="tableName" 
                            value={tableName} 
                            onChange={e => setTableName(e.target.value)} 
                            className="w-full px-3 py-2 text-white bg-gray-600 rounded-md" 
                            required 
                        />
                    </div>
                     <div>
                        <label htmlFor="tableType" className="text-sm font-medium text-gray-300 block mb-1">Table Type</label>
                        <select 
                            id="tableType" 
                            value={tableType} 
                            onChange={e => setTableType(e.target.value)} 
                            className="w-full px-3 py-2 text-white bg-gray-600 rounded-md"
                        >
                            <option value="8-Ball Pool">8-Ball Pool</option>
                            <option value="Snooker">Snooker</option>
                        </select>
                    </div>
                     {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button type="submit" className="w-full py-2 px-4 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700" disabled={!selectedCafe}>Add Table</button>
                </form>
            </div>
        </div>
    );
};

export default TablesTab;

