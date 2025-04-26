import React, { useState, useEffect, useRef } from "react";
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
  Alert,
  Paper,
} from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const VerificationCodeComponent = ({ 
  email, 
  onVerify, 
  onResend, 
  onBack,
  isLoading,
  verificationError,
  verificationSuccess
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [resendTimeout, setResendTimeout] = useState(60);

  useEffect(() => {
    if (resendTimeout > 0) {
      const timer = setTimeout(() => setResendTimeout(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimeout]);

  const handleChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setVerificationCode(value);
  };

  const handleResendCode = async () => {
    if (resendTimeout > 0) return;
    await onResend();
    setResendTimeout(60);
  };

  return (
    <Paper elevation={3} sx={{
      width: '320px',
      p: 2.5,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <Typography variant="h6" align="center" sx={{ mb: 1, color: '#001A00', fontWeight: 600 }}>
        Verify Your Email
      </Typography>
      
      <Typography variant="body2" align="center" sx={{ mb: 2, color: 'text.secondary' }}>
        We've sent a 6-digit code to {email}
      </Typography>
      
      {verificationSuccess ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          Email verified successfully! Logging you in...
        </Alert>
      ) : (
        <>
          <TextField
            fullWidth
            placeholder="Verification Code"
            variant="outlined"
            size="small"
            value={verificationCode}
            onChange={handleChange}
            error={!!verificationError}
            helperText={verificationError}
            inputProps={{ maxLength: 6 }}
            sx={{ mb: 2 }}
            autoFocus
          />
          
          <Button
            fullWidth
            variant="contained"
            onClick={() => onVerify(verificationCode)}
            disabled={isLoading}
            sx={{
              mb: 1,
              bgcolor: '#001A00',
              '&:hover': { bgcolor: '#FFA500' },
            }}
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </Button>
          
          <Button
            fullWidth
            variant="text"
            onClick={handleResendCode}
            disabled={isLoading || resendTimeout > 0}
            sx={{ 
              mb: 0.5,
              color: '#001A00',
              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
            }}
          >
            {resendTimeout > 0 ? `Resend in ${resendTimeout}s` : 'Resend Code'}
          </Button>
          
          <Button
            fullWidth
            variant="text"
            onClick={onBack}
            disabled={isLoading}
            sx={{ 
              color: '#001A00',
              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
            }}
          >
            Back to Registration
          </Button>
        </>
      )}
    </Paper>
  );
};

const AuthModal = ({ open, onClose, onLogin, resetToken = null }) => {
  // Refs
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const resetEmailInputRef = useRef(null);
  const newPasswordInputRef = useRef(null);

  // State variables
  const [isRegistering, setIsRegistering] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(!!resetToken);
  const [showVerification, setShowVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
  });

  // Password reset states
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetMessageType, setResetMessageType] = useState("error");

  // New password states
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetFormMessage, setResetFormMessage] = useState("");
  const [resetFormMessageType, setResetFormMessageType] = useState("error");
  const [resetSuccess, setResetSuccess] = useState(false);

  // Verification states
  const [verificationError, setVerificationError] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // API base URL
  const API_BASE_URL = "http://localhost:8000";

  // Effects
  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (showResetForm && newPasswordInputRef.current) {
          newPasswordInputRef.current.focus();
        } else if (showResetPassword && resetEmailInputRef.current) {
          resetEmailInputRef.current.focus();
        } else if (emailInputRef.current) {
          emailInputRef.current.focus();
        }
      }, 100);
    }
  }, [open, showResetForm, showResetPassword, isRegistering]);

  useEffect(() => {
    if (resetToken) setShowResetForm(true);
  }, [resetToken]);

  // Helper functions
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.email) return setError("Email is required");
    if (!formData.password) return setError("Password is required");
    if (isRegistering) {
      if (!formData.fullName) return setError("Full name is required");
      if (formData.password.length < 8)
        return setError("Password must be at least 8 characters");
      if (formData.password !== formData.confirmPassword)
        return setError("Passwords do not match");
    }
    return true;
  };

  const handleKeyPress = (e, action) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };

  // Enhanced API call handler with CORS and error handling
  const makeApiCall = async (endpoint, method, body, errorMessage) => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        credentials: 'include', // For cookies if needed
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific backend errors
        if (data.detail) {
          throw new Error(data.detail);
        } else if (data.email) {
          throw new Error(data.email[0]);
        } else if (data.password) {
          throw new Error(data.password[0]);
        } else if (data.non_field_errors) {
          throw new Error(data.non_field_errors[0]);
        } else {
          throw new Error(errorMessage || "Request failed");
        }
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      
      // Handle specific error cases
      if (error.message.includes("Failed to fetch")) {
        throw new Error("Network error. Please check your connection.");
      } else if (error.message.includes("JSON")) {
        throw new Error("Invalid server response");
      } else {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Authentication handlers
  const handleAuth = async (endpoint, body, isRegister = false) => {
    if (!validateForm()) return;

    try {
      const data = await makeApiCall(
        endpoint,
        "POST",
        body,
        isRegister ? "Registration failed" : "Authentication failed"
      );
      
      if (isRegister) {
        setShowVerification(true);
      } else {
        if (rememberMe) localStorage.setItem("userEmail", formData.email);
        else localStorage.removeItem("userEmail");
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("accessToken", data.access_token);
        onLogin(data.access_token);
        onClose();
      }
    } catch (err) {
      setError(err.message || 
        (isRegister 
          ? "Registration failed. Please try again." 
          : "Authentication failed. Please check your credentials.")
      );
    }
  };

  const handleSignIn = () =>
    handleAuth("/api/auth/login/", {
      email: formData.email,
      password: formData.password,
    });

  const handleSignUp = () =>
    handleAuth(
      "/api/auth/register/", 
      {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
      }, 
      true
    );

  // Verification handlers
  const handleVerifyCode = async (code) => {
    try {
      await makeApiCall(
        "/api/auth/verify/",
        "POST",
        { email: formData.email, code },
        "Verification failed"
      );
      
      setVerificationSuccess(true);
      setTimeout(() => {
        handleAuth("/api/auth/login/", {
          email: formData.email,
          password: formData.password,
        });
      }, 1500);
    } catch (error) {
      setVerificationError(error.message || "Invalid verification code. Please try again.");
    }
  };

  const handleResendCode = async () => {
    try {
      await makeApiCall(
        "/api/auth/resend-code/",
        "POST",
        { email: formData.email },
        "Failed to resend code"
      );
      
      setVerificationError("");
      alert("New verification code sent to your email!");
    } catch (error) {
      setVerificationError(error.message || "Failed to resend code. Please try again.");
    }
  };

  // Password reset handlers
  const handleResetPassword = async () => {
    if (!resetEmail) {
      setResetMessage("Please enter your email.");
      setResetMessageType("error");
      return;
    }

    try {
      await makeApiCall(
        "/password_reset_request/",
        "POST",
        { email: resetEmail },
        "Failed to send reset link"
      );
      
      setResetMessage("Reset instructions sent! Please check your email.");
      setResetMessageType("success");
    } catch (error) {
      setResetMessage(error.message || "Failed to send reset link. Please try again.");
      setResetMessageType("error");
    }
  };

  const handleSubmitNewPassword = async () => {
    if (!newPassword) {
      setResetFormMessage("Password is required");
      setResetFormMessageType("error");
      return;
    }
    if (newPassword.length < 8) {
      setResetFormMessage("Password must be at least 8 characters");
      setResetFormMessageType("error");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setResetFormMessage("Passwords do not match");
      setResetFormMessageType("error");
      return;
    }

    try {
      await makeApiCall(
        "/password_reset_confirm/",
        "POST",
        { token: resetToken, newPassword },
        "Failed to reset password"
      );
      
      setResetSuccess(true);
      setResetFormMessage("Your password has been reset successfully!");
      setResetFormMessageType("success");
      
      setTimeout(() => {
        setShowResetForm(false);
        setShowResetPassword(false);
        if (resetToken) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }, 3000);
    } catch (error) {
      setResetFormMessage(error.message || "Failed to reset password. The link may be expired.");
      setResetFormMessageType("error");
    }
  };

  // Google auth handlers
  const handleGoogleSuccess = async (response) => {
    try {
      const token = response.credential;
      const decoded = jwtDecode(token);
      
      const data = await makeApiCall(
        "/api/auth/google/",
        "POST",
        { token },
        "Google authentication failed"
      );
      
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("accessToken", data.access_token);
      onLogin(data.access_token);
      onClose();
    } catch (error) {
      setError(error.message || "Google authentication failed. Please try again.");
    }
  };

  const handleGoogleFailure = () => {
    setError("Google sign-in failed. Please try another method.");
  };

  // Component renderers
  const renderResetPasswordForm = () => (
    <>
      <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
        Create New Password
      </Typography>
      {resetSuccess ? (
        <Alert severity="success" sx={{ mb: 2, width: "100%" }}>
          {resetFormMessage}
        </Alert>
      ) : (
        <>
          <TextField
            inputRef={newPasswordInputRef}
            size="small"
            fullWidth
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, handleSubmitNewPassword)}
            sx={{ mb: 2 }}
            disabled={isLoading}
            autoFocus
          />
          <TextField
            size="small"
            fullWidth
            label="Confirm New Password"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, handleSubmitNewPassword)}
            sx={{ mb: 2 }}
            disabled={isLoading}
          />
          {resetFormMessage && (
            <Alert severity={resetFormMessageType} sx={{ mb: 2, width: "100%" }}>
              {resetFormMessage}
            </Alert>
          )}
          <Button
            fullWidth
            variant="contained"
            sx={{ bgcolor: "#001A00", color: "white", "&:hover": { bgcolor: "#FFA500" } }}
            onClick={handleSubmitNewPassword}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? "Saving..." : "Save New Password"}
          </Button>
        </>
      )}
    </>
  );

  const renderRequestResetForm = () => (
    <>
      <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
        Reset Password
      </Typography>
      <TextField
        inputRef={resetEmailInputRef}
        size="small"
        fullWidth
        label="Enter your email"
        value={resetEmail}
        onChange={(e) => setResetEmail(e.target.value)}
        onKeyPress={(e) => handleKeyPress(e, handleResetPassword)}
        disabled={isLoading}
        autoFocus
      />
      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 2, bgcolor: "#001A00", color: "white", "&:hover": { bgcolor: "#FFA500" } }}
        onClick={handleResetPassword}
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {isLoading ? "Sending..." : "Send Reset Link"}
      </Button>
      {resetMessage && (
        <Alert severity={resetMessageType} sx={{ mt: 2, width: "100%" }}>
          {resetMessage}
        </Alert>
      )}
      <Button
        variant="text"
        sx={{ mt: 2, color: "#001A00", "&:hover": { bgcolor: "rgba(64, 145, 108, 0.08)" } }}
        onClick={() => setShowResetPassword(false)}
        disabled={isLoading}
      >
        Back to Sign In
      </Button>
    </>
  );

  const renderMainForm = () => (
    <>
      <Typography variant="h6" sx={{ textAlign: "center", mb: 2, color: "#001A00" }}>
        {isRegistering ? "Create an Account" : "Welcome!"}
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
          {error}
        </Alert>
      )}
      <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1.5 }}>
        {isRegistering && (
          <TextField
            size="small"
            fullWidth
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            disabled={isLoading}
          />
        )}
        <TextField
          inputRef={emailInputRef}
          size="small"
          fullWidth
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onKeyPress={(e) => handleKeyPress(e, isRegistering ? handleSignUp : handleSignIn)}
          disabled={isLoading}
          autoFocus
        />
        <TextField
          inputRef={passwordInputRef}
          size="small"
          fullWidth
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          onKeyPress={(e) => handleKeyPress(e, isRegistering ? handleSignUp : handleSignIn)}
          disabled={isLoading}
        />
        {isRegistering && (
          <TextField
            size="small"
            fullWidth
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onKeyPress={(e) => handleKeyPress(e, handleSignUp)}
            disabled={isLoading}
          />
        )}
        <Button
          fullWidth
          variant="contained"
          sx={{
            borderRadius: "20px",
            bgcolor: "#001A00",
            color: "white",
            py: 1,
            "&:hover": { bgcolor: "#FFA500" },
          }}
          onClick={isRegistering ? handleSignUp : handleSignIn}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isLoading
            ? isRegistering
              ? "Signing Up..."
              : "Signing In..."
            : isRegistering
            ? "Sign Up"
            : "Sign In"}
        </Button>
        <Box sx={{ position: "relative", width: "100%", my: 1 }}>
          <Divider sx={{ my: 1, bgcolor: "#40916C" }} />
          <Typography
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "white",
              px: 1,
              fontSize: "0.85rem",
              color: "#001A00",
            }}
          >
            OR
          </Typography>
        </Box>
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleFailure} />
        </Box>
        {!isRegistering && (
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  sx={{ color: "#001A00", "&.Mui-checked": { color: "#001A00" } }}
                  disabled={isLoading}
                />
              }
              label={<Typography sx={{ color: "#001A00", fontSize: "0.85rem" }}>Remember me</Typography>}
            />
            <Button
              variant="text"
              sx={{
                cursor: "pointer",
                color: "#001A00",
                fontSize: "0.85rem",
                textTransform: "none",
                "&:hover": { bgcolor: "rgba(64, 145, 108, 0.08)", textDecoration: "underline" },
              }}
              onClick={() => setShowResetPassword(true)}
              disabled={isLoading}
            >
              Forgot Password?
            </Button>
          </Box>
        )}
        <Button
          variant="text"
          sx={{
            textAlign: "center",
            mt: 1,
            cursor: "pointer",
            color: "#001A00",
            fontSize: "0.9rem",
            textTransform: "none",
            "&:hover": { bgcolor: "rgba(64, 145, 108, 0.08)", textDecoration: "underline" },
          }}
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError("");
          }}
          disabled={isLoading}
        >
          {isRegistering ? "Already have an account? Sign in" : "Don't have an account? Register here"}
        </Button>
      </Box>
    </>
  );

  return (
    <Modal open={open} onClose={isLoading ? undefined : onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          maxHeight: "100vh",
          overflowY: "auto",
          bgcolor: "#FFFFFF",
          color: "#40916C",
          boxShadow: 24,
          p: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          scrollbarWidth: "none",
          "-ms-overflow-style": "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, color: "#001A00" }}>
          MedHelper
        </Typography>
        {showVerification ? (
          <VerificationCodeComponent
            email={formData.email}
            onVerify={handleVerifyCode}
            onResend={handleResendCode}
            onBack={() => {
              setShowVerification(false);
              setError("");
            }}
            isLoading={isLoading}
            verificationError={verificationError}
            verificationSuccess={verificationSuccess}
          />
        ) : showResetForm ? (
          renderResetPasswordForm()
        ) : showResetPassword ? (
          renderRequestResetForm()
        ) : (
          renderMainForm()
        )}
      </Box>
    </Modal>
  );
};

export default AuthModal;