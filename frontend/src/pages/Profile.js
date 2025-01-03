import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Box, CircularProgress } from '@mui/material';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if Telegram Web App SDK is loaded
    if (window.Telegram && window.Telegram.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe;

      // Extract the Telegram user ID from initDataUnsafe
      const telegramId = user?.user?.id;

      if (telegramId) {
        fetchUserData(telegramId);
      } else {
        setError('Telegram user ID not found');
        setLoading(false);
      }
    } else {
      setError('Telegram Web App SDK is not loaded');
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (telegramId) => {
    try {
      const response = await fetch(`/api/users/${telegramId}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        setError('User not found');
      }
    } catch (error) {
      setError('Error fetching user data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ marginTop: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ marginTop: 4 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ marginTop: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profile Page
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Welcome, {userData.name}!
        </Typography>
        <Typography variant="body1" gutterBottom>
          Subscription Type: {userData.subscription_type}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Telegram ID: {userData.telegram_id}
        </Typography>
        <Button variant="contained" color="primary" sx={{ marginTop: 2 }}>
          Edit Profile
        </Button>
      </Box>
    </Container>
  );
};

export default Profile;
