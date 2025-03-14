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
} from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const AuthModal = ({ open, onClose, onLogin, resetToken = null }) => {
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const resetEmailInputRef = useRef(null);
  const newPasswordInputRef = useRef(null);

  const [isRegistering, setIsRegistering] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(!!resetToken);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
  });

  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetMessageType, setResetMessageType] = useState("error");

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetFormMessage, setResetFormMessage] = useState("");
  const [resetFormMessageType, setResetFormMessageType] = useState("error");
  const [resetSuccess, setResetSuccess] = useState(false);

  // Загрузка сохраненного email при монтировании
  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setFormData((prevData) => ({ ...prevData, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Автофокус на поле ввода при открытии модального окна
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

  // Обработка токена сброса пароля
  useEffect(() => {
    if (resetToken) setShowResetForm(true);
  }, [resetToken]);

  // Обработка изменений в форме
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    if (error) setError("");
  };

  // Валидация формы
  const validateForm = () => {
    if (!formData.email) return setError("Email is required");
    if (!formData.password) return setError("Password is required");
    if (isRegistering) {
      if (!formData.fullName) return setError("Full name is required");
      if (formData.password.length < 8) return setError("Password must be at least 8 characters");
      if (formData.password !== formData.confirmPassword) return setError("Passwords do not match");
    }
    return true;
  };

  // Общая функция для авторизации и регистрации
  const handleAuth = async (url, body, isRegister = false) => {
    if (!validateForm()) return;
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error(isRegister ? "Registration failed" : "Authentication failed");

      const data = await response.json();
      if (rememberMe) localStorage.setItem("userEmail", formData.email);
      else localStorage.removeItem("userEmail");

      // Устанавливаем авторизацию и уведомляем родителя
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("token", data.token);
      onLogin && onLogin(); // Вызываем onLogin для обновления состояния в Header
      onClose();
    } catch (err) {
      setError(isRegister ? "Registration failed. Please try again." : "Authentication failed. Please check your credentials.");
      console.error(`${isRegister ? "Registration" : "Login"} error:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка входа
  const handleSignIn = () => handleAuth("http://localhost:8000/api/auth/login/", { email: formData.email, password: formData.password });

  // Обработка регистрации
  const handleSignUp = () => handleAuth("http://localhost:8000/api/auth/register/", { email: formData.email, password: formData.password, fullName: formData.fullName }, true);

  // Обработка сброса пароля
  const handleResetPassword = async () => {
    if (!resetEmail) return setResetMessage("Please enter your email.") && setResetMessageType("error");
    setIsLoading(true);
    setResetMessage("");

    try {
      const response = await fetch("http://localhost:8000/password_reset_request/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (!response.ok) throw new Error("Failed to send reset link");
      setResetMessage("Reset instructions sent! Please check your email.");
      setResetMessageType("success");
    } catch (error) {
      setResetMessage("Failed to send reset link. Please try again.");
      setResetMessageType("error");
      console.error("Reset request error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка создания нового пароля
  const handleSubmitNewPassword = async () => {
    if (!newPassword) return setResetFormMessage("Password is required") && setResetFormMessageType("error");
    if (newPassword.length < 8) return setResetFormMessage("Password must be at least 8 characters") && setResetFormMessageType("error");
    if (newPassword !== confirmNewPassword) return setResetFormMessage("Passwords do not match") && setResetFormMessageType("error");

    setIsLoading(true);
    setResetFormMessage("");

    try {
      const response = await fetch("http://localhost:8000/password_reset_confirm/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });

      if (!response.ok) throw new Error("Failed to reset password");
      setResetSuccess(true);
      setResetFormMessage("Your password has been reset successfully!");
      setResetFormMessageType("success");

      setTimeout(() => {
        setShowResetForm(false);
        setShowResetPassword(false);
        if (resetToken) window.history.replaceState({}, document.title, window.location.pathname);
      }, 3000);
    } catch (error) {
      setResetFormMessage("Failed to reset password. The link may be expired.");
      setResetFormMessageType("error");
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка успешной авторизации через Google
  const handleGoogleSuccess = async (response) => {
    setIsLoading(true);
    setError("");

    try {
      const token = response.credential;
      const decoded = jwtDecode(token);
      console.log("Google user:", decoded);

      const backendResponse = await fetch("http://localhost:8000/api/auth/google/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!backendResponse.ok) throw new Error("Google authentication failed");

      const data = await backendResponse.json();
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("token", data.token);
      onLogin && onLogin(); // Вызываем onLogin для обновления состояния в Header
      onClose();
    } catch (error) {
      setError("Google authentication failed. Please try again.");
      console.error("Google auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка ошибки авторизации через Google
  const handleGoogleFailure = () => setError("Google sign-in failed. Please try another method.");

  // Обработка нажатия клавиши Enter
  const handleKeyPress = (e, action) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };

  // Рендер формы сброса пароля
  const renderResetPasswordForm = () => (
    <>
      <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>Create New Password</Typography>
      {resetSuccess ? (
        <Alert severity="success" sx={{ mb: 2, width: "100%" }}>{resetFormMessage}</Alert>
      ) : (
        <>
          <TextField inputRef={newPasswordInputRef} size="small" fullWidth label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} onKeyPress={(e) => handleKeyPress(e, handleSubmitNewPassword)} sx={{ mb: 2 }} disabled={isLoading} autoFocus />
          <TextField size="small" fullWidth label="Confirm New Password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} onKeyPress={(e) => handleKeyPress(e, handleSubmitNewPassword)} sx={{ mb: 2 }} disabled={isLoading} />
          {resetFormMessage && <Alert severity={resetFormMessageType} sx={{ mb: 2, width: "100%" }}>{resetFormMessage}</Alert>}
          <Button fullWidth variant="contained" sx={{ bgcolor: "#40916C", color: "white", "&:hover": { bgcolor: "#2D6A4F" } }} onClick={handleSubmitNewPassword} disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}>
            {isLoading ? "Saving..." : "Save New Password"}
          </Button>
        </>
      )}
    </>
  );

  // Рендер формы запроса сброса пароля
  const renderRequestResetForm = () => (
    <>
      <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>Reset Password</Typography>
      <TextField inputRef={resetEmailInputRef} size="small" fullWidth label="Enter your email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} onKeyPress={(e) => handleKeyPress(e, handleResetPassword)} disabled={isLoading} autoFocus />
      <Button fullWidth variant="contained" sx={{ mt: 2, bgcolor: "#40916C", color: "white", "&:hover": { bgcolor: "#2D6A4F" } }} onClick={handleResetPassword} disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}>
        {isLoading ? "Sending..." : "Send Reset Link"}
      </Button>
      {resetMessage && <Alert severity={resetMessageType} sx={{ mt: 2, width: "100%" }}>{resetMessage}</Alert>}
      <Button variant="text" sx={{ mt: 2, color: "#40916C", "&:hover": { bgcolor: "rgba(64, 145, 108, 0.08)" } }} onClick={() => setShowResetPassword(false)} disabled={isLoading}>Back to Sign In</Button>
    </>
  );

  // Рендер основной формы (вход/регистрация)
  const renderMainForm = () => (
    <>
      <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>{isRegistering ? "Create an Account" : "Welcome Back!"}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2, width: "100%" }}>{error}</Alert>}
      <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1.5 }}>
        {isRegistering && <TextField size="small" fullWidth label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} disabled={isLoading} />}
        <TextField inputRef={emailInputRef} size="small" fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} onKeyPress={(e) => handleKeyPress(e, isRegistering ? handleSignUp : handleSignIn)} disabled={isLoading} autoFocus />
        <TextField inputRef={passwordInputRef} size="small" fullWidth label="Password" type="password" name="password" value={formData.password} onChange={handleChange} onKeyPress={(e) => handleKeyPress(e, isRegistering ? handleSignUp : handleSignIn)} disabled={isLoading} />
        {isRegistering && <TextField size="small" fullWidth label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} onKeyPress={(e) => handleKeyPress(e, handleSignUp)} disabled={isLoading} />}
        <Button fullWidth variant="contained" sx={{ borderRadius: "20px", bgcolor: "#40916C", color: "white", py: 1, "&:hover": { bgcolor: "#2D6A4F" } }} onClick={isRegistering ? handleSignUp : handleSignIn} disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}>
          {isLoading ? (isRegistering ? "Signing Up..." : "Signing In...") : (isRegistering ? "Sign Up" : "Sign In")}
        </Button>
        <Box sx={{ position: "relative", width: "100%", my: 1 }}>
          <Divider sx={{ my: 1, bgcolor: "#40916C" }} />
          <Typography sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", bgcolor: "white", px: 1, fontSize: "0.85rem", color: "#40916C" }}>OR</Typography>
        </Box>
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}><GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleFailure} /></Box>
        {!isRegistering && (
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <FormControlLabel control={<Checkbox checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} sx={{ color: "#40916C", "&.Mui-checked": { color: "#40916C" } }} disabled={isLoading} />} label={<Typography sx={{ color: "#40916C", fontSize: "0.85rem" }}>Remember me</Typography>} />
            <Button variant="text" sx={{ cursor: "pointer", color: "#40916C", fontSize: "0.85rem", textTransform: "none", "&:hover": { bgcolor: "rgba(64, 145, 108, 0.08)", textDecoration: "underline" } }} onClick={() => setShowResetPassword(true)} disabled={isLoading}>Forgot Password?</Button>
          </Box>
        )}
        <Button variant="text" sx={{ textAlign: "center", mt: 1, cursor: "pointer", color: "#40916C", fontSize: "0.9rem", textTransform: "none", "&:hover": { bgcolor: "rgba(64, 145, 108, 0.08)", textDecoration: "underline" } }} onClick={() => { setIsRegistering(!isRegistering); setError(""); }} disabled={isLoading}>
          {isRegistering ? "Already have an account? Sign in" : "Don't have an account? Register here"}
        </Button>
      </Box>
    </>
  );

  return (
    <Modal open={open} onClose={isLoading ? undefined : onClose}>
      <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 400, maxHeight: "100vh", overflowY: "auto", bgcolor: "#FFFFFF", color: "#40916C", boxShadow: 24, p: 3, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", scrollbarWidth: "none", "-ms-overflow-style": "none", "&::-webkit-scrollbar": { display: "none" } }} onClick={(e) => e.stopPropagation()}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>MedHelper</Typography>
        {showResetForm ? renderResetPasswordForm() : showResetPassword ? renderRequestResetForm() : renderMainForm()}
      </Box>
    </Modal>
  );
};

export default AuthModal;