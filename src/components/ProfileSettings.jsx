import React, { useState } from 'react';
import {
  Box,
  TextField,
  Switch,
  MenuItem,
  Select,
  Avatar,
  FormControl,
  InputLabel,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  InputAdornment,
  IconButton,
  Grid
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const SectionHeader = ({ title, onEdit, isEditing }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
    <Typography variant="h6" fontWeight="bold">{title}</Typography>
    <IconButton onClick={onEdit}>
      {isEditing ? <CancelIcon color="error" /> : <EditIcon color="primary" />}
    </IconButton>
  </Box>
);

const ProfileSettings = () => {
  const [editMode, setEditMode] = useState({
    personal: false,
    security: false,
    notifications: false
  });

  const [formData, setFormData] = useState({
    name: 'John',
    surname: 'Doe',
    email: 'john.doe@example.com',
    phone: '+7 777 777 77 77',
    password: 'Password123!',
    notifications: true,
    language: 'english'
  });

  const toggleEdit = (section) => {
    setEditMode(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Box>
      {/* Personal Info Section */}
      <Box sx={{ mb: 4 }}>
        <SectionHeader 
          title="Personal Information" 
          onEdit={() => toggleEdit('personal')} 
          isEditing={editMode.personal}
        />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Avatar sx={{ 
              width: 120, 
              height: 120, 
              fontSize: '2.5rem',
              bgcolor: 'primary.main'
            }}>
              {formData.name.charAt(0)}{formData.surname.charAt(0)}
            </Avatar>
          </Grid>
          
          <Grid item xs={12} md={9}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editMode.personal}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Surname"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editMode.personal}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editMode.personal}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editMode.personal}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* Security Section */}
      <Box sx={{ mb: 4 }}>
        <SectionHeader 
          title="Security" 
          onEdit={() => toggleEdit('security')} 
          isEditing={editMode.security}
        />
        
        <TextField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          fullWidth
          disabled={!editMode.security}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end">
                  <VisibilityOff />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Notifications Section */}
      <Box>
        <SectionHeader 
          title="Notifications" 
          onEdit={() => toggleEdit('notifications')} 
          isEditing={editMode.notifications}
        />
        
        <List>
          <ListItem>
            <ListItemText primary="Email Notifications" />
            <Switch
              checked={formData.notifications}
              onChange={() => setFormData(prev => ({ ...prev, notifications: !prev.notifications }))}
              disabled={!editMode.notifications}
            />
          </ListItem>
          <ListItem>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={formData.language}
                onChange={handleChange}
                label="Language"
                name="language"
                disabled={!editMode.notifications}
              >
                <MenuItem value="english">English</MenuItem>
                <MenuItem value="russian">Russian</MenuItem>
                <MenuItem value="kazakh">Kazakh</MenuItem>
              </Select>
            </FormControl>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default ProfileSettings;