import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { ThemeProvider, createTheme } from '@mui/material/styles'

import Login from './pages/Login';
import Devices from './pages/Devices';
import Profile from './pages/Profile';
import Help from './pages/Help';
import AddDevice from './pages/AddDevice';
import DeviceControlPanel from './pages/DeviceControlPanel';

import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';
import SwipeablePage from './Components/SwipeablePage/SwipeablePage';
import BottomNavBar from './Components/BottomNavBar/BottomNavBar';

const App = () => {
  const [activeTab, setActiveTab] = useState(1); // 0: Devices, 1: Profile, 2: Help
  const [themeMode, setThemeMode] = useState('light'); // 'light' or 'dark'
  const [userExists, setUserExists] = useState(null);

  const handleSwipe = (direction) => {
    if (direction === 'left') {
      setActiveTab((prev) => (prev + 1) % 3); // Cycle to next tab
    } else if (direction === 'right') {
      setActiveTab((prev) => (prev - 1 + 3) % 3); // Cycle to previous tab
    }
  };

  const routes = ['/devices', '/', '/help'];
  
  useEffect(() => {
    // Ensure the Telegram WebApp object is available
    const checkUserExistence = async () => {
      if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        const telegramId = user.id;
        telegramId = 94500506
        try {
          const response = await fetch(`/api/users/${telegramId}`);
          const { data } = await response.json();
          if (data.exists) {
            setUserExists(true);}
          else {
            setUserExists(false);
          }
        } catch (error) {
          console.error('Error checking user existence:', error);
          setUserExists(false); // Default to requiring sign-up on error
        }
      } else {
        setUserExists(false); // If Telegram user info is unavailable
      }
    };

    checkUserExistence();
  }, []);

  useEffect(() => {
    // Ensure the Telegram WebApp object is available
    if (window.Telegram && window.Telegram.WebApp) {
      const telegramTheme = window.Telegram.WebApp.themeParams;
      // Check if Telegram theme is dark or light
      if (telegramTheme) {
        const isDarkMode = telegramTheme.bg_color === '#000000'; // Or use other checks like text_color
        setThemeMode(isDarkMode ? 'dark' : 'light');
      }
    }
  }, []);

  const theme = createTheme({
    palette: {
      mode: themeMode,
    },
  });

  if (userExists === null) {
    // Show a loading state while checking user existence
    return <div>Loading...</div>;
  }

  return (
    // <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path='/add-device'
            element={
              <ProtectedRoute userState={userExists}>
                <AddDevice />
              </ProtectedRoute>
            }
          />
          <Route
            path={`/device-control/:serialNumber`}
            element={
              <ProtectedRoute userState={userExists}>
                <DeviceControlPanel />
              </ProtectedRoute>
            }
          />
          {routes.map((path, index) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute userState={userExists}>
                  <SwipeablePage
                    leftTarget={routes[(index + 1) % routes.length]}
                    rightTarget={routes[(index - 1 + routes.length) % routes.length]}
                    onSwipe={(direction) => handleSwipe(direction)}
                  >
                    {index === 0 && <Devices />}
                    {index === 1 && <Profile />}
                    {index === 2 && <Help />}
                    <BottomNavBar activeTab={activeTab} onChange={setActiveTab} />
                  </SwipeablePage>
                </ProtectedRoute>
              }
            />
          ))}
        </Routes>
      </Router>
    // </ThemeProvider>
  );
};

export default App;
