import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';

const Profile = () => {
  return (
    <Container sx={{ marginTop: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profile Page
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="body1" gutterBottom>
          Welcome to your profile!
        </Typography>
        <Button variant="contained" color="primary" sx={{ marginTop: 2 }}>
          Edit Profile
        </Button>
      </Box>
    </Container>
  );
};

export default Profile;
