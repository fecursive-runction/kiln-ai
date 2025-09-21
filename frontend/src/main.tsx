// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ControllerProvider } from './contexts/ControllerContext'; // ADD THIS LINE
import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ControllerProvider> {/* WRAP YOUR APP WITH THE PROVIDER */}
          <App />
        </ControllerProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);