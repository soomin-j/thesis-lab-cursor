import React, { useState } from 'react';
import { AuthProvider, useAuth } from './store/AuthContext';
import MapScreen from './screens/MapScreen';
import HistoryScreen from './screens/HistoryScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<'map' | 'history'>('map');
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [mapRefreshKey, setMapRefreshKey] = useState(0);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    if (authScreen === 'register') {
      return <RegisterScreen onBack={() => setAuthScreen('login')} />;
    }
    return <LoginScreen onRegister={() => setAuthScreen('register')} />;
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">SenseScape</div>
        <div className="nav-tabs">
          <button
            className={currentScreen === 'map' ? 'active' : ''}
            onClick={() => {
              setCurrentScreen('map');
              // Refresh map data when switching back to map
              setMapRefreshKey(prev => prev + 1);
            }}
          >
            Map
          </button>
          <button
            className={currentScreen === 'history' ? 'active' : ''}
            onClick={() => setCurrentScreen('history')}
          >
            History
          </button>
        </div>
      </nav>
      <main className="main-content">
        {currentScreen === 'map' && <MapScreen key={mapRefreshKey} />}
        {currentScreen === 'history' && <HistoryScreen />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

