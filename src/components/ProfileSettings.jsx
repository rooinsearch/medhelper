import React, { useState, useEffect } from "react";
import {
  Box, TextField, Typography, Button, Grid, FormControl,
  Select, MenuItem, InputLabel, Tabs, Tab, Dialog, DialogActions,
  DialogContent, DialogTitle, List, ListItem, ListItemText, Divider,
  IconButton, Card
} from "@mui/material";
import {
  Edit, Save, Lock, CreditCard, Add, Delete, Lock as LockIcon
} from "@mui/icons-material";

const ProfileSettings = () => {
  // User profile state
  const [userData, setUserData] = useState({
    name: "",
    surname: "",
    gender: "",
    birthDate: "",
    phone: "+7 747 591 0535",
    email: "user@example.com"
  });
  const [originalData, setOriginalData] = useState({});
  const [editMode, setEditMode] = useState(false);

  // Other states
  const [activeTab, setActiveTab] = useState(0);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [cards, setCards] = useState([
    { id: 1, type: "VISA", last4: "4242", exp: "04/2025" },
    { id: 2, type: "MASTERCARD", last4: "5555", exp: "12/2024" }
  ]);
  const [newCard, setNewCard] = useState({
    number: "", name: "", expiry: "", cvc: "", type: ""
  });

  // Load user data
  useEffect(() => {
    // Simulate API call to fetch user data
    const mockUserData = {
      name: "John",
      surname: "Doe",
      gender: "male",
      birthDate: "15.05.1990",
      phone: "+7 747 591 0535",
      email: "john.doe@example.com"
    };
    
    setUserData(mockUserData);
    setOriginalData(mockUserData);
  }, []);

  // Helper functions
  const detectCardType = (number) => {
    const cleanedNumber = number.replace(/\s/g, '');
    if (/^4/.test(cleanedNumber)) return 'VISA';
    if (/^5[1-5]/.test(cleanedNumber)) return 'MASTERCARD';
    return '';
  };

  const formatCardNumber = (number) => {
    return number.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  // Handlers
  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };

  const handleProfileChange = (field) => (e) => {
    setUserData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSaveProfile = () => {
    console.log("Saving:", userData);
    setOriginalData(userData);
    setEditMode(false);
    alert("Profile updated successfully!");
  };

  const handleCancelEdit = () => {
    setUserData(originalData);
    setEditMode(false);
  };

  const handleCardInputChange = ({ target: { name, value } }) => {
    if (name === "number") {
      setNewCard(prev => ({ 
        ...prev, 
        [name]: formatCardNumber(value), 
        type: detectCardType(value) 
      }));
      return;
    }
    if (name === "expiry") {
      const digits = value.replace(/\D/g, '');
      const formatted = digits.length > 2 
        ? `${digits.slice(0,2)}/${digits.slice(2,4)}` 
        : digits;
      setNewCard(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    setNewCard(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveCard = () => {
    if (!newCard.number || !newCard.expiry || !newCard.cvc) return;
    
    setCards(prev => [...prev, {
      id: Date.now(),
      type: newCard.type || "CREDIT CARD",
      last4: newCard.number.replace(/\s/g, '').slice(-4),
      exp: newCard.expiry
    }]);
    setPaymentDialog(false);
    setNewCard({ number: "", name: "", expiry: "", cvc: "", type: "" });
  };

  // Tab components
  const renderAccountTab = () => (
    <Grid container spacing={2} sx={{ marginTop: '15px' }}>
      <Grid item xs={12} sm={6}>
        <TextField 
          fullWidth 
          label="Name" 
          value={userData.name}
          onChange={handleProfileChange('name')}
          variant="outlined" 
          disabled={!editMode} 
          size="small" 
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField 
          fullWidth 
          label="Surname" 
          value={userData.surname}
          onChange={handleProfileChange('surname')}
          variant="outlined" 
          disabled={!editMode} 
          size="small" 
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth size="small">
          <InputLabel>Gender</InputLabel>
          <Select 
            value={userData.gender} 
            label="Gender" 
            onChange={handleProfileChange('gender')}
            disabled={!editMode}
          >
            {['male', 'female', 'other'].map(g => (
              <MenuItem value={g} key={g}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField 
          fullWidth 
          label="Date of Birth" 
          value={userData.birthDate}
          onChange={handleProfileChange('birthDate')}
          variant="outlined" 
          placeholder="DD.MM.YYYY" 
          disabled={!editMode} 
          size="small" 
        />
      </Grid>
      <Grid item xs={12} sx={{ height: '20px' }} />
      <Grid item xs={12} sm={6}>
        <TextField 
          fullWidth 
          label="Phone Number" 
          value={userData.phone}
          onChange={handleProfileChange('phone')}
          variant="outlined" 
          disabled={!editMode} 
          size="small" 
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField 
          fullWidth 
          label="Email" 
          type="email" 
          value={userData.email}
          onChange={handleProfileChange('email')}
          variant="outlined" 
          disabled={!editMode} 
          size="small" 
        />
      </Grid>
      <Grid item xs={12}>
        <Button 
          variant="outlined" 
          onClick={() => setPasswordDialog(true)} 
          disabled={!editMode}
          sx={{ 
            borderRadius: 1, 
            color: "green", 
            borderColor: "green", 
            '&:hover': { 
              borderColor: "darkgreen", 
              color: "darkgreen" 
            }
          }}
        >
          Change Password
        </Button>
      </Grid>
    </Grid>
  );

  const renderPaymentTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 'medium' }}>
        Saved Payment Methods
      </Typography>
      {cards.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No saved payment methods
        </Typography>
      ) : (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {cards.map(card => (
            <React.Fragment key={card.id}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={`${card.type} •••• ${card.last4}`}
                  secondary={`Expires ${card.exp}`}
                />
                <IconButton 
                  edge="end" 
                  onClick={() => setCards(prev => prev.filter(c => c.id !== card.id))} 
                  disabled={!editMode}
                >
                  <Delete color={editMode ? "error" : "disabled"} />
                </IconButton>
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
      <Button 
        variant="outlined" 
        startIcon={<Add />} 
        onClick={() => setPaymentDialog(true)} 
        disabled={!editMode} 
        sx={{ 
          mt: 2, 
          borderRadius: 1, 
          color: editMode ? "green" : "gray", 
          borderColor: editMode ? "green" : "gray", 
          '&:hover': { 
            borderColor: editMode ? "darkgreen" : "gray", 
            color: editMode ? "darkgreen" : "gray" 
          }
        }}
      >
        Add New Payment Method
      </Button>
    </Box>
  );

  return (
    <Box sx={{ p: 2, backgroundColor: "#fff", maxWidth: "100%", pt: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', m: 0 }}>
          Profile Settings
        </Typography>
        {editMode ? (
          <Box>
            <Button
              variant="outlined"
              onClick={handleCancelEdit}
              sx={{ 
                mr: 2,
                borderRadius: 1,
                color: "gray",
                borderColor: "gray",
                '&:hover': { borderColor: "darkgray", color: "darkgray" }
              }}
            >
              Cancel
            </Button>
            <Button
              startIcon={<Save />}
              variant="contained"
              onClick={handleSaveProfile}
              sx={{ 
                borderRadius: 1, 
                bgcolor: "green", 
                '&:hover': { bgcolor: "darkgreen" }
              }}
            >
              Save
            </Button>
          </Box>
        ) : (
          <Button
            startIcon={<Edit />}
            variant="outlined"
            onClick={() => setEditMode(true)}
            sx={{ 
              borderRadius: 1, 
              color: "green", 
              borderColor: "green", 
              '&:hover': { borderColor: "darkgreen", color: "darkgreen" }
            }}
          >
            Edit
          </Button>
        )}
      </Box>

      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        sx={{ 
          mb: 1,
          '& .MuiTab-root.Mui-selected': { color: 'green' }, 
          '& .MuiTabs-indicator': { backgroundColor: 'green' },
          '& .MuiTab-root': { fontSize: '0.75rem', minWidth: 'unset', padding: '6px 12px' }
        }}
      >
        {[
          { icon: <Lock fontSize="small" />, label: "Account" },
          { icon: <CreditCard fontSize="small" />, label: "Payment" }
        ].map((tab, index) => (
          <Tab key={index} icon={tab.icon} label={tab.label} />
        ))}
      </Tabs>

      {activeTab === 0 ? renderAccountTab() : renderPaymentTab()}

      {/* Password Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {['Current', 'New', 'Confirm New'].map((label, i) => (
            <TextField 
              key={label} 
              autoFocus={i === 0} 
              margin="dense" 
              fullWidth 
              size="small"
              label={`${label} Password`} 
              type="password" 
              variant="outlined" 
              sx={{ mb: 2 }} 
            />
          ))}
          {verificationSent ? (
            <TextField 
              margin="dense" 
              fullWidth 
              size="small" 
              variant="outlined"
              label="Verification Code" 
              placeholder="Enter code sent to your phone" 
              sx={{ mb: 1 }} 
            />
          ) : (
            <Button 
              variant="outlined" 
              onClick={() => setVerificationSent(true)}
              sx={{ 
                borderRadius: 1, 
                color: "green", 
                borderColor: "green", 
                '&:hover': { 
                  borderColor: "darkgreen", 
                  color: "darkgreen" 
                }
              }}
            >
              Send Verification Code
            </Button>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)} sx={{ color: "gray" }}>
            Cancel
          </Button>
          <Button 
            onClick={() => setPasswordDialog(false)} 
            disabled={!verificationSent}
            variant="contained" 
            sx={{ 
              borderRadius: 1, 
              bgcolor: "green", 
              '&:hover': { bgcolor: "darkgreen" } 
            }}
          >
            Confirm Change
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
          Add Payment Card
        </DialogTitle>
        <DialogContent>
          <Card sx={{ 
            mb: 3, 
            borderRadius: '12px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
            backgroundColor: '#f5f5f5', 
            p: 3, 
            position: 'relative' 
          }}>
            {newCard.type && (
              <Box sx={{ 
                position: 'absolute', 
                top: 16, 
                right: 16, 
                backgroundColor: 'white', 
                borderRadius: '4px', 
                px: 1, 
                py: 0.5 
              }}>
                <Typography variant="caption" fontWeight="bold">
                  {newCard.type}
                </Typography>
              </Box>
            )}
            <Typography 
              variant="h6" 
              sx={{ 
                letterSpacing: '1px', 
                mb: 3, 
                fontFamily: 'monospace', 
                fontSize: '1.1rem', 
                color: 'text.primary', 
                pt: 1 
              }}
            >
              {newCard.number ? formatCardNumber(newCard.number) : '•••• •••• •••• ••••'}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              {['Card Holder', 'Expires'].map((label, i) => (
                <Box key={label}>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                    {label}
                  </Typography>
                  <Typography variant="body2" sx={i === 0 ? { textTransform: 'uppercase' } : {}}>
                    {i === 0 ? (newCard.name || '•••• ••••') : (newCard.expiry || '••/••')}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>

          <Grid container spacing={2}>
            {[
              { name: 'number', label: 'Card number', placeholder: '1234 5678 9012 3456', maxLength: 19 },
              { name: 'name', label: 'Name on card' },
              { name: 'expiry', label: 'Expiration date (MM/YY)', placeholder: 'MM/YY', maxLength: 5 },
              { name: 'cvc', label: 'CVV', placeholder: '123', type: 'password', maxLength: 3 }
            ].map((field, i) => (
              <Grid item xs={field.name === 'expiry' || field.name === 'cvc' ? 6 : 12} key={field.name}>
                <TextField 
                  fullWidth 
                  variant="outlined" 
                  size="small" 
                  {...field} 
                  value={newCard[field.name]} 
                  onChange={handleCardInputChange} 
                />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <LockIcon sx={{ fontSize: 16, color: 'green', mr: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Your payment information is encrypted and secure
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPaymentDialog(false)} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveCard} 
            variant="contained"
            disabled={!newCard.number || !newCard.name || !newCard.expiry || !newCard.cvc}
          >
            Save Card
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileSettings;