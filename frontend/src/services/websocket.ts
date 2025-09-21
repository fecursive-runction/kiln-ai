// This is the full and final content for frontend/src/services/websocket.ts
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const WS_URL = API_URL.replace(/^http/, 'ws') + '/api/v1/ws';
let socket: WebSocket | null = null;
const listeners: ((data: any) => void)[] = [];

// --- Type Definitions for all cached items ---
interface DataPoint { x: number; y: number; }
interface LogEntry { id: string; level: 'Info' | 'Warning' | 'Alert'; message: string; }
export interface ChatMessage { id: string; role: 'user' | 'assistant'; content: string; timestamp: Date; }
interface OptimizerState {
    inputs: { targetSPC: string; targetQuality: string; maxTSR: string; };
    result: string;
    isLoading: boolean;
}

const MAX_HISTORY_LENGTH = 60;
const MAX_LOG_HISTORY = 50;

// The single, unified history object for the entire application
const history: {
    spc: DataPoint[];
    tsr: DataPoint[];
    clinker_quality: DataPoint[];
    co2: DataPoint[];
    logs: LogEntry[];
    chatMessages: ChatMessage[];
    optimizer: OptimizerState; 
} = {
    spc: [],
    tsr: [],
    clinker_quality: [],
    co2: [],
    logs: [],
    chatMessages: [{
        id: '1',
        role: 'assistant',
        content: "Hello! I'm your AI Co-Pilot. How can I assist with the plant's operations today?",
        timestamp: new Date(),
    }],
    optimizer: {
        inputs: { targetSPC: '850', targetQuality: '50', maxTSR: '35' },
        result: '',
        isLoading: false,
    },
};

const connect = () => {
  if (socket && socket.readyState === WebSocket.OPEN) return;
  socket = new WebSocket(WS_URL);

  socket.onopen = () => console.log('Global WebSocket connection established.');

  socket.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      console.log('Received WebSocket payload:', payload);
      
      if (!payload) return;

      if (payload.kpi_data) {
          const liveData = payload.kpi_data;
          const timestamp = Date.now();
          
          // Ensure the data is valid before adding
          if (typeof liveData.spc === 'number') {
              history.spc.push({ x: timestamp, y: liveData.spc });
          }
          if (typeof liveData.tsr === 'number') {
              history.tsr.push({ x: timestamp, y: liveData.tsr });
          }
          if (typeof liveData.clinker_quality === 'number') {
              history.clinker_quality.push({ x: timestamp, y: liveData.clinker_quality });
          }
          if (typeof liveData.co2 === 'number') {
              history.co2.push({ x: timestamp, y: liveData.co2 });
          }

          // Maintain history length limits
          if (history.spc.length > MAX_HISTORY_LENGTH) {
              history.spc.shift();
              history.tsr.shift();
              history.clinker_quality.shift();
              history.co2.shift();
          }
      }

      if (payload.log_entry) {
          // Validate log entry structure
          if (payload.log_entry.id && payload.log_entry.level && payload.log_entry.message) {
              history.logs.unshift(payload.log_entry);
              if (history.logs.length > MAX_LOG_HISTORY) {
                  history.logs.pop();
              }
          }
      }

      // Notify all listeners
      listeners.forEach(listener => {
          try {
              listener(payload);
          } catch (err) {
              console.error('Error in WebSocket listener:', err);
          }
      });
    } catch (err) {
      console.error('Error processing WebSocket message:', err);
    }
  };

  socket.onerror = (error) => console.error('Global WebSocket error:', error);
  socket.onclose = () => {
    console.log('Global WebSocket connection closed. Attempting to reconnect...');
    setTimeout(connect, 3000);
  };
};

// --- EXPORTED FUNCTIONS FOR COMPONENTS TO USE ---

// Fixed getHistory function - now returns the actual history object
export const getHistory = () => {
    try {
        console.log('getHistory called, returning:', history);
        return {
            spc: [...history.spc],
            tsr: [...history.tsr],
            clinker_quality: [...history.clinker_quality],
            co2: [...history.co2],
            logs: [...history.logs],
            chatMessages: [...history.chatMessages],
            optimizer: { ...history.optimizer }
        };
    } catch (error) {
        console.error('Error in getHistory:', error);
        return {
            spc: [],
            tsr: [],
            clinker_quality: [],
            co2: [],
            logs: [],
            chatMessages: [],
            optimizer: {
                inputs: { targetSPC: '850', targetQuality: '50', maxTSR: '35' },
                result: '',
                isLoading: false,
            }
        };
    }
};

export const addChatMessage = (message: ChatMessage) => {
    history.chatMessages.push(message);
};

export const updateOptimizerState = (newState: Partial<OptimizerState>) => {
    history.optimizer = { ...history.optimizer, ...newState };
};

export const subscribeToLiveData = (callback: (data: any) => void) => {
  if (!socket) connect();
  listeners.push(callback);

  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) listeners.splice(index, 1);
  };
};

// Initialize connection
connect();