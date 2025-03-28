import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Switch,
  MenuItem,
  Select,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Button
} from '@mui/material';
import {
  Edit as EditIcon,
  Logout as LogoutIcon,
  CreditCard as CreditCardIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';

const ProfileSettings = () => {
  const [formData, setFormData] = useState({
    name: 'John',
    surname: 'Doe',
    gender: 'Male',
    dob: '',
    phone: '+7 777 777 77 77',
    email: 'email@example.com',
    password: '******',
    language: 'English'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    testReminders: false,
    resultAlerts: true
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleNotificationToggle = (name) => {
    setNotificationSettings(prevState => ({ ...prevState, [name]: !prevState[name] }));
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f4f4', p: 2 }}>
      {/* Sidebar */}
      <Box sx={{ width: 250, bgcolor: '#2e7d32', color: 'white', p: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Profile & Settings</Typography>
        <Typography sx={{ mb: 2 }}>Test History</Typography>
        <Typography sx={{ mb: 2 }}>My Results</Typography>
        <Typography sx={{ mb: 2 }}>Notifications (3)</Typography>
        <Typography sx={{ mb: 2 }}>Favourites</Typography>
        <Typography sx={{ mb: 2 }}>My Reviews</Typography>
        <Typography sx={{ color: 'red', cursor: 'pointer' }}>Log Out</Typography>
      </Box>

      {/* Profile Section */}
      <Box sx={{ flex: 1, p: 3 }}>
        <Box sx={{ backgroundColor: 'white', p: 3, borderRadius: 2, boxShadow: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ width: 100, height: 100, mr: 3 }} src="/path/to/profile/image" alt="Profile" />
            <Box>
              <TextField label="Name" name="name" value={formData.name} onChange={handleInputChange} size="small" sx={{ mr: 2 }} />
              <TextField label="Surname" name="surname" value={formData.surname} onChange={handleInputChange} size="small" />
              <TextField label="Gender" name="gender" value={formData.gender} onChange={handleInputChange} size="small" sx={{ mt: 2 }} />
            </Box>
          </Box>
          <TextField label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} fullWidth size="small" sx={{ mb: 2 }} />
          <TextField label="Email" name="email" value={formData.email} onChange={handleInputChange} fullWidth size="small" sx={{ mb: 2 }} />
          <TextField label="Password" name="password" value={formData.password} type="password" fullWidth size="small" sx={{ mb: 2 }} />
        </Box>

        {/* Payment Methods */}
        <Box sx={{ backgroundColor: 'white', p: 3, borderRadius: 2, boxShadow: 2, mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Saved Payment Methods</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CreditCardIcon sx={{ mr: 2 }} />
            <TextField label="Card Holder Name" fullWidth size="small" />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField label="Card Number" fullWidth size="small" />
            <TextField label="Expiry Date" fullWidth size="small" placeholder="MM/YY" />
            <TextField label="CVV" fullWidth size="small" />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WalletIcon sx={{ mr: 2 }} />
            <Typography>PayPal</Typography>
          </Box>
        </Box>

        {/* Notifications & Settings */}
        <Box sx={{ backgroundColor: 'white', p: 3, borderRadius: 2, boxShadow: 2, mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Notification Settings</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography>Test Reminders</Typography>
            <Switch checked={notificationSettings.testReminders} onChange={() => handleNotificationToggle('testReminders')} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography>Result Alerts</Typography>
            <Switch checked={notificationSettings.resultAlerts} onChange={() => handleNotificationToggle('resultAlerts')} />
          </Box>
          <FormControl fullWidth size="small">
            <InputLabel>Language Selection</InputLabel>
            <Select name="language" value={formData.language} onChange={handleInputChange}>
              <MenuItem value="English">English</MenuItem>
              <MenuItem value="Russian">Русский</MenuItem>
              <MenuItem value="Kazakh">Қазақша</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Logout Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button startIcon={<LogoutIcon />} color="error" variant="text">
            Logout
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileSettings;
