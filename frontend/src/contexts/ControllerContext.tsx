// src/contexts/ControllerContext.tsx
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { subscribeToLiveData } from '../services/websocket'; // Import the subscription service

// --- Interfaces for State Management ---
interface LogEntry {
  id: string;
  level: 'Info' | 'Warning' | 'Alert';
  message: string;
}

type ChartPoint = { x: number; y: number };

interface ControllerState {
  logs: LogEntry[];
  spcHistory: ChartPoint[];
  tsrHistory: ChartPoint[];
  clinkerQualityHistory: ChartPoint[];
  co2History: ChartPoint[];
  plantStatus: 'Running' | 'Stopped' | 'Maintenance';
}

// --- Reducer Actions ---
type Action =
  | { type: 'ADD_LOG'; payload: LogEntry }
  | { type: 'ADD_KPI_DATA'; payload: { spc: number; tsr: number; clinker_quality: number; co2: number; timestamp: number } }
  | { type: 'SET_PLANT_STATUS'; payload: 'Running' | 'Stopped' | 'Maintenance' };

// --- Reducer Function ---
const controllerReducer = (state: ControllerState, action: Action): ControllerState => {
  switch (action.type) {
    case 'ADD_LOG':
      // Prevent duplicate logs
      if (state.logs.some(log => log.id === action.payload.id)) {
          return state;
      }
      return {
        ...state,
        logs: [action.payload, ...state.logs].slice(0, 50),
      };
    case 'ADD_KPI_DATA':
      const { timestamp, spc, tsr, clinker_quality, co2 } = action.payload;
      return {
        ...state,
        spcHistory: [...state.spcHistory, { x: timestamp, y: spc }].slice(-300),
        tsrHistory: [...state.tsrHistory, { x: timestamp, y: tsr }].slice(-300),
        clinkerQualityHistory: [...state.clinkerQualityHistory, { x: timestamp, y: clinker_quality }].slice(-300),
        co2History: [...state.co2History, { x: timestamp, y: co2 }].slice(-300),
      };
    case 'SET_PLANT_STATUS':
      return {
        ...state,
        plantStatus: action.payload,
      };
    default:
      return state;
  }
};

// --- Context and Provider ---
const ControllerContext = createContext<{
  state: ControllerState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

export const ControllerProvider = ({ children }: { children: ReactNode }) => {
  const initialState: ControllerState = {
    logs: [],
    spcHistory: [],
    tsrHistory: [],
    clinkerQualityHistory: [],
    co2History: [],
    plantStatus: 'Running',
  };
  const [state, dispatch] = useReducer(controllerReducer, initialState);

  // --- ADDITION: Centralized WebSocket Subscription ---
  useEffect(() => {
    // This effect runs once when the provider is mounted
    const unsubscribe = subscribeToLiveData((payload) => {
        if (!payload) return;

        // Dispatch live data directly to our global state
        if (payload.kpi_data) {
            dispatch({
                type: 'ADD_KPI_DATA',
                payload: { ...payload.kpi_data, timestamp: Date.now() }
            });
        }
        if (payload.log_entry) {
            dispatch({ type: 'ADD_LOG', payload: payload.log_entry });
        }
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs only once

  return (
    <ControllerContext.Provider value={{ state, dispatch }}>
      {children}
    </ControllerContext.Provider>
  );
};

// --- Custom Hook ---
export const useController = () => {
  const context = useContext(ControllerContext);
  if (context === undefined) {
    throw new Error('useController must be used within a ControllerProvider');
  }
  return context;
};