// src/contexts/ControllerContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ChartData } from 'chart.js';

// --- Interfaces for State Management ---
interface LogEntry {
  id: string;
  level: 'Info' | 'Warning' | 'Alert';
  message: string;
}

// Defines the shape of a single data point in our charts
type ChartPoint = { x: number; y: number };

// Defines the complete state managed by our context
interface ControllerState {
  logs: LogEntry[];
  spcHistory: ChartPoint[];
  tsrHistory: ChartPoint[];
  clinkerQualityHistory: ChartPoint[];
  co2History: ChartPoint[];
}

// --- Reducer Actions ---
// Defines all possible actions that can be dispatched to update the state
type Action =
  | { type: 'ADD_LOG'; payload: LogEntry }
  | { type: 'ADD_KPI_DATA'; payload: { spc: number; tsr: number; clinker_quality: number; co2: number; timestamp: number } };

// --- Reducer Function ---
// This function handles state updates based on the dispatched action
const controllerReducer = (state: ControllerState, action: Action): ControllerState => {
  switch (action.type) {
    case 'ADD_LOG':
      // Adds a new log and keeps the list to a maximum of 50
      return {
        ...state,
        logs: [action.payload, ...state.logs].slice(0, 50),
      };
    case 'ADD_KPI_DATA':
      const { timestamp, spc, tsr, clinker_quality, co2 } = action.payload;
      // Adds new data points to each history array and keeps them to a max of 300 points
      return {
        ...state,
        spcHistory: [...state.spcHistory, { x: timestamp, y: spc }].slice(-300),
        tsrHistory: [...state.tsrHistory, { x: timestamp, y: tsr }].slice(-300),
        clinkerQualityHistory: [...state.clinkerQualityHistory, { x: timestamp, y: clinker_quality }].slice(-300),
        co2History: [...state.co2History, { x: timestamp, y: co2 }].slice(-300),
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
  };
  const [state, dispatch] = useReducer(controllerReducer, initialState);

  return (
    <ControllerContext.Provider value={{ state, dispatch }}>
      {children}
    </ControllerContext.Provider>
  );
};

// --- Custom Hook ---
// A simple hook to make accessing the context easier
export const useController = () => {
  const context = useContext(ControllerContext);
  if (context === undefined) {
    throw new Error('useController must be used within a ControllerProvider');
  }
  return context;
};