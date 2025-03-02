import React, { useState, useEffect } from 'react';
import { Box, Container, List, ListItem, TextField, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate, useParams } from 'react-router-dom';

// Custom Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginBottom: theme.spacing(4),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
    backgroundColor: theme.palette.background.default,
}));

const StyledButton = styled(Button)(({ theme }) => ({
    textTransform: 'capitalize',
    fontWeight: 'bold',
}));

const ShareDevice = () => {
    const { deviceId } = useParams();
    const [ownerId, setOwnerId] = useState(null);
    const [sharingInfo, setSharingInfo] = useState([]);
    const [userId, setUserId] = useState('');
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
                        const response = await fetch(`/api/users?telegram_id=${telegramId}`)
                        if (response.ok) {
                            const userData = await response.json();
                            setOwnerId(userData.user_id);
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

        const fetchDeviceSharingStatus = async () => {
            try {
                const response = await fetch(`/api/devices/shared?device_id=${deviceId}`);
                if (response.ok) {
                    const sharingInfoData = await response.json();
                    // Fetch device names
                    const sharingInfoWithUserName = await Promise.all(
                        sharingInfoData.map(async (sharingInfo) => {
                            const userResponse = await fetch(`/api/users?user_id=${sharingInfo.user_id}`);
                            if (!userResponse.ok) {
                                throw new Error(`Failed to fetch user with ID: ${sharingInfo.user_id}`);
                            }
                            const userData = await userResponse.json();
                            return { ...sharingInfoData, user_name: userData.name };
                        })
                    );
                    setSharingInfo(sharingInfoWithUserName);
                } else {
                    setError('Failed to fetch sharing info');
                }
            } catch (err) {
                setError(`Error: ${err.message}`);
            } finally {
                setLoading(false);
            }
        }

        fetchUserId();
        fetchDeviceSharingStatus();
    }, [deviceId]);

    const handleShareDevice = async () => {
        try {
            setError('');
            setMessage('');

            if (!userId.trim()) {
                setError('Telegram ID is required');
                return;
            }

            if (!ownerId) {
                setError('User ID is not available');
                return;
            }

            const userResponse = await fetch(`/api/users?user_id=${userId}`)
            if (!userResponse.ok) {
                setError('Cannot find the user');
                return;
            }

            const user = await userResponse.json();
            const { user_id } = user;
            const shareResponse = await fetch('/api/devices/share', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    device_id: deviceId,
                    owner_id: ownerId,
                    user_id: user_id,
                    access_level: 'control',
                }),
            });
            if (shareResponse.ok) {
                const sharedDevice = await shareResponse.json();
                setMessage('Device shared successfully!');
                setUserId('');
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

    const handleRevokeAccess = async (share_id) => {
        const confirmDelete = window.confirm("Are you sure you want to remove this device?");
        if (!confirmDelete) {
          return; // Exit if the user cancels the action
        }

        try {
            const response = await fetch('/api/devices/revoke', { 
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    share_id: share_id,
                }),
            });
            if (response.ok) {
                setSharingInfo((prev) => prev.filter((info) => info.share_id !== share_id));
            } else {
                setError('Can not revoke the device.');
            }
        } catch (error) {
            setError(`Error: ${error.message}`);
        }
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
                    Enter your partner's user ID. They can find it in the profile page.
                </Typography>
                <TextField
                    label="User ID"
                    variant="outlined"
                    fullWidth
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    sx={{ marginBottom: 2 }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                    <Button variant="contained" color="primary" fullWidth onClick={handleShareDevice} sx={{ marginRight: 1 }}>
                        Share
                    </Button>
                    <Button variant="outlined" color="secondary" fullWidth onClick={handleCancel} sx={{ marginLeft: 1 }}>
                        Cancel
                    </Button>
                </Box>

                <Typography variant="body1" fontWeight="bold" sx={{ marginBottom: 1, marginTop: 5 }}>
                    This Device is currently shared with:
                </Typography>
                <List sx={{ width: '100%' }}>
                    {sharingInfo.length > 0 ? (
                        sharingInfo.map((info) => (
                            <ListItem
                                key={info.share_id}
                                disableGutters
                                sx={{ width: '100%' }}
                            >
                                <StyledPaper
                                    sx={{ width: '100%', padding: 2 }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body1" fontWeight="bold">
                                            {info.user_name}
                                        </Typography>
                                        <Box>
                                            <StyledButton
                                                variant="text"
                                                color="error"
                                                onClick={() => handleRevokeAccess(info.share_id)}
                                            >
                                                Revoke Access
                                            </StyledButton>
                                        </Box>
                                    </Box>
                                </StyledPaper>
                            </ListItem>
                        ))
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 2 }}>
                            No users have access yet.
                        </Typography>
                    )}
                </List>

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
