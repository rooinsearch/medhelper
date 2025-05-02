import React, { useState, useEffect, useCallback } from "react";
import {
  Box, TextField, Typography, Button, Grid, FormControl,
  Select, MenuItem, InputLabel, Tabs, Tab, Dialog, DialogActions,
  DialogContent, DialogTitle, List, ListItem, ListItemText, Divider,
  IconButton, Card, CircularProgress, Snackbar, Alert
} from "@mui/material";
import {
  Edit, Save, Lock, CreditCard, Add, Delete, Lock as LockIcon
} from "@mui/icons-material";
import axios from "axios";

// Django API configuration
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem('access_token')}` // Для JWT аутентификации
  },
  withCredentials: true // Для сессий и CSRF
});

const ProfileSettings = () => {
  // User states
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    birth_date: "",
    phone: "",
    email: ""
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Password states
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
    verification_code: ""
  });
  const [verificationSent, setVerificationSent] = useState(false);

  // Payment states
  const [activeTab, setActiveTab] = useState(0);
  const [cards, setCards] = useState([]);
  const [cardDialog, setCardDialog] = useState(false);
  const [newCard, setNewCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvc: "",
    type: ""
  });

  // Notification state
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  // Helper functions
  const showAlert = (message, severity = "info") => {
    setAlert({ open: true, message, severity });
  };

  const detectCardType = (number) => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'VISA';
    if (/^5[1-5]/.test(cleaned)) return 'MASTERCARD';
    return 'CARD';
  };

  const formatCardNumber = (number) => {
    return number.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  // API: Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.post("/profile/", {});
      setProfile(response.data);
    } catch (error) {
      showAlert(error.response?.data?.detail || "Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // API: Fetch payment cards
  const fetchCards = useCallback(async () => {
    try {
      const response = await api.post("/payment-cards/", {});
      setCards(response.data);
    } catch (error) {
      showAlert("Failed to load payment methods", "error");
    }
  }, []);

  // API: Update profile
  const updateProfile = useCallback(async () => {
    try {
      await api.post("/profile/update/", profile);
      showAlert("Profile updated successfully", "success");
      setEditMode(false);
    } catch (error) {
      showAlert(error.response?.data?.detail || "Update failed", "error");
    }
  }, [profile]);

  // API: Change password
  const changePassword = async () => {
    try {
      if (passwordData.new_password !== passwordData.confirm_password) {
        showAlert("Passwords don't match", "error");
        return;
      }

      await api.post("/password/change/", passwordData);
      showAlert("Password changed successfully", "success");
      setPasswordDialog(false);
    } catch (error) {
      showAlert(error.response?.data?.detail || "Password change failed", "error");
    }
  };

  // API: Add payment card
  const addCard = async () => {
    try {
      const response = await api.post("/payment-cards/add/", {
        number: newCard.number.replace(/\s/g, ''),
        name: newCard.name,
        expiry: newCard.expiry,
        cvc: newCard.cvc
      });
      setCards([...cards, response.data]);
      setCardDialog(false);
      showAlert("Card added successfully", "success");
    } catch (error) {
      showAlert(error.response?.data?.detail || "Failed to add card", "error");
    }
  };

  // API: Delete payment card
  const deleteCard = async (cardId) => {
    try {
      await api.post("/payment-cards/delete/", { card_id: cardId });
      setCards(cards.filter(card => card.id !== cardId));
      showAlert("Card removed", "success");
    } catch (error) {
      showAlert("Failed to delete card", "error");
    }
  };

  // Initial data load
  useEffect(() => {
    fetchProfile();
    fetchCards();
  }, [fetchProfile, fetchCards]);

  // Handlers
  const handleProfileChange = (field) => (e) => {
    setProfile({ ...profile, [field]: e.target.value });
  };

  const handlePasswordChange = (field) => (e) => {
    setPasswordData({ ...passwordData, [field]: e.target.value });
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "number") {
      setNewCard({
        ...newCard,
        number: formatCardNumber(value),
        type: detectCardType(value)
      });
      return;
    }
    
    if (name === "expiry") {
      const digits = value.replace(/\D/g, '');
      const formatted = digits.length > 2 
        ? `${digits.slice(0,2)}/${digits.slice(2,4)}` 
        : digits;
      setNewCard({ ...newCard, expiry: formatted });
      return;
    }
    
    setNewCard({ ...newCard, [name]: value });
  };

  const handleSendVerification = () => {
    // In real app: api.post("/send-verification/", { phone: profile.phone })
    setVerificationSent(true);
    showAlert("Verification code sent", "info");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header and Edit/Save buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Profile Settings
        </Typography>
        {editMode ? (
          <Box>
            <Button onClick={() => setEditMode(false)} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={updateProfile}
              startIcon={<Save />}
            >
              Save
            </Button>
          </Box>
        ) : (
          <Button 
            variant="outlined" 
            onClick={() => setEditMode(true)}
            startIcon={<Edit />}
          >
            Edit
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Account" icon={<Lock />} />
        <Tab label="Payment" icon={<CreditCard />} />
      </Tabs>

      {/* Account Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="First Name"
              value={profile.first_name}
              onChange={handleProfileChange("first_name")}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={profile.last_name}
              onChange={handleProfileChange("last_name")}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={!editMode}>
              <InputLabel>Gender</InputLabel>
              <Select
                value={profile.gender}
                label="Gender"
                onChange={handleProfileChange("gender")}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              value={profile.birth_date}
              onChange={handleProfileChange("birth_date")}
              InputLabelProps={{ shrink: true }}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              value={profile.phone}
              onChange={handleProfileChange("phone")}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              value={profile.email}
              disabled
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              onClick={() => setPasswordDialog(true)}
              disabled={!editMode}
            >
              Change Password
            </Button>
          </Grid>
        </Grid>
      )}

      {/* Payment Tab */}
      {activeTab === 1 && (
        <Box>
          <List>
            {cards.map((card) => (
              <Card key={card.id} sx={{ mb: 2 }}>
                <ListItem
                  secondaryAction={
                    <IconButton 
                      onClick={() => deleteCard(card.id)}
                      disabled={!editMode}
                    >
                      <Delete />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={`${card.type} •••• ${card.last_four}`}
                    secondary={`Expires ${card.expiry_date}`}
                  />
                </ListItem>
              </Card>
            ))}
          </List>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setCardDialog(true)}
            disabled={!editMode}
          >
            Add Payment Method
          </Button>
        </Box>
      )}

      {/* Password Change Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Current Password"
            type="password"
            value={passwordData.current_password}
            onChange={handlePasswordChange("current_password")}
          />
          <TextField
            fullWidth
            margin="normal"
            label="New Password"
            type="password"
            value={passwordData.new_password}
            onChange={handlePasswordChange("new_password")}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Confirm Password"
            type="password"
            value={passwordData.confirm_password}
            onChange={handlePasswordChange("confirm_password")}
          />
          {verificationSent && (
            <TextField
              fullWidth
              margin="normal"
              label="Verification Code"
              value={passwordData.verification_code}
              onChange={handlePasswordChange("verification_code")}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          {!verificationSent ? (
            <Button onClick={handleSendVerification}>
              Send Verification Code
            </Button>
          ) : (
            <Button onClick={changePassword} variant="contained">
              Confirm Change
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Add Card Dialog */}
      <Dialog open={cardDialog} onClose={() => setCardDialog(false)}>
        <DialogTitle>Add Payment Card</DialogTitle>
        <DialogContent>
          <Card sx={{ p: 2, mb: 3, bgcolor: "#f5f5f5" }}>
            <Typography variant="h6" sx={{ fontFamily: "monospace" }}>
              {newCard.number || "•••• •••• •••• ••••"}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
              <Box>
                <Typography variant="caption">Card Holder</Typography>
                <Typography>{newCard.name || "•••• ••••"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption">Expires</Typography>
                <Typography>{newCard.expiry || "••/••"}</Typography>
              </Box>
            </Box>
          </Card>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                name="number"
                value={newCard.number}
                onChange={handleCardChange}
                inputProps={{ maxLength: 19 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name on Card"
                name="name"
                value={newCard.name}
                onChange={handleCardChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Expiry (MM/YY)"
                placeholder="MM/YY"
                name="expiry"
                value={newCard.expiry}
                onChange={handleCardChange}
                inputProps={{ maxLength: 5 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="CVV"
                type="password"
                placeholder="123"
                name="cvc"
                value={newCard.cvc}
                onChange={handleCardChange}
                inputProps={{ maxLength: 3 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCardDialog(false)}>Cancel</Button>
          <Button 
            onClick={addCard}
            variant="contained"
            disabled={!newCard.number || !newCard.name || !newCard.expiry || !newCard.cvc}
          >
            Save Card
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert
          severity={alert.severity}
          onClose={() => setAlert({ ...alert, open: false })}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfileSettings;