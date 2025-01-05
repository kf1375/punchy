import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Tab, Tabs, Box, Slider, Select, MenuItem } from '@mui/material';

const DeviceControlPanel = () => {
    const { serialNumber } = useParams();
    const [device, setDevice] = useState(null);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [singleSpeed, setSingleSpeed] = useState(50);
    const [infiniteSpeed, setInfiniteSpeed] = useState(50);
    const [maxHalfSpeed, setMaxHalfSpeed] = useState(100);
    const [maxFullSpeed, setMaxFullSpeed] = useState(100);
    const [turnType, setTurnType] = useState('Half Turn');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchDevice = async () => {
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
                                const device = devicesData.find((d) => d.serial_number === serialNumber);
                                setDevice(device);
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
                    setError('User ID not found');
                }
            } catch (err) {
                setError(`Error: ${err.message}`);
            }
        };

        fetchDevice();
    }, [serialNumber]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleClose = () => {
        navigate('/devices'); // Navigate back to the Devices page
    };

    if (error) return <Typography color="error">{error}</Typography>;
    if (!device) return <Typography>Loading...</Typography>;

    return (
        <Container sx={{ marginTop: 4 }}>
            <Typography variant="h4" gutterBottom>
                Device Control Panel
            </Typography>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ marginBottom: 2 }}>
                <Tab label="Command" />
                <Tab label="Setting" />
            </Tabs>
            <Box hidden={activeTab !== 0}>
                <Typography variant="h6" gutterBottom>
                    Command Controls
                </Typography>
                <Box sx={{ marginBottom: 2 }}>
                    <Button variant="contained" color="primary" sx={{ marginRight: 2 }}>
                        Start Single Turn
                    </Button>
                    <Slider
                        value={singleSpeed}
                        onChange={(e, newValue) => setSingleSpeed(newValue)}
                        aria-label="Single Speed"
                        valueLabelDisplay="auto"
                        max={100}
                    />
                </Box>
                <Box sx={{ marginBottom: 2 }}>
                    <Button variant="contained" color="primary" sx={{ marginRight: 2 }}>
                        Start Infinite Turn
                    </Button>
                    <Slider
                        value={infiniteSpeed}
                        onChange={(e, newValue) => setInfiniteSpeed(newValue)}
                        aria-label="Infinite Speed"
                        valueLabelDisplay="auto"
                        max={100}
                    />
                </Box>
            </Box>
            <Box hidden={activeTab !== 1}>
                <Typography variant="h6" gutterBottom>
                    Device Info
                </Typography>
                <Typography variant="body1">Device Name: {device.name}</Typography>
                <Typography variant="body1">Device ID: {device.device_id}</Typography>
                <Typography variant="body1">Device Serial Number: {device.serial_number}</Typography>
                <Typography variant="h6" gutterBottom sx={{ marginTop: 2 }}>
                    Settings
                </Typography>
                <Box sx={{ marginBottom: 2 }}>
                    <Select
                        value={turnType}
                        onChange={(e) => setTurnType(e.target.value)}
                        displayEmpty
                        fullWidth
                    >
                        <MenuItem value="Half Turn">Half Turn</MenuItem>
                        <MenuItem value="Full Turn">Full Turn</MenuItem>
                    </Select>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    <Button variant="contained" color="primary">
                        Up
                    </Button>
                    <Button variant="contained" color="primary">
                        Down
                    </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    <Button variant="contained" color="secondary">
                        Set Front
                    </Button>
                    <Button variant="contained" color="secondary">
                        Set Rear
                    </Button>
                </Box>
                <Box sx={{ marginBottom: 2 }}>
                    <Typography variant="body1">Max Half Turn Speed</Typography>
                    <Slider
                        value={maxHalfSpeed}
                        onChange={(e, newValue) => setMaxHalfSpeed(newValue)}
                        aria-label="Max Half Turn Speed"
                        valueLabelDisplay="auto"
                        max={200}
                    />
                </Box>
                <Box sx={{ marginBottom: 2 }}>
                    <Typography variant="body1">Max Full Turn Speed</Typography>
                    <Slider
                        value={maxFullSpeed}
                        onChange={(e, newValue) => setMaxFullSpeed(newValue)}
                        aria-label="Max Full Turn Speed"
                        valueLabelDisplay="auto"
                        max={200}
                    />
                </Box>
            </Box>
            <Button variant="outlined" color="secondary" onClick={handleClose} sx={{ marginTop: 2 }}>
                Close
            </Button>
        </Container>
    );
};

export default DeviceControlPanel;
