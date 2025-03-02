import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, List, ListItem, Button, Box, Tab, Tabs, CircularProgress, Paper } from '@mui/material';
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
  const [sharedDevices, setSharedDevices] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
        const telegramId = user?.username;

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

    const fetchSharedDevices = async () => {
      try {
        const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
        const telegramId = user?.username;

        if (telegramId) {
          const userResponse = await fetch(`/api/users/${telegramId}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            const userId = userData?.user_id;

            if (userId) {
              const sharedDevicesResponse = await fetch(`/api/users/${userId}/shared_devices/`);
              if (sharedDevicesResponse.ok) {
                const sharedDevicesData = await sharedDevicesResponse.json();
                // Fetch device names
                const devicesWithNames = await Promise.all(
                  sharedDevicesData.map(async (sharedDevice) => {
                    const deviceResponse = await fetch(`/api/devices/${sharedDevice.device_id}/`);
                    if (!deviceResponse.ok) {
                      throw new Error(`Failed to fetch device with ID: ${sharedDevice.device_id}`);
                    }
                    const deviceData = await deviceResponse.json();
                    return { ...sharedDevice, name: deviceData.name };
                  })
                );
                setSharedDevices(devicesWithNames);
              } else {
                setError('Failed to fetch shared devices');
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
    fetchSharedDevices();
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

  const handleView = (device_id) => {
    navigate(`/device-control/${device_id}`);
  };

  const handleAddDevice = () => {
    navigate('/add-device'); // Navigate to AddDevice page
  };

  const handleDeleteDevice = async (device_id) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this device?");
    if (!confirmDelete) {
      return; // Exit if the user cancels the action
    }

    try {
      const response = await fetch(`api/devices/${device_id}`, { method: 'DELETE' });
      if (response.ok) {
        setDevices((prev) => prev.filter((device) => device.device_id !== device_id));
      } else {
        setError('Can not remove the device');
      }
    } catch (error) {
      setError(`Error: ${error.message}`);
    }
  };

  const handleDeleteSharedDevice = async (device_id) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this device?");
    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`api/device`)
      const device = await fetch(``)
    } catch (error) {
    
    }
  };

  const handleShare = async (device_id) => {
    navigate(`/share-device/${device_id}`);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="md">
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ width: '100%', display: 'flex', justifyContent: 'space-evenly' }} fullWidth>
        <Tab label="Your Devices" sx={{ width: '50%', textAlign: 'center' }} />
        <Tab label="Shared Devices" sx={{ width: '50%', textAlign: 'center' }} />
      </Tabs>
      {activeTab === 0 && (
        <Container>
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
                          color="success"
                          onClick={() => handleShare(device.device_id)}
                        >
                          Share
                        </StyledButton>
                        <StyledButton
                          variant="text"
                          color="primary"
                          onClick={() => handleView(device.device_id)}
                        >
                          View
                        </StyledButton>
                        <StyledButton
                          variant="text"
                          color="error"
                          onClick={() => handleDeleteDevice(device.device_id)}
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
      )}
      {activeTab === 1 && (
        <Container>
          <DevicesHeader>
            <Typography variant="h5" fontWeight="bold">
              Shared Devices
            </Typography>
          </DevicesHeader>
          <List sx={{ width: '100%' }}>
            {sharedDevices.length > 0 ? (
              sharedDevices.map((sharedDevice) => (
                <ListItem
                  key={sharedDevice.id}
                  disableGutters
                  sx={{ width: '100%' }}
                >
                  <StyledPaper
                    sx={{ width: '100%', padding: 2 }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" fontWeight="bold">
                        {sharedDevice.name}
                      </Typography>
                      <Box>
                        <StyledButton
                          variant="text"
                          color="primary"
                          onClick={() => handleView(sharedDevice.device_id)}
                        >
                          View
                        </StyledButton>
                        <StyledButton
                          variant="text"
                          color="error"
                          onClick={() => handleDeleteSharedDevice(sharedDevice.device_id)}
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
                No shared devices found. You can ask your partner to share a device with you.
              </Typography>
            )}
          </List>
        </Container>
      )}
    </Container>
  );
};

export default Devices;
