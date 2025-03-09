import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Divider,
  CircularProgress,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

const AuthModal = ({ open, onClose }) => {
  const [rememberMe, setRememberMe] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    const response = await fetch("http://127.0.0.1:8000/api/accounts/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, email, password }),
    });

    const data = await response.json();
    setLoading(false);

    if (response.ok) {
      setIsVerifying(true);
    } else {
      setError(data.message || "Registration failed.");
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    setError("");

    const response = await fetch("http://127.0.0.1:8000/api/accounts/verify-otp/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();
    setLoading(false);

    if (response.ok) {
      alert("Регистрация успешно завершена!");
      setIsRegistering(false);
      setIsVerifying(false);
    } else {
      setError(data.message || "Invalid OTP.");
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    const response = await fetch("http://127.0.0.1:8000/api/accounts/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    setLoading(false);

    if (response.ok) {
      localStorage.setItem("token", data.token);
      alert("Login successful!");
      onClose();
    } else {
      setError(data.message || "Invalid credentials.");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "400px",
            height: "100%",
            bgcolor: "white",
            boxShadow: 24,
            p: 4,
            textAlign: "center",
            overflowY: isRegistering ? "auto" : "hidden",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, color: "#333" }}>
            MedHelper
          </Typography>

          <Typography variant="h6" sx={{ mb: 3, color: "#555" }}>
            {isRegistering ? (isVerifying ? "Enter Confirmation Code" : "Create an Account") : "Welcome Back!"}
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {isRegistering && isVerifying ? (
            <>
              <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
                We sent a verification code to your email. Please enter it below.
              </Typography>
              <TextField
                fullWidth
                label="Verification Code"
                margin="dense"
                variant="outlined"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 2, py: 1.2, borderRadius: "25px" }}
                onClick={handleVerifyOTP}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Verify Code"}
              </Button>
            </>
          ) : (
            <>
              {isRegistering && (
                <TextField
                  fullWidth
                  label="Full Name"
                  margin="dense"
                  variant="outlined"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              )}
              <TextField
                fullWidth
                label="Email"
                margin="dense"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                margin="dense"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {isRegistering && (
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  margin="dense"
                  variant="outlined"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              )}

              {!isRegistering && (
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 1, mb: 2 }}>
                  <FormControlLabel
                    control={<Checkbox checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />}
                    label="Remember me"
                  />
                  <Typography variant="body2" sx={{ cursor: "pointer", color: "#007BFF" }}>
                    Forgot Password?
                  </Typography>
                </Box>
              )}

              <Button
                fullWidth
                variant="contained"
                sx={{ py: 1.2, borderRadius: "25px" }}
                onClick={isRegistering ? handleRegister : handleLogin}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : isRegistering ? "Sign Up" : "Sign In"}
              </Button>

              <Divider sx={{ my: 3, color: "#aaa" }}>Or, {isRegistering ? "Sign up" : "Login"} with</Divider>

              <Button fullWidth variant="outlined" sx={{ py: 1.2, borderRadius: "25px" }}>
                <GoogleIcon sx={{ mr: 1, color: "#DB4437" }} />
                {isRegistering ? "Sign up" : "Sign in"} with Google
              </Button>

              <Typography variant="body2" sx={{ mt: 3, color: "#666" }}>
                {isRegistering ? "Already have an account? " : "Don't have an account? "}
                <Typography component="span" sx={{ cursor: "pointer", color: "#007BFF" }} onClick={() => setIsRegistering(!isRegistering)}>
                  {isRegistering ? "Sign in" : "Register here"}
                </Typography>
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default AuthModal;
