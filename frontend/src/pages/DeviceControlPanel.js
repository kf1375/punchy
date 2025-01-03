import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Button } from '@mui/material';

const DeviceControlPanel = () => {
    const { serialNumber } = useParams();
    const [device, setDevice] = useState(null);
    const [error, setError] = useState('');

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
            <Typography variant="h6">Device Name: {device.name}</Typography>
            <Typography variant="body1">Device ID: {device.device_id}</Typography>
            <Typography variant="body1">Device Serial Number: {device.serial_number}</Typography>
            {/* Add more device-specific controls or information here */}

            <Button variant="outlined" color="secondary" onClick={handleClose}>
                Close
            </Button>
        </Container>

    );
};

export default DeviceControlPanel;
