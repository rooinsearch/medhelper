import React, { useState } from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Box, 
  Toolbar,
  Divider,
  ListItemIcon,
  AppBar,
  Typography,
  Avatar
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Logout as LogoutIcon,
  Person as ProfileIcon,
  History as HistoryIcon,
  Assignment as ResultsIcon,
  Notifications as NotificationsIcon,
  Star as FavoritesIcon,
  RateReview as ReviewsIcon
} from '@mui/icons-material';

const ProfileSidebar = ({ activeSection, onSelectSection }) => {
  const [open, setOpen] = useState(true);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const menuItems = [
    { id: 'ProfileSettings', text: 'Profile & Settings', icon: <ProfileIcon /> },
    { id: 'TestHistory', text: 'Test History', icon: <HistoryIcon /> },
    { id: 'MyResults', text: 'My Results', icon: <ResultsIcon /> },
    { id: 'Notifications', text: 'Notifications', icon: <NotificationsIcon />, badge: 3 },
    { id: 'Favourites', text: 'Favourites', icon: <FavoritesIcon /> },
    { id: 'MyReviews', text: 'My Reviews', icon: <ReviewsIcon /> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Белый хедер */}
      <AppBar 
        position="static"
        sx={{ 
          backgroundColor: 'white', 
          color: 'black',
          boxShadow: 'none',
          borderBottom: '1px solid #e0e0e0',
          height: '64px'
        }}
      >
        <Toolbar>
          <IconButton 
            edge="start" 
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {activeSection}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Основное содержимое с сайдбаром и контентом */}
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* Сайдбар - начинается сразу под хедером */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={open}
          sx={{
            width: open ? 240 : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
              backgroundColor: '#f5f5f5',
              borderRight: 'none',
              boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
              height: 'calc(100vh - 64px)', // Высота минус хедер
              overflowY: 'auto',
              top: '64px' // Начинается сразу под хедером
            },
          }}
        >
          <List sx={{ pt: 0 }}>
            {/* Секция профиля */}
            <Typography variant="subtitle1" sx={{ px: 3, pt: 2, fontWeight: 'bold' }}>
              Profile & Settings
            </Typography>
            {menuItems.map((item) => (
              <ListItem 
                button 
                key={item.id}
                selected={activeSection === item.id}
                onClick={() => onSelectSection(item.id)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                    '& .MuiListItemIcon-root': {
                      color: '#2e7d32'
                    }
                  },
                  '&:hover': {
                    backgroundColor: '#e8f5e9'
                  },
                  py: 1,
                  px: 3
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
                {item.badge && (
                  <Box sx={{
                    backgroundColor: '#ff3d00',
                    color: 'white',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem'
                  }}>
                    {item.badge}
                  </Box>
                )}
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 1 }} />

          {/* Выход и информация о пользователе */}
          <List>
            <ListItem 
              button 
              sx={{
                py: 1,
                px: 3,
                color: '#d32f2f',
                '&:hover': {
                  backgroundColor: '#ffebee'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Log Out" />
            </ListItem>
            <ListItem sx={{ py: 1, px: 3 }}>
              <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: '#2e7d32' }}>SC</Avatar>
              <ListItemText 
                primary="S'C" 
                secondary="Cloudy"
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
            </ListItem>
          </List>
        </Drawer>

        {/* Основной контент */}
        <Box 
          component="main"
          sx={{ 
            flexGrow: 1,
            p: 3,
            ml: open ? '240px' : 0,
            backgroundColor: '#f9f9f9',
            height: 'calc(100vh - 64px)',
            overflow: 'auto'
          }}
        >
          {/* Контент будет здесь */}
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileSidebar;