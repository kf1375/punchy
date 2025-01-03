import React from 'react';
import { Container, Typography, Button } from '@mui/material';

const Help = () => {
  return (
    <Container sx={{ marginTop: 4 }}>
      <Typography variant="h4" gutterBottom>
        Help Page
      </Typography>
      <Typography variant="body1" paragraph>
        This is where you can find assistance with the app. If you have any questions, feel free to contact support.
      </Typography>
      <Button variant="contained" color="secondary">
        Contact Support
      </Button>
    </Container>
  );
};

export default Help;
