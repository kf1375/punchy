import React from 'react';
import { Container, Typography, List, ListItem, ListItemText, Button } from '@mui/material';

const Devices = () => {
  return (
    <Container sx={{ marginTop: 4 }}>
      <Typography variant="h4" gutterBottom>
        Devices Page
      </Typography>
      <List>
        <ListItem button>
          <ListItemText primary="Device 1" />
        </ListItem>
        <ListItem button>
          <ListItemText primary="Device 2" />
        </ListItem>
        <ListItem button>
          <ListItemText primary="Device 3" />
        </ListItem>
      </List>
      <Button variant="contained" color="primary" sx={{ marginTop: 2 }}>
        Add Device
      </Button>
    </Container>
  );
};

export default Devices;
