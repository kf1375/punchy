import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, CircularProgress, Typography, Button, Tab, Tabs, Box, Slider, Select, MenuItem } from '@mui/material';

import Grid from '@mui/material/Grid2';

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

    // Callbacks for actions
    const startSingleTurn = async () => {
        const { device_id } = device
        const response = await fetch(`/api/devices/${device_id}/start/single`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                speed: singleSpeed,
            }),
        });
        if (!response.ok) {
            setError('Failed to send Start Single');
        }
    };

    const startInfiniteTurn = async () => {
        const { device_id } = device
        const response = await fetch(`/api/devices/${device_id}/start/infinite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                speed: infiniteSpeed,
            }),
        });
        if (!response.ok) {
            setError('Failed to send Start Single');
        }
    };

    const stop = async () => {
        const { device_id } = device
        const response = await fetch(`/api/devices/${device_id}/stop`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                speed: 0,
            }),
        });
        if (!response.ok) {
            setError('Failed to send Stop');
        }
    };

    const handleSettingChange = async (settingName, value) => {
        const { device_id } = device
        const response = await fetch(`/api/devices/${device_id}/settings/${settingName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                value: value,
            }),
        });
        if (!response.ok) {
            setError(`Failed to send ${settingName}`);
        }
    };

    const handleCommandChange = async (commandName, value) => {
        const { device_id } = device
        const response = await fetch(`/api/devices/${device_id}/commands/${commandName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                value: value,
            }),
        });
        if (!response.ok) {
            setError(`Failed to send ${commandName}`);
        }
    };

    if (error) {
        return (
            <Container sx={{ marginTop: 4 }}>
                <Typography variant="h6" color="error" align="center">
                    {error}
                </Typography>
            </Container>
        );
    }

    if (!device) {
        return (
            <Container sx={{ marginTop: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ width: '100%', justifyContent: 'space-evenly'}} fullWidth>
                <Tab label="Manual" />
                <Tab label="Automatic" />
                <Tab label="Setting" />
            </Tabs>
            {activeTab === 0 && (
                <Grid 
                    container 
                    spacing={2}
                    marginTop={3}
                    direction={"column" }
                    sx={{
                        alignItems:"center",
                    }}
                >
                    <Grid item sx={{ width: '100%' }}>
                        <Button variant="contained" color="primary" fullWidth onClick={startSingleTurn}>
                            Start Single Turn
                        </Button>
                        <Slider
                            value={singleSpeed}
                            onChange={(e, newValue) => setSingleSpeed(newValue)}
                            aria-label="Single Speed"
                            valueLabelDisplay="auto"
                            max={maxHalfSpeed}
                            sx={{ marginTop: 2 }}
                        />
                    </Grid>
                    <Grid item sx={{ width: '100%' }}>
                        <Button variant="contained" color="primary" fullWidth onClick={startInfiniteTurn}>
                            Start Infinite Turn
                        </Button>
                        <Slider
                            value={infiniteSpeed}
                            onChange={(e, newValue) => setInfiniteSpeed(newValue)}
                            aria-label="Infinite Speed"
                            valueLabelDisplay="auto"
                            max={maxFullSpeed}
                            sx={{ marginTop: 2 }}
                        />
                    </Grid>
                    <Grid sx={{ width: '100%' }}>
                        <Button variant="contained" color="secondary" fullWidth onClick={stop}>
                            Stop
                        </Button>
                    </Grid>
                </Grid>
            )}
            {activeTab === 1 && (
                <Box>
                    <Typography variant="body1">Automatic Mode {device.name}</Typography>
                </Box>
            )}
            {activeTab === 2 && (
                <Grid container direction={"column"} spacing={2} marginTop={3}>
                    <Grid item>
                        <Typography variant="body1">Device Name: {device.name}</Typography>
                        <Typography variant="body1">Device ID: {device.device_id}</Typography>
                        <Typography variant="body1">Device Serial Number: {device.serial_number}</Typography>
                    </Grid>
                    <Grid item sx={{ width: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Parameters
                        </Typography>
                    </Grid>
                    <Grid item sx={{ width: '100%' }}>
                        <Select
                            value={turnType}
                            onChange={(e) => {
                                setTurnType(e.target.value);
                                handleSettingChange('turn_type', e.target.value);
                            }}
                            fullWidth
                        >
                            <MenuItem value="Half Turn">Half Turn</MenuItem>
                            <MenuItem value="Full Turn">Full Turn</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item direction={"row"} sx={{ width: '100%' }} alignItems={"center"}>
                        <Grid container spacing={2}>
                            <Grid item>
                                <Button variant="contained" color="primary" fullWidth onClick={() => handleCommandChange('up', 1)}>
                                    Up
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button variant="contained" color="primary" fullWidth onClick={() => handleCommandChange('down', 1)}>
                                    Down
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item sx={{ width: '100%' }} alignItems={"center"}>
                        <Grid container direction={"row"} spacing={2}>
                            <Grid item>
                                <Button variant="contained" color="secondary" fullWidth onClick={() => handleSettingChange('set_front', 1)}>
                                    Set Front
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button variant="contained" color="secondary" fullWidth onClick={() => handleSettingChange('set_rear', 1)}>
                                    Set Rear
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item sx={{ width: '100%' }} alignItems={"center"}>
                        <Typography variant="body1">Max Half Turn Speed</Typography>
                        <Slider
                            value={maxHalfSpeed}
                            onChange={(e, newValue) => setMaxHalfSpeed(newValue)}
                            onChangeCommitted={(e, newValue) => handleSettingChange('max_half_speed', newValue)}
                            aria-label="Max Half Turn Speed"
                            valueLabelDisplay="auto"
                            max={1000}
                        />
                    </Grid>
                    <Grid sx={{ width: '100%' }} alignItems={"center"}>
                        <Typography variant="body1">Max Full Turn Speed</Typography>
                        <Slider
                            value={maxFullSpeed}
                            onChange={(e, newValue) => setMaxFullSpeed(newValue)}
                            onChangeCommitted={(e, newValue) => handleSettingChange('max_full_speed', newValue)}
                            aria-label="Max Full Turn Speed"
                            valueLabelDisplay="auto"
                            max={1000}
                        />
                    </Grid>
                </Grid>
            )}
            <Button variant="outlined" color="secondary" fullWidth onClick={handleClose} sx={{ marginTop: 2 }}>
                Back to Devices
            </Button>
        </Container>
    );
};

export default DeviceControlPanel;
