import React from 'react';
import { useSwipeable } from 'react-swipeable';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import './SwipeablePage.css';

const SwipeablePage = ({ children, leftTarget, rightTarget, onSwipe }) => {
  const navigate = useNavigate();

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      navigate(leftTarget);
      onSwipe('left');
    },
    onSwipedRight: () => {
      navigate(rightTarget);
      onSwipe('right');
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true, // Enables swipe with mouse for testing
  });

  return (
    <Box
      {...handlers}
      className="swipeable-page"
      sx={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </Box>
  );
};

export default SwipeablePage;
