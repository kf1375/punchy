import React from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import PersonIcon from '@mui/icons-material/Person';
import HelpIcon from '@mui/icons-material/Help';
import { useNavigate } from 'react-router-dom';
import './BottomNavBar.css';

const BottomNavBar = ({ activeTab, onChange }) => {
  const navigate = useNavigate();

  const handleNavChange = (event, newValue) => {
    onChange(newValue);
    const routes = ['/devices', '/', '/help'];
    navigate(routes[newValue]);
  };

  return (
    <BottomNavigation 
      value={activeTab}
      onChange={handleNavChange}
      className="bottom-nav-bar"
      showLabels
    >
      <BottomNavigationAction label="Devices" icon={<DevicesIcon />} />
      <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
      <BottomNavigationAction label="Help" icon={<HelpIcon />} />
    </BottomNavigation>
  );
};

export default BottomNavBar;
