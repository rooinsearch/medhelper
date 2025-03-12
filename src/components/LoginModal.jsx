import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Divider,
} from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";


const AuthModal = ({ open, onClose }) => {
  const [rememberMe, setRememberMe] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    username: "",
    confirmPassword: "",
  });
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    const savedPassword = localStorage.getItem("userPassword");
    if (savedEmail && savedPassword) {
      setFormData({ email: savedEmail, password: savedPassword });
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignIn = () => {
    if (rememberMe) {
      localStorage.setItem("userEmail", formData.email);
      localStorage.setItem("userPassword", formData.password);
    } else {
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userPassword");
    }
    console.log("Signing in with:", formData);
  };

  const handleSignUp = () => {
    console.log("Registering with:", formData);
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setResetMessage("Please enter your email.");
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/password_reset_request/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await response.json();
      setResetMessage(response.ok ? "Check your email for reset instructions!" : data.error);
    } catch (error) {
      setResetMessage("Something went wrong. Try again.");
    }
  };

  const handleGoogleSuccess = async (response) => {
    const token = response.credential;
    const decoded = jwtDecode(token);
    console.log("Google user:", decoded);

    try {
      const backendResponse = await fetch("http://localhost:8000/api/auth/google/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: token }),
      });

      const data = await backendResponse.json();
      console.log("Backend response:", data);
    } catch (error) {
      console.log("Error during Google authentication:", error);
    }
  };

  const handleGoogleFailure = () => {
    console.log("Google sign-in failed");
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          height: "100vh",
          bgcolor: "#FFFFFF",
          color: "#40916C",
          boxShadow: 24,
          p: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          MedHelper
        </Typography>

        {showResetPassword ? (
          <>
            <Typography variant="h6" sx={{ textAlign: "center", mb: 1 }}>
              Reset Password
            </Typography>
            <TextField
              size="small"
              fullWidth
              label="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            <Button fullWidth variant="contained" sx={{ mt: 2, bgcolor: "#40916C", color: "white" }} onClick={handleResetPassword}>
              Send Reset Link
            </Button>
            {resetMessage && <Typography variant="body2" color="error" sx={{ mt: 1 }}>{resetMessage}</Typography>}
            <Typography variant="body2" sx={{ mt: 2, cursor: "pointer", color: "#40916C" }} onClick={() => setShowResetPassword(false)}>
              Back to Sign In
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h6" sx={{ textAlign: "center", mb: 1 }}>
              {isRegistering ? "Create an Account" : "Welcome Back!"}
            </Typography>

            <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1.5 }}>
              {isRegistering && <TextField size="small" fullWidth label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} />}
              {isRegistering && <TextField size="small" fullWidth label="Username" name="username" value={formData.username} onChange={handleChange} />}
              <TextField size="small" fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} />
              <TextField size="small" fullWidth label="Password" type="password" name="password" value={formData.password} onChange={handleChange} />
              {isRegistering && <TextField size="small" fullWidth label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />}

              <Button fullWidth variant="contained" sx={{ borderRadius: "20px", bgcolor: "#40916C", color: "white", py: 1 }} onClick={isRegistering ? handleSignUp : handleSignIn}>
                {isRegistering ? "Sign Up" : "Sign In"}
              </Button>

              <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleFailure} />

              <Divider sx={{ my: 1, bgcolor: "#40916C" }} />

              {!isRegistering && (
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <FormControlLabel
                    control={<Checkbox checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} sx={{ color: "#40916C" }} />}
                    label={<Typography sx={{ color: "#40916C", fontSize: "0.85rem" }}>Remember me</Typography>}
                  />
                  <Typography
                    variant="body2"
                    sx={{ cursor: "pointer", color: "#40916C", fontSize: "0.85rem" }}
                    onClick={() => setShowResetPassword(true)}
                  >
                    Forgot Password?
                  </Typography>
                </Box>
              )}

              <Typography
                variant="body2"
                sx={{ textAlign: "center", mt: 1, cursor: "pointer", color: "#40916C", fontSize: "0.9rem" }}
                onClick={() => setIsRegistering(!isRegistering)}
              >
                {isRegistering ? "Already have an account? Sign in" : "Don't have an account? Register here"}
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default AuthModal;
