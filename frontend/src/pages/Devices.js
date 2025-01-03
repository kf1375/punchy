import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, List, ListItem, ListItemText, Button } from '@mui/material';

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

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  const handleDeviceClick = (serialNumber) => {
    navigate(`/device-control/${serialNumber}`);
  };

  const handleAddDevice = () => {
    navigate('/add-device'); // Navigate to AddDevice page
  };

  return (
    <Container sx={{ marginTop: 4 }}>
      <Typography variant="h4" gutterBottom>
        Devices Page
      </Typography>
      <List>
        {devices.map((device) => (
          <ListItem button key={device.id} onClick={() => handleDeviceClick(device.serial_number)}>
            <Button fullWidth variant="outlined">
              {device.name}
            </Button>
          </ListItem>
        ))}
      </List>
      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: 2 }}
        onClick={handleAddDevice}
      >
        Add Device
      </Button>
    </Container>
  );
};

export default Devices;
