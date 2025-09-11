import React, { useState } from 'react';
import { startSession, endSession, logPayment, updatePlayerCount } from '../services/api';

const SessionModal = ({ table, onClose, onSessionUpdate }) => {
  if (!table) return null;

  // State to manage which view is shown: 'start', 'active', or 'billing'
  const [view, setView] = useState(table.status === 'In Use' ? 'active' : 'start');
  
  // State for the player count input
  const [players, setPlayers] = useState(table.current_players || 2);
  
  // State to hold the detailed bill information from the backend
  const [billDetails, setBillDetails] = useState(null);
  
  // General loading and error state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State for payment method selection
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Cash');

  // Safely formats numbers into currency strings
  const formatCurrency = (amount) => {
      const numberAmount = parseFloat(amount);
      if (isNaN(numberAmount)) return 'N/A';
      return `₹${numberAmount.toFixed(2)}`;
  };

  // --- API Handlers ---

  const handleStartSession = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await startSession({ table_id: table.id, initial_player_count: players });
      onSessionUpdate(`Session started for ${table.tableName}.`);
      onClose();
    } catch (err) {
      setError('Failed to start session.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdatePlayers = async () => {
    setLoading(true);
    setError('');
    try {
        await updatePlayerCount({
            session_id: table.current_session_id,
            numberOfPlayers: players
        });
        onSessionUpdate(`Player count for ${table.tableName} updated.`);
        onClose();
    } catch(err) {
        setError('Failed to update players.');
    } finally {
        setLoading(false);
    }
  };

  const handleEndSession = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await endSession(table.current_session_id);
      setBillDetails(response.data);
      setView('billing');
    } catch (err) {
      setError('Failed to end session.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    setError('');
    try {
      await logPayment({
        game_session_id: billDetails.session_id,
        total_amount: billDetails.total_amount_due,
        payment_method: selectedPaymentMethod,
      });
      onSessionUpdate(`Payment for ${table.tableName} collected.`);
      onClose();
    } catch (err) {
      setError('Failed to log payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-lg w-full max-w-sm text-white">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{table.tableName} ({table.tableType})</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700" disabled={loading}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* --- START SESSION VIEW --- */}
        {view === 'start' && (
          <div className="p-6"><form onSubmit={handleStartSession} className="space-y-4"><div><label htmlFor="players" className="text-sm font-medium text-gray-300 block mb-2">Number of Players</label><input type="number" id="players" value={players} onChange={(e) => setPlayers(Number(e.target.value))} min="1" className="w-full px-4 py-2 text-white bg-gray-700 rounded-md"/></div>{error && <p className="text-red-400 text-sm">{error}</p>}<button type="submit" className="w-full py-3 font-semibold bg-green-600 rounded-md hover:bg-green-700" disabled={loading}>{loading ? 'Starting...' : 'Start Session'}</button></form></div>
        )}

        {/* --- ACTIVE SESSION VIEW --- */}
        {view === 'active' && (
          <div className="p-6 space-y-4">
            <div><p className="text-sm text-gray-400">Duration</p><p className="text-3xl font-mono">{table.elapsed_time}</p></div>
            <div className="pt-4 border-t border-gray-700"><label htmlFor="updatePlayers" className="text-sm font-medium text-gray-300 block mb-2">Update Player Count</label><div className="flex items-center gap-4"><input type="number" id="updatePlayers" value={players} onChange={(e) => setPlayers(Number(e.target.value))} min="1" className="w-full px-4 py-2 text-white bg-gray-700 rounded-md"/><button onClick={handleUpdatePlayers} className="py-2 px-4 font-semibold bg-blue-600 rounded-md hover:bg-blue-700" disabled={loading}>{loading ? '...' : 'Set'}</button></div></div>
            {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}
            <button onClick={handleEndSession} className="w-full py-3 font-semibold bg-red-600 rounded-md hover:bg-red-700 mt-4" disabled={loading}>{loading ? 'Calculating...' : 'End Session & Calculate Bill'}</button>
          </div>
        )}

        {/* --- COMPREHENSIVE BILLING VIEW --- */}
        {view === 'billing' && billDetails && (
           <div className="p-6 space-y-4">
             <div className="text-center"><p className="text-sm text-gray-400">Final Bill</p><p className="text-5xl font-bold text-green-400">{formatCurrency(billDetails.total_amount_due)}</p></div>
             
             <div className="text-sm text-gray-300 space-y-2 bg-gray-700 p-3 rounded-md">
                <p className="text-base font-bold text-center mb-2">Bill Details</p>
                <div className="flex justify-between"><span>Total Time:</span> <span>{billDetails.total_minutes_played} minutes</span></div>
                <div className="flex justify-between"><span>Base Charge (first 30 min):</span> <span>{formatCurrency(billDetails.base_charge)}</span></div>
                {billDetails.extra_minutes_played > 0 && (
                    <div className="flex justify-between"><span>Overtime ({billDetails.extra_minutes_played} min @ {formatCurrency(billDetails.per_minute_rate)}/min):</span> <span>{formatCurrency(billDetails.overtime_charge)}</span></div>
                )}
                 {billDetails.extra_player_cost > 0 && (
                    <div className="flex justify-between"><span>Extra Player Charge ({billDetails.final_player_count -2} players):</span> <span>{formatCurrency(billDetails.extra_player_cost)}</span></div>
                )}
                <div className="flex justify-between font-bold pt-2 border-t border-gray-600"><span>Total:</span> <span>{formatCurrency(billDetails.total_amount_due)}</span></div>
             </div>
            
            <div className="pt-2">
                <p className="text-center text-sm text-gray-300 mb-2">Select payment method:</p>
                <div className="flex space-x-4"><button onClick={() => setSelectedPaymentMethod('Cash')} className={`flex-1 py-3 font-semibold rounded-md transition-colors ${selectedPaymentMethod === 'Cash' ? 'bg-emerald-600 ring-2 ring-white' : 'bg-gray-600 hover:bg-gray-500'}`}>Cash</button><button onClick={() => setSelectedPaymentMethod('Online')} className={`flex-1 py-3 font-semibold rounded-md transition-colors ${selectedPaymentMethod === 'Online' ? 'bg-sky-600 ring-2 ring-white' : 'bg-gray-600 hover:bg-gray-500'}`}>Online</button></div>
            </div>
            {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}
            <button onClick={handleConfirmPayment} className="w-full py-3 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700" disabled={loading}>{loading ? 'Processing...' : 'Confirm Payment'}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionModal;

