import React, { useState } from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Box, 
  Divider,
  ListItemIcon,
  Typography,
  Badge
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Assignment as ResultsIcon,
  Notifications as NotificationsIcon,
  Star as FavoritesIcon,
  RateReview as ReviewsIcon
} from '@mui/icons-material';
import ProfileSettings from './ProfileSettings';

const ProfileSidebar = () => {
  const [open, setOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('profile');

  const toggleDrawer = () => setOpen(!open);

  // Рабочая функция логаута:
  const handleLogout = () => {
    // Удаляем данные авторизации из localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userEmail");
    
    console.log('User logged out');
    
    // Можно сделать редирект на страницу логина или перезагрузку страницы
    // Например, если используете react-router-dom, можно вызвать navigate('/login')
    // Здесь просто перезагрузим страницу:
    window.location.reload();
  };

  const handleSectionSelect = (sectionId) => {
    setActiveSection(sectionId);
  };

  const menuItems = [
    { id: 'profile', text: 'Profile & Settings', icon: <SettingsIcon /> },
    { id: 'test-history', text: 'Test History', icon: <HistoryIcon /> },
    { id: 'my-results', text: 'My Results', icon: <ResultsIcon /> },
    { id: 'notifications', text: 'Notifications', icon: <NotificationsIcon />, badge: 3 },
    { id: 'favourites', text: 'Favourites', icon: <FavoritesIcon /> },
    { id: 'my-reviews', text: 'My Reviews', icon: <ReviewsIcon /> },
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      backgroundColor: '#f1f1f1'
    }}>
      <IconButton
        onClick={toggleDrawer}
        sx={{
          position: 'fixed',
          left: 16,
          top: 16,
          zIndex: 1200,
          backgroundColor: '#f5f5f5',
          '&:hover': { backgroundColor: '#e0e0e0' },
          display: { xs: 'flex', md: 'none' }
        }}
        aria-label="toggle menu"
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        variant={open ? 'permanent' : 'temporary'}
        open={open}
        onClose={toggleDrawer}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: '#f5f5f5',
            borderRight: '1px solid #e0e0e0',
            position: 'relative',
            height: '100%',
          },
        }}
      >
        <List sx={{ py: 1 }}>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.id}
              selected={activeSection === item.id}
              onClick={() => handleSectionSelect(item.id)}
              sx={{
                py: 1.5,
                px: 2,
                my: 0.5,
                borderRadius: 1,
                backgroundColor: activeSection === item.id ? '#e8f5e9' : 'transparent',
                '&:hover': {
                  backgroundColor: activeSection === item.id ? '#e8f5e9' : '#eeeeee'
                },
                '&.Mui-selected': {
                  color: '#2e7d32',
                  '& .MuiListItemIcon-root': {
                    color: '#2e7d32'
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontSize: '0.875rem',
                  fontWeight: activeSection === item.id ? '500' : '400'
                }}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 1 }} />

        <ListItem 
          button 
          onClick={handleLogout}
          sx={{
            py: 1.5,
            px: 2,
            my: 0.5,
            borderRadius: 1,
            '&:hover': {
              backgroundColor: '#ffebee'
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Log Out" 
            primaryTypographyProps={{ fontSize: '0.875rem' }}
          />
        </ListItem>
      </Drawer>

      <Box 
        component="main"
        sx={{ 
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          ml: { xs: 0, md: open ? '240px' : 0 },
          transition: 'margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box 
          sx={{ 
            width: '100%',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            height: '100%'
          }}
        >
          <Box 
            sx={{ 
              flex: '1 1 auto',
              backgroundColor: 'white',
              borderRadius: 3,
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
              p: 4,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {activeSection === 'profile' ? (
              <ProfileSettings />
            ) : (
              <Typography variant="h6" color="textSecondary">
                {menuItems.find(item => item.id === activeSection)?.text 
                  ? `${menuItems.find(item => item.id === activeSection).text} section content will be loaded here`
                  : 'Section not found'}
              </Typography>
            )}
          </Box>
          
          {activeSection === 'profile' && (
            <Box 
              sx={{ 
                width: { xs: '100%', md: '280px' },
                backgroundColor: 'white',
                borderRadius: 3,
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
                p: 3,
                height: 'fit-content'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                Notification Settings
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                  Language Selection
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileSidebar;
