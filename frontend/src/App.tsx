import React, { useState, useEffect } from 'react';
import FormPage from './pages/FormPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LoadingScreen from './components/Loading/LoadingScreen';
import './App.css';

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing system...');
  const apiBaseUrl = process.env.REACT_APP_API_URL || "https://backend1.atssfiber.ph";

  useEffect(() => {
    const initializeSystem = async () => {
      try {
        setLoadingMessage('Connecting to server...');
        
        const healthCheck = await fetch(`${apiBaseUrl}/api/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }).catch(() => null);

        if (healthCheck && healthCheck.ok) {
          setLoadingMessage('Loading configuration...');
          await new Promise(resolve => setTimeout(resolve, 300));
          
          setLoadingMessage('Preparing data...');
          await new Promise(resolve => setTimeout(resolve, 300));
          
          setLoadingMessage('System ready');
          await new Promise(resolve => setTimeout(resolve, 200));
        } else {
          setLoadingMessage('Server connection failed - continuing offline');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setLoadingMessage('Error during initialization - continuing');
        await new Promise(resolve => setTimeout(resolve, 1000));
      } finally {
        setIsLoading(false);
      }
    };

    initializeSystem();
  }, [apiBaseUrl]);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const renderPage = () => {
    if (currentPath === '/login') {
      return <Login />;
    }
    if (currentPath === '/dashboard') {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        window.location.href = '/login';
        return <Login />;
      }
      return <Dashboard />;
    }
    return <FormPage />;
  };

  if (isLoading) {
    return <LoadingScreen message={loadingMessage} />;
  }

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
};

export default App;
