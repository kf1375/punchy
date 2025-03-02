import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Box, CircularProgress, Avatar, Paper } from '@mui/material';
import { styled } from '@mui/system';

// Custom Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(1.5, 3),
  fontSize: '1rem',
  fontWeight: 'bold',
}));

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe?.user;
      const telegramId = user?.id;

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
      <Container sx={{ marginTop: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ marginTop: 4 }}>
        <Typography variant="h6" color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <StyledPaper>
        <ProfileHeader>
          <Avatar
            src={userData.avatar || '/default-avatar.png'}
            alt={userData.name}
            sx={{ width: 64, height: 64 }}
          />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Welcome, {userData.name}!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Telegram ID: {userData.telegram_id}
            </Typography>
          </Box>
        </ProfileHeader>
        <Box>
          <Typography variant="body1" gutterBottom>
            <strong>Subscription Type:</strong> {userData.subscription_type}
          </Typography>
        </Box>
        <StyledButton variant="contained" color="primary" fullWidth>
          Get Premium
        </StyledButton>
      </StyledPaper>
    </Container>
  );
};

export default Profile;
