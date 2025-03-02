import React, { useState, useEffect } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Scanner, } from '@yudiel/react-qr-scanner'

const ShareDevice = () => {
    const { deviceId } = useParams();
    const [userId, setUserId] = useState(null);
    const [userTelegramId, setUserTelegramId] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

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

    const handleShareDevice = async () => {
        try {
            setError('');
            setMessage('');

            if (!userTelegramId.trim()) {
                setError('Telegram ID is required');
                return;
            }
            
            if (!userId) {
                setError('User ID is not available');
                return;
            }

            const userResponse = await fetch(`/api/users/${userTelegramId}`);
            if (!userResponse.ok) {
                setError('Cannot find the user');
                return;
            }

            const user = await userResponse.json();
            const { user_id } = user;
            const shareResponse = await fetch(`/api/devices/${deviceId}/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    owner_id: userId,
                    user_id: user_id,
                    access_level: 'control',
                }),
            });
            if (shareResponse.ok) {
                const sharedDevice = await shareResponse.json();
                setMessage('Device shared successfully!');
                setUserTelegramId('');
            } else {
                const errorData = await shareResponse.json();
                setError(errorData.error || 'Failed to add device');
            }
        } catch (err) {
            setError(`Error: ${err.message}`);
        }
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
                    value={userTelegramId}
                    onChange={(e) => setUserTelegramId(e.target.value)}
                    sx={{ marginBottom: 2 }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                    <Button variant="contained" color="primary" fullWidth onClick={handleShareDevice} sx={{ marginRight: 1 }}>
                        Share Device
                    </Button>
                    <Button variant="outlined" color="secondary" fullWidth onClick={handleCancel} sx={{ marginLeft: 1 }}>
                        Cancel
                    </Button>
                </Box>

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
