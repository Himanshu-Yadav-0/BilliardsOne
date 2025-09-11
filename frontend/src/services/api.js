import axios from 'axios';

const API_URL = 'http://10.79.44.88:8000/api/v1';
// const API_URL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
});

// This interceptor automatically adds the auth token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Auth ---
export const registerOwner = (ownerData) => apiClient.post('/auth/register', ownerData);

export const loginUser = (credentials) => {
  const formData = new URLSearchParams();
  formData.append('username', credentials.mobileNo);
  formData.append('password', credentials.pin);
  return apiClient.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
};

// --- Owner: Cafe Management ---
export const getOwnerCafes = () => apiClient.get('/owner/cafes/');
export const createOwnerCafe = (cafeData) => apiClient.post('/owner/cafes/', cafeData);

// --- Owner: Staff Management ---
export const getStaffForCafe = (cafeId) => apiClient.get('/owner/staff/', { params: { cafe_id: cafeId } });
export const addStaffToCafe = (staffData) => apiClient.post('/owner/staff/', staffData);

// --- Owner: Table Management ---
export const getTablesForCafe = (cafeId) => apiClient.get('/owner/management/tables/', { params: { cafe_id: cafeId } });
export const addTableToCafe = (tableData) => apiClient.post('/owner/management/tables/', tableData);

// --- Owner: Pricing Management ---
export const getPricingForCafe = (cafeId) => apiClient.get('/owner/management/pricing/', { params: { cafe_id: cafeId } });

// CORRECTED: This now sends a single pricing rule at a time
export const setPricingForCafe = (pricingData) => {
    // pricingData should be { tableType, hourPrice, halfHourPrice, extraPlayerCharge, cafe_id }
    return apiClient.post('/owner/management/pricing/', pricingData);
};

export const updatePlayerCount = (playerData) => apiClient.post('/staff/sessions/update_players', playerData);


// --- Owner: Analytics ---
export const getOwnerAnalytics = (cafeId, period) => {
  return apiClient.get(`/analytics/owner/${cafeId}`, { params: { period } });
};


// --- Staff Workflow ---

/**
 * Fetches the main dashboard data for a staff member, including the list of tables.
 */
export const getStaffDashboard = () => apiClient.get('/staff/dashboard');

/**
 * Starts a new game session for a specific table.
 * @param {object} sessionData - Contains table_id and initialPlayers.
 */
export const startSession = (sessionData) => apiClient.post('/staff/sessions/start', sessionData);

/**
 * Ends an active game session and returns the final bill.
 * @param {string} sessionId - The UUID of the session to end.
 */
export const endSession = (sessionId) => apiClient.post(`/staff/sessions/end/${sessionId}`);

/**
 * Logs a payment for a completed session.
 * @param {object} paymentData - Contains session_id, totalAmount, and paymentMethod.
 */
export const logPayment = (paymentData) => apiClient.post('/staff/payments/', paymentData);

/**
 * Fetches the payment history for the current staff member for today.
 */
export const getStaffPayments = () => apiClient.get('/staff/payments/');

/**
 * Fetches the daily analytics summary for the current staff member.
 */
export const getStaffDailyAnalytics = () => apiClient.get('/analytics/staff/today');