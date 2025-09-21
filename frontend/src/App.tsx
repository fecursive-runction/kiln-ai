import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.tsx';
import MainLayout from './layouts/MainLayout.tsx';
import HomePage from './pages/HomePage.tsx';
import ControllerPage from './pages/ControllerPage.tsx';
import ChatbotPage from './pages/ChatbotPage.tsx';
import OptimizerPage from './pages/OptimizerPage.tsx';
import { useAuth } from './contexts/AuthContext.tsx';
import { Spinner } from 'react-bootstrap'; // Import Spinner for loading state

function App() {
  const { currentUser, loading } = useAuth(); // <-- Get the 'loading' state from our context

  // --- THIS IS THE FIX ---
  // If the auth state is still loading, show a full-screen spinner
  // and don't render any routes yet.
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-dark">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/" /> : <LoginPage />} />
      <Route
        path="/"
        element={currentUser ? <MainLayout /> : <Navigate to="/login" />}
      >
        <Route index element={<HomePage />} />
        <Route path="controller" element={<ControllerPage />} />
        <Route path="chatbot" element={<ChatbotPage />} />
        <Route path="optimizer" element={<OptimizerPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;