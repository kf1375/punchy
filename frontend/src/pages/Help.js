import React from 'react';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help'; // Optional: Adds a helpful icon

const Help = () => {
  return (
    <Container maxWidth="sm" sx={{ marginTop: 4 }}>
      <Paper elevation={3} sx={{ padding: 3, borderRadius: 2, textAlign: 'center' }}>
        <Box mb={3}>
          <HelpIcon fontSize="large" color="primary" />
        </Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Need Assistance?
        </Typography>
        <Typography variant="body1" color="textSecondary" >
          We're here to help! If you're having trouble using the app or have any questions, feel free to reach out to us. We're happy to assist you.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{
            marginTop: 2,
            borderRadius: 2,
            '&:hover': {
              backgroundColor: 'primary.dark', // Custom hover color
            },
          }}
        >
          Contact Support
        </Button>
      </Paper>
    </Container>
  );
};

export default Help;
