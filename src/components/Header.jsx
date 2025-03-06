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
import { FaGlobe, FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const [language, setLanguage] = useState("ENG");
  const [anchorEl, setAnchorEl] = useState(null);
  const [city, setCity] = useState(localStorage.getItem("selectedCity") || "Almaty");
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("selectedCity", city);
  }, [city]);

  return (
    <>
      {/* Фиксированный хэдер */}
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: "#001A00",
          p: 1,
          top: 0,
          width: "100%",
          zIndex: 1000,
        }}
      >
        <Toolbar
          sx={{
            minHeight: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Логотип и описание */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: "bold", lineHeight: 1 }}>
              MedHelper
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5 }}>
              Easier appointments. Smarter diagnoses. Powered by AI.
            </Typography>
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
              "& .MuiOutlinedInput-root": {
                borderRadius: "20px",
                border: "none",
                boxShadow: "none",
                "& fieldset": { border: "none" },
              },
              "& .MuiInputBase-root": { pl: 2 },
            }}
            InputProps={{
              startAdornment: (
                <FaSearch style={{ marginRight: "8px", color: "gray" }} />
              ),
            }}
          />

          {/* Город и выбор языка */}
          <div style={{ display: "flex", alignItems: "center", marginRight: "10px" }}>
            <IconButton
              color="inherit"
              onClick={() => setCityModalOpen(true)}
              sx={{ "&:hover": { color: "#FFA500" } }}
            >
              <FaMapMarkerAlt />
            </IconButton>
            <Typography variant="body2" sx={{ ml: 1 }}>{city}</Typography>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              color="inherit"
              sx={{ "&:hover": { color: "#FFA500" } }}
              onClick={() => setLoginModalOpen(true)}
            >
              Log In
            </Button>
            <IconButton
              color="inherit"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ "&:hover": { color: "#FFA500" } }}
            >
              <FaGlobe />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              {["ENG", "KAZ", "RUS"].map((lang) => (
                <MenuItem
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setAnchorEl(null);
                  }}
                >
                  {lang}
                </MenuItem>
              ))}
            </Menu>
            <Typography variant="body2" sx={{ ml: 1 }}>{language}</Typography>
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

      

      {/* Модальное окно входа */}
      <Modal open={loginModalOpen} onClose={() => setLoginModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "white",
            boxShadow: 24,
            p: 3,
            borderRadius: "10px",
            minWidth: "300px",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>Login</Typography>
          <TextField fullWidth label="Email" margin="dense" />
          <TextField fullWidth label="Password" type="password" margin="dense" />
          <Button fullWidth variant="contained" sx={{ mt: 2 }}>Sign In</Button>
          <Typography variant="body2" sx={{ mt: 1, cursor: "pointer", color: "blue" }}>Forgot Password?</Typography>
          <Typography variant="body2" sx={{ mt: 1, cursor: "pointer", color: "blue" }}>No account? Sign Up</Typography>
        </Box>
      </Modal>

      {/* Модальное окно выбора города */}
      <Modal open={cityModalOpen} onClose={() => setCityModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "white",
            boxShadow: 24,
            p: 3,
            borderRadius: "10px",
            minWidth: "250px",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>Choose your city</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {["Almaty", "Astana"].map((cityOption) => (
              <MenuItem
                key={cityOption}
                onClick={() => {
                  setCity(cityOption);
                  setCityModalOpen(false);
                }}
                sx={{
                  "&:hover": { color: "#FFA500" },
                  cursor: "pointer",
                }}
              >
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



