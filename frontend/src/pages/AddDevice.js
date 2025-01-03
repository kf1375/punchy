import React, { useState, useEffect } from 'react';
import { Box, Container, TextField, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AddDevice = () => {
  const [serialNumber, setSerialNumber] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user info from Telegram
    const fetchUserId = async () => {
      try {
        if (window.Telegram && window.Telegram.WebApp) {
          const user = window.Telegram.WebApp.initDataUnsafe?.user;
          const telegramId = user?.id;

          if (telegramId) {
            const response = await fetch(`/api/users/${telegramId}`);
            if (response.ok) {
              const userData = await response.json();
              setUserId(userData.user_id);
            } else {
              setError('Failed to fetch user data');
            }
          } else {
            setError('Telegram user ID not found');
          }
        } else {
          setError('Telegram Web App SDK is not loaded');
        }
      } catch (err) {
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserId();
  }, []);

  const handleAddDevice = async () => {
    try {
      setError('');
      setMessage('');

      if (!serialNumber.trim() || !deviceName.trim()) {
        setError('Both serial number and device name are required');
        return;
      }

      if (!userId) {
        setError('User ID not available');
        return;
      }

      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serial_number: serialNumber,
          name: deviceName,
          user_id: userId,
        }),
      });

      if (response.ok) {
        const newDevice = await response.json();
        setMessage(`Device "${newDevice.name}" added successfully!`);
        setSerialNumber('');
        setDeviceName('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add device');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  const handleCancel = () => {
    navigate('/devices'); // Navigate back to the Devices page
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        flexDirection: 'column',
      }}
    >
      <Container>
        <Typography variant="h4" gutterBottom>
          Add Device
        </Typography>
        <TextField
          label="Device Name"
          variant="outlined"
          fullWidth
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Serial Number"
          variant="outlined"
          fullWidth
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
          <Button variant="contained" color="primary" onClick={handleAddDevice}>
            Add Device
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </Box>
        {message && <Typography color="success.main" sx={{ marginTop: 2 }}>{message}</Typography>}
        {error && <Typography color="error" sx={{ marginTop: 2 }}>{error}</Typography>}
      </Container>
    </Box>
  );
};

export default AddDevice;
