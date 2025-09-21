// src/contexts/ControllerContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ChartData } from 'chart.js';

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
  plantStatus: 'Running' | 'Stopped' | 'Maintenance'; // Add plantStatus here
}

// --- Reducer Actions ---
type Action =
  | { type: 'ADD_LOG'; payload: LogEntry }
  | { type: 'ADD_KPI_DATA'; payload: { spc: number; tsr: number; clinker_quality: number; co2: number; timestamp: number } }
  | { type: 'SET_PLANT_STATUS'; payload: 'Running' | 'Stopped' | 'Maintenance' }; // Add this action type

// --- Reducer Function ---
const controllerReducer = (state: ControllerState, action: Action): ControllerState => {
  switch (action.type) {
    case 'ADD_LOG':
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
    case 'SET_PLANT_STATUS': // Add this case
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
    plantStatus: 'Running', // Set initial status
  };
  const [state, dispatch] = useReducer(controllerReducer, initialState);

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