import React, { useState, useEffect, useCallback } from "react";
import {
  Box, TextField, Typography, Button, Grid, FormControl,
  Select, MenuItem, InputLabel, Dialog, DialogActions,
  DialogContent, DialogTitle, CircularProgress, Snackbar, Alert
} from "@mui/material";
import { Edit, Save, Lock } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const primaryColor = '#001A00';
const secondaryColor = '#4a8c4a';


const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true
});

const ProfileSettings = () => {
  const navigate = useNavigate();
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
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
    verification_code: ""
  });
  const [verificationSent, setVerificationSent] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "info"
  });


  api.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

 
  api.interceptors.response.use(
    response => response,
    async error => {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        navigate('/login');
      }
      return Promise.reject(error);
    }
  );

  const showAlert = (message, severity = "info") => {
    setAlert({ open: true, message, severity });
  };

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/profile/");
      setProfile(response.data);
    } catch (error) {
      if (error.response?.status !== 401) {
        showAlert(error.response?.data?.detail || "Failed to load profile", "error");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async () => {
    try {
      await api.put("/profile/update/", profile);
      showAlert("Profile updated successfully", "success");
      setEditMode(false);
    } catch (error) {
      showAlert(error.response?.data?.detail || "Update failed", "error");
    }
  }, [profile]);

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

  const handleSendVerification = () => {
    setVerificationSent(true);
    showAlert("Verification code sent", "info");
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [fetchProfile, navigate]);

  const handleProfileChange = (field) => (e) => {
    setProfile({ ...profile, [field]: e.target.value });
  };

  const handlePasswordChange = (field) => (e) => {
    setPasswordData({ ...passwordData, [field]: e.target.value });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress sx={{ color: primaryColor }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
   
      <Box sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        mb: 3,
        borderBottom: `1px solid ${primaryColor}`,
        pb: 2
      }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: primaryColor }}>
          Profile Settings
        </Typography>
        {editMode ? (
          <Box>
            <Button 
              onClick={() => setEditMode(false)} 
              sx={{ 
                mr: 2,
                color: primaryColor,
                '&:hover': {
                  backgroundColor: 'rgba(0, 26, 0, 0.08)'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={updateProfile}
              startIcon={<Save />}
              sx={{
                backgroundColor: primaryColor,
                '&:hover': {
                  backgroundColor: secondaryColor
                }
              }}
            >
              Save
            </Button>
          </Box>
        ) : (
          <Button 
            variant="outlined" 
            onClick={() => setEditMode(true)}
            startIcon={<Edit />}
            sx={{
              color: primaryColor,
              borderColor: primaryColor,
              '&:hover': {
                borderColor: secondaryColor,
                color: secondaryColor
              }
            }}
          >
            Edit
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
             <Grid item xs={12} md={6}>
               <TextField
                 fullWidth
                 label="First Name"
                 value={profile.first_name}
                 onChange={handleProfileChange("first_name")}
                 disabled={!editMode}
                 sx={{
                   '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                     borderColor: primaryColor
                   },
                   '& .MuiInputLabel-root.Mui-focused': {
                     color: primaryColor
                   }
                 }}
               />
             </Grid>
             <Grid item xs={12} md={6}>
               <TextField
                 fullWidth
                 label="Last Name"
                 value={profile.last_name}
                 onChange={handleProfileChange("last_name")}
                 disabled={!editMode}
                 sx={{
                   '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                     borderColor: primaryColor
                   },
                   '& .MuiInputLabel-root.Mui-focused': {
                     color: primaryColor
                   }
                 }}
               />
             </Grid>
             <Grid item xs={12} md={6}>
               <FormControl fullWidth disabled={!editMode}>
                 <InputLabel>Gender</InputLabel>
                 <Select
                   value={profile.gender}
                   label="Gender"
                   onChange={handleProfileChange("gender")}
                   sx={{
                     '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                       borderColor: primaryColor
                     },
                     '& .MuiInputLabel-root.Mui-focused': {
                       color: primaryColor
                     }
                   }}
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
                 sx={{
                   '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                     borderColor: primaryColor
                   },
                   '& .MuiInputLabel-root.Mui-focused': {
                     color: primaryColor
                   }
                 }}
               />
             </Grid>
             <Grid item xs={12} md={6}>
               <TextField
                 fullWidth
                 label="Phone"
                 value={profile.phone}
                 onChange={handleProfileChange("phone")}
                 disabled={!editMode}
                 sx={{
                   '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                     borderColor: primaryColor
                   },
                   '& .MuiInputLabel-root.Mui-focused': {
                     color: primaryColor
                   }
                 }}
               />
             </Grid>
             <Grid item xs={12} md={6}>
               <TextField
                 fullWidth
                 label="Email"
                 value={profile.email}
                 disabled
                 sx={{
                   '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                     borderColor: primaryColor
                   },
                   '& .MuiInputLabel-root.Mui-focused': {
                     color: primaryColor
                   }
                 }}
               />
             </Grid>
             <Grid item xs={12}>
               <Button
                 variant="outlined"
                 onClick={() => setPasswordDialog(true)}
                 disabled={!editMode}
                 startIcon={<Lock />}
                 sx={{
                   color: primaryColor,
                   borderColor: primaryColor,
                   '&:hover': {
                     borderColor: secondaryColor,
                     color: secondaryColor
                   }
                 }}
               >
                 Change Password
               </Button>
             </Grid>
           </Grid>
     
         
           <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)}>
             <DialogTitle sx={{ color: primaryColor }}>Change Password</DialogTitle>
             <DialogContent>
               <TextField
                 fullWidth
                 margin="normal"
                 label="Current Password"
                 type="password"
                 value={passwordData.current_password}
                 onChange={handlePasswordChange("current_password")}
                 sx={{
                   '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                     borderColor: primaryColor
                   },
                   '& .MuiInputLabel-root.Mui-focused': {
                     color: primaryColor
                   }
                 }}
               />
               <TextField
                 fullWidth
                 margin="normal"
                 label="New Password"
                 type="password"
                 value={passwordData.new_password}
                 onChange={handlePasswordChange("new_password")}
                 sx={{
                   '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                     borderColor: primaryColor
                   },
                   '& .MuiInputLabel-root.Mui-focused': {
                     color: primaryColor
                   }
                 }}
               />
               <TextField
                 fullWidth
                 margin="normal"
                 label="Confirm Password"
                 type="password"
                 value={passwordData.confirm_password}
                 onChange={handlePasswordChange("confirm_password")}
                 sx={{
                   '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                     borderColor: primaryColor
                   },
                   '& .MuiInputLabel-root.Mui-focused': {
                     color: primaryColor
                   }
                 }}
               />
               {verificationSent && (
                 <TextField
                   fullWidth
                   margin="normal"
                   label="Verification Code"
                   value={passwordData.verification_code}
                   onChange={handlePasswordChange("verification_code")}
                   sx={{
                     '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                       borderColor: primaryColor
                     },
                     '& .MuiInputLabel-root.Mui-focused': {
                       color: primaryColor
                     }
                   }}
                 />
               )}
             </DialogContent>
             <DialogActions>
               <Button 
                 onClick={() => setPasswordDialog(false)}
                 sx={{ color: primaryColor }}
               >
                 Cancel
               </Button>
               {!verificationSent ? (
                 <Button 
                   onClick={handleSendVerification}
                   sx={{ color: primaryColor }}
                 >
                   Send Verification Code
                 </Button>
               ) : (
                 <Button 
                   onClick={changePassword} 
                   variant="contained"
                   sx={{
                     backgroundColor: primaryColor,
                     '&:hover': {
                       backgroundColor: secondaryColor
                     }
                   }}
                 >
                   Confirm Change
                 </Button>
               )}
             </DialogActions>
           </Dialog>
     
        
           <Snackbar
             open={alert.open}
             autoHideDuration={6000}
             onClose={() => setAlert({ ...alert, open: false })}
           >
             <Alert
               severity={alert.severity}
               onClose={() => setAlert({ ...alert, open: false })}
               sx={{
                 '& .MuiAlert-icon': { color: primaryColor },
                 '& .MuiAlert-message': { color: primaryColor }
               }}
             >
               {alert.message}
             </Alert>
           </Snackbar>
         </Box>
       );
     };
     
     export default ProfileSettings;