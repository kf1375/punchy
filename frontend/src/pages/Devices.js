import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, List, ListItem, Button, Box, CircularProgress, Paper } from '@mui/material';
import { styled } from '@mui/system';

// Custom Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  backgroundColor: theme.palette.background.default,
}));

const DevicesHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'capitalize',
  fontWeight: 'bold',
}));

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
        const telegramId = user?.id;

        if (telegramId) {
          const userResponse = await fetch(`/api/users/${telegramId}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            const userId = userData?.user_id;

            if (userId) {
              const devicesResponse = await fetch(`/api/users/${userId}/devices/`);
              if (devicesResponse.ok) {
                const devicesData = await devicesResponse.json();
                setDevices(devicesData);
              } else {
                setError('Failed to fetch devices');
              }
            } else {
              setError('User ID not found');
            }
          } else {
            setError('Failed to fetch user data');
          }
        } else {
          setError('Telegram user ID not found');
        }
      } catch (err) {
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

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

  const handleDeviceClick = (serialNumber) => {
    navigate(`/device-control/${serialNumber}`);
  };

  const handleAddDevice = () => {
    navigate('/add-device'); // Navigate to AddDevice page
  };

  const handleDeleteDevice = async (serial_number) => {
    const response = await fetch(`api/devices/${serial_number}`, { method: 'DELETE' });
    if (response.ok) {
      setDevices((prev) => prev.filter((device) => device.serial_number !== serial_number));
    } else {
      setError('Can not remove the device');
    }
  };

  return (
    <Container maxWidth="md">
      <DevicesHeader>
        <Typography variant="h5" fontWeight="bold">
          Your Devices
        </Typography>
        <StyledButton variant="contained" color="primary" onClick={handleAddDevice}>
          Add New Device
        </StyledButton>
      </DevicesHeader>
      <List sx={{ width: '100%' }}>
        {devices.length > 0 ? (
          devices.map((device) => (
            <ListItem
              key={device.id}
              disableGutters
              sx={{ width: '100%' }}
            >
              <StyledPaper
                sx={{ width: '100%', padding: 2 }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" fontWeight="bold">
                    {device.name}
                  </Typography>
                  <Box>
                    <StyledButton
                      variant="text"
                      color="primary"
                      onClick={() => handleDeviceClick(device.serial_number)}
                    >
                      View
                    </StyledButton>
                    <StyledButton
                      variant="text"
                      color="error"
                      onClick={() => handleDeleteDevice(device.serial_number)}
                    >
                      Remove
                    </StyledButton>
                  </Box>
                </Box>
              </StyledPaper>
            </ListItem>
          ))
        ) : (
          <Typography align="center" color="text.secondary">
            No devices found. Add a new device to get started!
          </Typography>
        )}
      </List>
    </Container>
  );
};

export default Devices;
