import React, { useState } from 'react';
import { AuthProvider, useAuth } from './store/AuthContext';
import MapScreen from './screens/MapScreen';
import LogScreen from './screens/LogScreen';
import HistoryScreen from './screens/HistoryScreen';
import LoginScreen from './screens/LoginScreen';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<'map' | 'log' | 'history'>('map');
  const [mapRefreshKey, setMapRefreshKey] = useState(0);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
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
            className={currentScreen === 'log' ? 'active' : ''}
            onClick={() => setCurrentScreen('log')}
          >
            Log
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
        {currentScreen === 'log' && <LogScreen />}
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

