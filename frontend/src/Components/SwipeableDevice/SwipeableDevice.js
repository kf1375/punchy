import React, { useState } from 'react';
import { ListItem, Box, Typography, Paper, Button } from '@mui/material';
import { styled } from '@mui/system';
import { useSwipeable } from 'react-swipeable';

// Custom Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  backgroundColor: theme.palette.background.default,
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.3s ease-in-out',
}));

const SwipeWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.error.main,
  color: theme.palette.common.white,
  borderRadius: theme.shape.borderRadius,
  paddingLeft: theme.spacing(2),
  minHeight: '64px',
  width: '100%',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'capitalize',
  fontWeight: 'bold',
}));

const SwipeableDevice = ({ device, onDelete, onView }) => {
  const [translateX, setTranslateX] = useState(0);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setTranslateX(-100); // Animate to the left when swiped
      setTimeout(() => onDelete(device.serial_number), 300); // Trigger delete after animation
    },
    onSwipedRight: () => {
      setTranslateX(0); // Reset position if swiped back
    },
    trackMouse: true,
  });

  return (
    <ListItem disableGutters {...handlers}>
      <SwipeWrapper>
        <StyledPaper
          sx={{
            transform: `translateX(${translateX}px)`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" fontWeight="bold">
              {device.name}
            </Typography>
            <StyledButton variant="text" color="primary" onClick={() => onView(device.serial_number)}>
              View
            </StyledButton>
          </Box>
        </StyledPaper>
      </SwipeWrapper>
    </ListItem>
  );
};

export default SwipeableDevice;
