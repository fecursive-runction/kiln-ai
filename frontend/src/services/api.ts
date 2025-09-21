import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://kiln-ai-backend.onrender.com/api', // Ensure this matches your backend port
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add auth token
apiClient.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// --- NEW ---
// Function to fetch the latest live data point
export const getLiveKpiStream = () => {
    return apiClient.get('/kpi/live-stream');
};

// Function to fetch a block of historical data
export const getKpiData = (timeRangeMinutes: number = 60) => {
    return apiClient.get('/kpi/data', {
        params: {
            time_range_minutes: timeRangeMinutes,
        },
    });
};
// Define the structure of the data we'll send
interface OptimizerPayload {
  targetSPC: number;
  targetQuality: number;
  maxTSR: number;
}

export const getOptimizerRecommendation = (payload: OptimizerPayload) => {
  return apiClient.post('/ai/optimize', payload);
};
export const postChatMessage = (message: string) => {
    return apiClient.post('/ai/chat', { message: message });
};

export const getClinkerData = () => {
    return apiClient.get('/data/clinker');
};

// Function to fetch energy data (SPC and CO2)
export const getEnergyData = () => {
    return apiClient.get('/data/energy');
};

// Function to fetch fuel mix data (TSR)
export const getFuelMixData = () => {
    return apiClient.get('/data/fuel_mix');
};

export default apiClient;