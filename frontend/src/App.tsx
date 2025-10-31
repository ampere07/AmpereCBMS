import React, { useState, useEffect } from 'react';
import FormPage from './pages/FormPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './App.css';

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

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

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
};

export default App;
