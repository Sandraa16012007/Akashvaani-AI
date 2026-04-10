import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import SchemesPage from './pages/SchemesPage';
import ApplicationsPage from './pages/ApplicationsPage';
import DocumentsPage from './pages/DocumentsPage';
import VoiceAssistantPage from './pages/VoiceAssistantPage';

// Simple placeholder page for settings
const SettingsPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Settings</h1></div>;

function App() {
  // Global Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Mock User Info
  const [userProfile, setUserProfile] = useState(null);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    // Generic user profile
    setUserProfile({ name: "Citizen", isDemo: false });
  };

  const handleDemoLogin = () => {
    setIsLoggedIn(true);
    setUserProfile({
      name: "Ravi Kumar",
      age: 19,
      income: 200000,
      occupation: "Student",
      state: "Uttar Pradesh",
      isDemo: true
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserProfile(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-indian-offwhite">
        <Routes>
          {/* Public Route */}
          <Route 
            path="/" 
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LandingPage 
                  onLoginSuccess={handleLoginSuccess} 
                  onGetStartedSuccess={handleLoginSuccess}
                  onDemoLogin={handleDemoLogin}
                />
              )
            } 
          />

          {/* Protected Dashboard Routes */}
          <Route 
            path="/" 
            element={
              isLoggedIn ? (
                <DashboardLayout userProfile={userProfile} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          >
            <Route path="dashboard" element={<DashboardHome userProfile={userProfile} />} />
            <Route path="schemes" element={<SchemesPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="voice-assistant" element={<VoiceAssistantPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
