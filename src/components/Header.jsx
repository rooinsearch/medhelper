import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  Box,
} from "@mui/material";
import { FaGlobe, FaMapMarkerAlt, FaSearch, FaUser } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LoginModal from "./LoginModal";

const Header = () => {
  const [language, setLanguage] = useState("ENG");
  const [anchorEl, setAnchorEl] = useState(null);
  const [city, setCity] = useState(localStorage.getItem("selectedCity") || "Almaty");
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false); // Renamed from loginModalOpen
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );
  
  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated);
  }, [isAuthenticated]);
  
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = () => {
    setIsAuthenticated(true);
    setAuthModalOpen(false); // Updated from loginModalOpen
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };
  

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: "#001A00", p: 1, top: 0, width: "100%", zIndex: 1000 }}>
        <Toolbar sx={{ minHeight: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Логотип */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", lineHeight: 1 }}>MedHelper</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5 }}>Easier appointments. Smarter diagnoses. Powered by AI.</Typography>
          </div>

          {/* Поисковая строка */}
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search for clinics, doctors..."
            sx={{
              backgroundColor: "white",
              borderRadius: "20px",
              width: "40%",
              ml: "-20px",
              "& .MuiOutlinedInput-root": { borderRadius: "20px", border: "none", boxShadow: "none", "& fieldset": { border: "none" } },
              "& .MuiInputBase-root": { pl: 2 },
            }}
            InputProps={{ startAdornment: (<FaSearch style={{ marginRight: "8px", color: "gray" }} />) }}
          />

          {/* Город, язык, логин/профиль */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <IconButton color="inherit" onClick={() => setCityModalOpen(true)} sx={{ "&:hover": { color: "#FFA500" } }}>
              <FaMapMarkerAlt />
            </IconButton>
            <Typography variant="body2">{city}</Typography>

            <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ "&:hover": { color: "#FFA500" } }}>
              <FaGlobe />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              {["ENG", "KAZ", "RUS"].map((lang) => (
                <MenuItem key={lang} onClick={() => { setLanguage(lang); setAnchorEl(null); }}>{lang}</MenuItem>
              ))}
            </Menu>
            <Typography variant="body2">{language}</Typography>

            {/* Логин / Профиль */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {isAuthenticated ? (
                <>
                  <IconButton color="inherit" component={Link} to="/profile" sx={{ "&:hover": { color: "#FFA500" } }}>
                    <FaUser />
                  </IconButton>
                  <Button color="inherit" onClick={handleLogout} sx={{ "&:hover": { color: "#FFA500" } }}>Logout</Button>
                </>
              ) : (
                <Button color="inherit" onClick={() => setAuthModalOpen(true)} sx={{ "&:hover": { color: "#FFA500" } }}>Log In</Button>
              )}
            </motion.div>
          </div>
        </Toolbar>

        {/* Навигация */}
        <Toolbar sx={{ justifyContent: "center", minHeight: "40px" }}>
          {[
            { label: "Home", path: "/" },
            { label: "CheckAI", path: "/checkai" },
            { label: "Health Tips", path: "/health-tips" },
            { label: "Doctors", path: "/doctors" },
            { label: "Clinics", path: "/clinics" },
            { label: "Specializations", path: "/specializations" },
            { label: "About Us", path: "/about-us" },
            { label: "Help & Support", path: "/help-support" },
          ].map((item) => (
            <Button
              key={item.path}
              color="inherit"
              component={Link}
              to={item.path}
              sx={{
                borderBottom: location.pathname === item.path ? "2px solid white" : "none",
                borderRadius: 0,
                mx: 1,
                fontSize: "12px",
                fontWeight: location.pathname === item.path ? "bold" : "normal",
                textTransform: "none",
                paddingY: "5px",
                "&:hover": { color: "#FFA500" },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>

      {/* Модальное окно входа - заменено с LoginModal на AuthModal */}
      <LoginModal 
        open={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onLogin={handleLogin} 
      />

      {/* Модальное окно выбора города */}
      <Modal open={cityModalOpen} onClose={() => setCityModalOpen(false)}>
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", bgcolor: "white", boxShadow: 24, p: 3, borderRadius: "10px", minWidth: "250px", textAlign: "center" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Choose your city</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {["Almaty", "Astana"].map((cityOption) => (
              <MenuItem key={cityOption} onClick={() => { setCity(cityOption); setCityModalOpen(false); }} sx={{ "&:hover": { color: "#FFA500" }, cursor: "pointer" }}>
                {cityOption}
              </MenuItem>
            ))}
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default Header;

