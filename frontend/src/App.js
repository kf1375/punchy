import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';

import { ThemeProvider, createTheme } from '@mui/material/styles'

import Login from './pages/Login';
import Devices from './pages/Devices';
import Profile from './pages/Profile';
import Help from './pages/Help';

import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';
import SwipeablePage from './Components/SwipeablePage/SwipeablePage';
import BottomNavBar from './Components/BottomNavBar/BottomNavBar';

const App = () => {
  const [activeTab, setActiveTab] = useState(0); // 0: Devices, 1: Profile, 2: Help
  const [themeMode, setThemeMode] = useState('light'); // 'light' or 'dark'

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

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          {routes.map((path, index) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute>
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
