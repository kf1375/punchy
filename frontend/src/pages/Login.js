import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, CircularProgress, Alert, Box, Card, CardContent } from '@mui/material';

const Login = () => {
  const [telegramUser, setTelegramUser] = useState(null);
  const [isUserExists, setIsUserExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const checkUserExistence = async () => {
      const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
      setTelegramUser(user);

      if (user && user.username) {
        try {
          const response = await fetch(`/api/users/${user.id}`);
          const data = await response.json();
          
          if (data && data.user_id) {
            setIsUserExists(true);
            window.location.href = '/';
            // navigate('/'); // Redirect to the home page for existing users
          }
        } catch (err) {
          console.error('Error checking user existence:', err);
          setError('Failed to check user existence. Please try again later.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError('Could not retrieve Telegram user information.');
      }
    };

    checkUserExistence();
  }, [navigate]);

  const handleSignUp = () => {
    if (!telegramUser) return;

    const userData = {
      telegram_id: telegramUser.id,
      name: `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
      subscription_type: 0, // Default subscription type
    };

    fetch(`/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to register user.');
        }
        return response.json();
      })
      .then(() => {
        alert('User registered successfully!');
        window.location.href = '/';
        // navigate('/'); // Redirect new users to the home page
      })
      .catch((err) => {
        console.error('Error registering user:', err);
        setError('Failed to register. Please try again later.');
      });
  };

  if (loading) {
    return (
      <Container maxWidth="xs">
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (isUserExists) {
    return (
      <Container maxWidth="xs">
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <Typography variant="h6" color="textSecondary">
            You are already registered. Redirecting...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xs" sx={{ mt: 4 }}>
      <Card sx={{ p: 3 }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            Sign Up
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          {telegramUser ? (
            <Box>
              <Typography variant="h6" align="center" gutterBottom>
                Welcome, {telegramUser.first_name} {telegramUser.last_name || ''}!
              </Typography>
              <Box display="flex" justifyContent="center" gap={2}>
                <Button variant="contained" color="primary" fullWidth onClick={handleSignUp}>
                  Sign Up
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography variant="body1" color="textSecondary" align="center">
              Telegram user information is not available.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;
