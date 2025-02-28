import React, { useState, useEffect } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Scanner, } from '@yudiel/react-qr-scanner'

const ShareDevice = () => {
    const [serialNumber, setSerialNumber] = useState('');
    const [deviceName, setDeviceName] = useState('');
    const [userId, setUserId] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [pairingInProgress, setPairingInProgress] = useState(false);
    const [showScanner, setShowScanner] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
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
            setPairingInProgress(true);

            if (!serialNumber.trim() || !deviceName.trim()) {
                setError('Both serial number and device name are required');
                setPairingInProgress(false);
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
            setPairingInProgress(false);
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

    const handleScan = (value) => {
        if (value) {
            setSerialNumber(value);
            setShowScanner(false);
        }
    };

    const handleError = (err) => {
        console.error(err);
        setError('Error scanning QR code');
    };

    const handleCancel = () => {
        navigate('/devices');
    };

    if (loading) {
        return (
            <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 2,
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    padding: 4,
                    maxWidth: 400,
                    width: '100%',
                    borderRadius: 3,
                    boxShadow: 3,
                    textAlign: 'center',
                }}
            >
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Sharing the device
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 3 }}>
                    Enter your partner's Telegram ID.
                </Typography>
                <TextField
                    label="Telegram ID"
                    variant="outlined"
                    fullWidth
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    sx={{ marginBottom: 2 }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                    <Button variant="contained" color="primary" fullWidth onClick={handleAddDevice} sx={{ marginRight: 1 }}>
                        Share Device
                    </Button>
                    <Button variant="outlined" color="secondary" fullWidth onClick={handleCancel} sx={{ marginLeft: 1 }}>
                        Cancel
                    </Button>
                </Box>

                {pairingInProgress && (
                    <Typography sx={{ marginTop: 2 }} color="primary">
                        Pairing in progress... Please wait.
                    </Typography>
                )}
                {message && (
                    <Typography color="success.main" sx={{ marginTop: 2 }}>
                        {message}
                    </Typography>
                )}
                {error && (
                    <Typography color="error" sx={{ marginTop: 2 }}>
                        {error}
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default ShareDevice;
