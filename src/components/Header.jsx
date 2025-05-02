import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Modal,
  Box,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Badge,
  InputAdornment,
  CircularProgress
} from "@mui/material";
import { FaGlobe, FaMapMarkerAlt, FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LoginModal from "./LoginModal";
import api from "../api/axios";

const Header = ({ isAuthenticated, onLogin, cartItemCount = 0 }) => {
  const [language, setLanguage] = useState("ENG");
  const [city, setCity] = useState(localStorage.getItem("selectedCity") || "Almaty");
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useMediaQuery("(max-width:900px)");

  const location = useLocation();
  const navigate = useNavigate();

  // Поиск клиник с debounce
  useEffect(() => {
    const searchClinics = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.get('/analysis/hospitals/', {
          params: { search: searchQuery }
        });
        
        const clinics = Array.isArray(response.data) 
          ? response.data 
          : response.data?.results || [];
          
        setSearchResults(clinics.map(hospital => ({
          id: hospital.id,
          name: hospital.name,
          type: "clinic"
        })));
      } catch (error) {
        console.error("Error searching clinics:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      searchClinics();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSuccessfulLogin = (token) => {
    onLogin(token);
    setAuthModalOpen(false);
  };

  const navItems = [
    { label: "Home", path: "/" },
    { label: "CheckAI", path: "/checkai" },
    { label: "Catalog of Tests", path: "/catalog-of-tests" },
    { label: "Clinics & Laboratories", path: "/clinics" },
    { label: "Health Tips", path: "/health-tips" },
    { label: "Help & Support", path: "/help-support" },
    { label: "Cart", path: "/cart" }
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    navigate(`/clinics?search=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSearchResultClick = (item) => {
    if (item.type === "clinic") {
      navigate(`/clinic/${item.id}`);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleNavClick = (item) => {
    if (item.path === "/help-support") {
      if (location.pathname !== "/") {
        navigate("/");
      }
      setTimeout(() => {
        const element = document.getElementById("help-support");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      navigate(item.path);
    }
    setDrawerOpen(false);
  };

  const handleAvatarClick = () => {
    navigate("/profile");
  };

  const handleCartClick = () => {
    navigate("/cart");
  };

  return (
    <>
      <AppBar position="sticky" sx={{ 
        backgroundColor: "#001A00", 
        p: isMobile ? 0 : 1, 
        top: 0, 
        width: "100%", 
        zIndex: 1000,
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <Toolbar sx={{ 
          minHeight: "20px", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          flexDirection: isMobile ? "row" : "row",
          padding: isMobile ? "8px 0" : "inherit"
        }}>
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton 
              color="inherit" 
              onClick={() => setDrawerOpen(true)} 
              sx={{ mr: 1 }}
            >
              <FaBars />
            </IconButton>
          )}

          {/* Logo */}
          <Box 
            sx={{ 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "center",
              flexGrow: isMobile ? 1 : 0,
              textAlign: isMobile ? "center" : "left",
              cursor: "pointer"
            }}
            onClick={() => navigate("/")}
          >
            <Typography 
              variant={isMobile ? "h6" : "h4"} 
              sx={{ 
                fontWeight: "bold", 
                lineHeight: 1,
                color: "#FFFFFF"
              }}
            >
              MedHelper
            </Typography>
            {!isMobile && (
              <Typography variant="caption" sx={{ 
                opacity: 0.8, 
                mt: 0.5,
                color: "rgba(255,255,255,0.7)"
              }}>
                Easier appointments. Smarter diagnoses. Powered by AI.
              </Typography>
            )}
          </Box>

          {/* Search bar (desktop) */}
          {!isMobile && (
            <Box sx={{ 
              position: 'relative', 
              width: "40%", 
              ml: "-20px",
              minWidth: 300
            }}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search clinics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                sx={{
                  backgroundColor: "white",
                  borderRadius: "20px",
                  width: "100%",
                  "& .MuiOutlinedInput-root": { 
                    borderRadius: "20px", 
                    border: "none", 
                    boxShadow: "none", 
                    "& fieldset": { border: "none" } 
                  },
                  "& .MuiInputBase-input": { 
                    padding: "10px 15px",
                    fontSize: "0.9rem"
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton 
                        onClick={handleSearch} 
                        edge="start"
                        size="small"
                      >
                        <FaSearch style={{ color: "gray" }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <>
                      {isLoading && (
                        <CircularProgress 
                          size={20} 
                          sx={{ color: "rgba(0,0,0,0.5)", mr: 1 }} 
                        />
                      )}
                      {searchQuery && (
                        <IconButton 
                          onClick={() => setSearchQuery("")} 
                          size="small"
                          sx={{ mr: 0.5 }}
                        >
                          <FaTimes style={{ fontSize: "14px", color: "gray" }} />
                        </IconButton>
                      )}
                    </>
                  )
                }}
              />
              
              {/* Search results dropdown */}
              {searchResults.length > 0 && (
                <Box sx={{
                  position: 'absolute',
                  width: '100%',
                  bgcolor: 'white',
                  boxShadow: 3,
                  borderRadius: 1,
                  mt: 0.5,
                  zIndex: 1001,
                  maxHeight: '300px',
                  overflow: 'auto',
                  border: "1px solid rgba(0,0,0,0.1)"
                }}>
                  <List dense>
                    {searchResults.map((item) => (
                      <ListItem 
                        button 
                        key={item.id}
                        onClick={() => handleSearchResultClick(item)}
                        sx={{ 
                          '&:hover': { 
                            bgcolor: '#f5f5f5' 
                          },
                          px: 2,
                          py: 1
                        }}
                      >
                        <ListItemText 
                          primary={item.name} 
                          primaryTypographyProps={{ 
                            fontSize: "0.9rem",
                            fontWeight: 500
                          }}
                          secondary="Clinic" 
                          secondaryTypographyProps={{
                            fontSize: "0.75rem"
                          }}
                          sx={{ color: 'black' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}

          {/* Right side icons */}
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: isMobile ? "5px" : "10px",
            marginLeft: isMobile ? "auto" : 0
          }}>
            {/* Location (desktop) */}
            {!isMobile && (
              <>
                <IconButton 
                  color="inherit" 
                  onClick={() => setCityModalOpen(true)} 
                  sx={{ "&:hover": { color: "#FFA500" } }}
                >
                  <FaMapMarkerAlt />
                </IconButton>
                <Typography variant="body2" sx={{ color: "white" }}>
                  {city}
                </Typography>
              </>
            )}

            {/* Language selector */}
            <IconButton 
              color="inherit" 
              sx={{ "&:hover": { color: "#FFA500" } }}
            >
              <FaGlobe />
            </IconButton>
            {!isMobile && (
              <Typography variant="body2" sx={{ color: "white" }}>
                {language}
              </Typography>
            )}

            {/* Cart */}
            {isAuthenticated && (
              <IconButton 
                color="inherit" 
                onClick={handleCartClick} 
                sx={{ "&:hover": { color: "#FFA500" } }}
              >
                <Badge 
                  badgeContent={cartItemCount} 
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      right: 5,
                      top: 5,
                      border: `2px solid #001A00`,
                    }
                  }}
                >
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            )}

            {/* Auth */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.3 }}
            >
              {isAuthenticated ? (
                <IconButton 
                  color="inherit" 
                  onClick={handleAvatarClick} 
                  sx={{ "&:hover": { color: "#FFA500" } }}
                >
                  <motion.div whileHover={{ scale: 1.1 }}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: "#FFA500", 
                        fontSize: 14,
                        fontWeight: "bold"
                      }}
                    >
                      U
                    </Avatar>
                  </motion.div>
                </IconButton>
              ) : (
                <Button 
                  color="inherit" 
                  onClick={() => setAuthModalOpen(true)} 
                  sx={{ 
                    "&:hover": { 
                      color: "#FFA500",
                      backgroundColor: "rgba(255,255,255,0.1)"
                    }, 
                    fontSize: isMobile ? "0.75rem" : "inherit",
                    borderRadius: "20px",
                    px: 2
                  }}
                >
                  {isMobile ? "Login" : "Log In"}
                </Button>
              )}
            </motion.div>

            {/* Location (mobile) */}
            {isMobile && (
              <IconButton 
                color="inherit" 
                onClick={() => setCityModalOpen(true)} 
                sx={{ "&:hover": { color: "#FFA500" } }}
              >
                <FaMapMarkerAlt />
              </IconButton>
            )}
          </Box>
        </Toolbar>

        {/* Desktop navigation */}
        {!isMobile && (
          <Toolbar sx={{ 
            justifyContent: "center", 
            minHeight: "40px",
            backgroundColor: "rgba(0,0,0,0.1)"
          }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                onClick={() => handleNavClick(item)}
                sx={{
                  borderBottom: location.pathname === item.path ? "2px solid #FFA500" : "none",
                  borderRadius: 0,
                  mx: 1,
                  fontSize: "12px",
                  fontWeight: location.pathname === item.path ? "bold" : "normal",
                  textTransform: "none",
                  paddingY: "5px",
                  "&:hover": { 
                    color: "#FFA500",
                    backgroundColor: "rgba(255,255,255,0.05)"
                  },
                  transition: "all 0.2s ease"
                }}
              >
                {item.label}
              </Button>
            ))}
          </Toolbar>
        )}
      </AppBar>

      {/* Mobile search */}
      {isMobile && (
        <Box sx={{ 
          p: 2, 
          backgroundColor: "#001A00", 
          display: "flex", 
          position: 'relative',
          borderTop: "1px solid rgba(255,255,255,0.1)"
        }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search clinics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{
              backgroundColor: "white",
              borderRadius: "20px",
              "& .MuiOutlinedInput-root": { 
                borderRadius: "20px", 
                border: "none", 
                boxShadow: "none", 
                "& fieldset": { border: "none" } 
              },
              "& .MuiInputBase-input": {
                py: 1,
                fontSize: "0.9rem"
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaSearch style={{ color: "gray" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {isLoading && (
                    <CircularProgress 
                      size={20} 
                      sx={{ 
                        color: "rgba(0,0,0,0.5)", 
                        mr: 1 
                      }} 
                    />
                  )}
                  {searchQuery && (
                    <IconButton 
                      onClick={() => setSearchQuery("")} 
                      size="small"
                      sx={{ mr: 0.5 }}
                    >
                      <FaTimes style={{ fontSize: "14px", color: "gray" }} />
                    </IconButton>
                  )}
                </>
              )
            }}
          />
          
          {/* Mobile search results */}
          {searchResults.length > 0 && (
            <Box sx={{
              position: 'absolute',
              top: '100%',
              left: 16,
              right: 16,
              bgcolor: 'white',
              boxShadow: 3,
              borderRadius: 1,
              mt: 0.5,
              zIndex: 1001,
              maxHeight: '300px',
              overflow: 'auto',
              border: "1px solid rgba(0,0,0,0.1)"
            }}>
              <List dense>
                {searchResults.map((item) => (
                  <ListItem 
                    button 
                    key={item.id}
                    onClick={() => handleSearchResultClick(item)}
                    sx={{ 
                      '&:hover': { 
                        bgcolor: '#f5f5f5' 
                      },
                      px: 2,
                      py: 1
                    }}
                  >
                    <ListItemText 
                      primary={item.name} 
                      primaryTypographyProps={{ 
                        fontSize: "0.9rem",
                        fontWeight: 500
                      }}
                      secondary="Clinic" 
                      secondaryTypographyProps={{
                        fontSize: "0.75rem"
                      }}
                      sx={{ color: 'black' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      )}

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": { 
            width: 280, 
            backgroundColor: "#001A00", 
            color: "white" 
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">MedHelper</Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Easier appointments. Smarter diagnoses.
          </Typography>
        </Box>
        <Divider sx={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
        <List>
          {navItems.map((item) => (
            <ListItem
              button
              key={item.path}
              onClick={() => handleNavClick(item)}
              sx={{
                borderLeft: location.pathname === item.path ? "4px solid #FFA500" : "none",
                "&:hover": { 
                  color: "#FFA500",
                  backgroundColor: "rgba(255,255,255,0.05)"
                },
                py: 1.5
              }}
            >
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{
                  fontSize: "0.95rem"
                }}
              />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
        <Box sx={{ p: 2 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 1,
              mb: 1
            }}
          >
            <FaMapMarkerAlt />
            {city}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 1
            }}
          >
            <FaGlobe />
            {language}
          </Typography>
        </Box>
      </Drawer>

      {/* Login modal */}
      <LoginModal 
        open={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onLogin={handleSuccessfulLogin} 
      />

      {/* City selection modal */}
      <Modal open={cityModalOpen} onClose={() => setCityModalOpen(false)}>
        <Box sx={{ 
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
          width: isMobile ? "80%" : "auto"
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Choose your city</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {["Almaty", "Nur-Sultan", "Shymkent"].map((cityOption) => (
              <MenuItem 
                key={cityOption} 
                onClick={() => { 
                  setCity(cityOption); 
                  setCityModalOpen(false); 
                  localStorage.setItem("selectedCity", cityOption);
                }} 
                sx={{ 
                  "&:hover": { 
                    color: "#FFA500",
                    backgroundColor: "rgba(0,26,0,0.05)"
                  }, 
                  cursor: "pointer",
                  borderRadius: 1
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