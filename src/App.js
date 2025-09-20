import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AlertProvider } from './contexts/AlertContext';
import Dashboard from './components/Dashboard';
import TextAnalyzer from './components/TextAnalyzer';
import ImageAnalyzer from './components/ImageAnalyzer';
import RealTimeAlerts from './components/RealTimeAlerts';
import IntegrationExamples from './components/IntegrationExamples';
import AlertNotification from './components/AlertNotification';

import './App.css';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>🛡️ Anti-Phishing Assistant</h2>
        <p>Loading your security dashboard...</p>
      </div>
    );
  }

  return (
    <AlertProvider>
      <Router>
        <div className="App">
          <AlertNotification />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/text-analyzer" element={<TextAnalyzer />} />
            <Route path="/image-analyzer" element={<ImageAnalyzer />} />
            <Route path="/alerts" element={<RealTimeAlerts />} />
            <Route path="/integrations" element={<IntegrationExamples />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AlertProvider>
  );
}

export default App;