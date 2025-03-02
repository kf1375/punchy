import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

import Login from './pages/Login';
import Devices from './pages/Devices';
import Profile from './pages/Profile';
import Help from './pages/Help';
import AddDevice from './pages/AddDevice';
import DeviceControlPanel from './pages/DeviceControlPanel';
import ShareDevice from './pages/ShareDevice';

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

        try {
          const response = await fetch(`/api/users?telegram_id=${telegramId}`)
          const data = await response.json();
          if (data && data.user_id) {
            setUserExists(true); // User exists if user_id is present
          } else {
            setUserExists(false); // No valid user found
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
    if (window.Telegram && window.Telegram.WebApp) {
      const telegramTheme = window.Telegram.WebApp.colorScheme;
      if (telegramTheme) {
        setThemeMode(telegramTheme === 'dark' ? 'dark' : 'light');
      }
    }
  }, []);

  // create a darkTheme function to handle dark theme using createTheme
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/add-device"
            element={
              <ProtectedRoute userExists={userExists}>
                <AddDevice />
              </ProtectedRoute>
            }
          />
          <Route
            path={`/device-control/:deviceId`}
            element={
              <ProtectedRoute userExists={userExists}>
                <DeviceControlPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path={`/share-device/:deviceId`}
            element={
              <ProtectedRoute userExists={userExists}>
                <ShareDevice />
              </ProtectedRoute>
            }
          />
          {routes.map((path, index) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute userExists={userExists}>
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
    </ThemeProvider>
  );
};

export default App;
