import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Modal,
  Typography,
  Button,
  Divider,
  IconButton,
  TextField,
  Stack,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Close as CloseIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  Info as InfoIcon,
  ShoppingCart as ShoppingCartIcon,
  Check as CheckIcon,
  LocalHospital as HospitalIcon,
  Science as ScienceIcon,
  AccessTimeFilled as TimeIcon
} from '@mui/icons-material';

// Colors
const primaryColor = '#4a8c4a';
const secondaryColor = '#001A00';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', sm: '90%', md: '800px' },
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 3,
  overflowY: 'auto',
  p: { xs: 2, md: 3 },
  '&::-webkit-scrollbar': { width: '8px' },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: primaryColor,
    borderRadius: '4px'
  }
};

// Mock data
const defaultTest = {
  id: 1,
  title: "Complete Blood Count (CBC)",
  description: "A comprehensive blood test that evaluates your overall health and detects a wide range of disorders, including anemia, infection, and leukemia.",
  lab: "BioLab Diagnostics",
  price: 4500,
  ready: "1-2 days",
  about: `The Complete Blood Count (CBC) is one of the most commonly ordered blood tests. It provides a detailed analysis of the cellular components in your blood:

• White Blood Cells (WBCs): 4,500-11,000 cells/mcL
  - Fight infections and diseases
  - Includes neutrophils, lymphocytes, monocytes
  
• Red Blood Cells (RBCs): 4.5-5.9 million cells/mcL
  - Carry oxygen throughout the body
  - Contains hemoglobin (12-16 g/dL for women, 13-18 g/dL for men)
  
• Platelets: 150,000-450,000/mcL
  - Essential for blood clotting
  - Abnormal counts may indicate bleeding disorders

This test helps diagnose conditions like:
- Anemia
- Infections
- Blood cancers
- Immune system disorders`,
  preparation: [
    "Fasting for 8-12 hours is required (water is allowed)",
    "Avoid strenuous exercise for 24 hours before the test",
    "Continue taking prescribed medications unless instructed otherwise",
    "Stay well hydrated before your blood draw",
    "Wear loose-fitting clothing for easy access to your arm"
  ]
};

const availableDates = ['2024-06-15', '2024-06-16', '2024-06-17', '2024-06-18'];
const availableTimes = ['08:00', '09:30', '11:00', '13:00', '14:30', '16:00'];

const TestDetailsModal = ({ open, handleClose, test = {}, isAuthenticated }) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  const currentTest = { ...defaultTest, ...test };

  const handleTakeNow = () => {
    if (!isAuthenticated) {
      setSnackbarMessage('Please login to schedule a test');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    setActiveTab('schedule');
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setSnackbarMessage('Please login to add tests to your cart');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (!selectedDate || !selectedTime) {
      setSnackbarMessage('Please select date and time');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setSnackbarMessage(`${currentTest.title} added to cart`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setIsLoading(false);
      setTimeout(handleClose, 1500);
    }, 1000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { weekday: 'short', day: 'numeric', month: 'long' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const DetailSection = ({ title, children, icon }) => (
    <Box sx={{ mb: 3 }}>
      <Box display="flex" alignItems="center" mb={1.5}>
        {React.cloneElement(icon, { sx: { color: primaryColor } })}
        <Typography variant="h6" fontWeight="bold" sx={{ ml: 1, color: primaryColor }}>
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );

  const renderDetailsTab = () => (
    <>
      <DetailSection
        title="Test Description"
        icon={<ScienceIcon />}
      >
        <Typography paragraph sx={{ lineHeight: 1.7, fontSize: '1.05rem' }}>
          {currentTest.description}
        </Typography>
      </DetailSection>

      <DetailSection
        title="About This Test"
        icon={<InfoIcon />}
      >
        <Box
          sx={{
            bgcolor: 'rgba(0, 26, 0, 0.05)',
            p: 3,
            borderRadius: 2,
            borderLeft: `4px solid ${secondaryColor}`
          }}
        >
          <Typography sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>
            {currentTest.about}
          </Typography>
        </Box>
      </DetailSection>

      <DetailSection
        title="Preparation Instructions"
        icon={<HospitalIcon />}
      >
        <List dense>
          {currentTest.preparation.map((item, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckIcon fontSize="small" sx={{ color: secondaryColor }} />
              </ListItemIcon>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
      </DetailSection>
    </>
  );

  const renderScheduleTab = () => (
    <Box>
      <Typography variant="h6" fontWeight="bold" mb={3} sx={{ color: primaryColor }}>
        Schedule Your Test
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
        <TextField
          select
          fullWidth
          label="Date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          SelectProps={{ native: true }}
          InputProps={{
            startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: secondaryColor }} />
          }}
          sx={{
            '& .MuiOutlinedInput-root.Mui-focused fieldset': {
              borderColor: primaryColor
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: primaryColor
            }
          }}
        >
          <option value="">Select date</option>
          {availableDates.map(date => (
            <option key={date} value={date}>
              {formatDate(date)}
            </option>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          label="Time"
          value={selectedTime}
          disabled={!selectedDate}
          onChange={(e) => setSelectedTime(e.target.value)}
          SelectProps={{ native: true }}
          InputProps={{
            startAdornment: <TimeIcon sx={{ mr: 1, color: secondaryColor }} />
          }}
          sx={{
            '& .MuiOutlinedInput-root.Mui-focused fieldset': {
              borderColor: primaryColor
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: primaryColor
            }
          }}
        >
          <option value="">Select time</option>
          {availableTimes.map(time => (
            <option key={time} value={time}>{time}</option>
          ))}
        </TextField>
      </Stack>

      <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" mb={2} sx={{ color: secondaryColor }}>
          Appointment Summary
        </Typography>
        
        <Box sx={{ '& > div': { display: 'flex', justifyContent: 'space-between', mb: 1.5 } }}>
          <Box>
            <Typography>Test:</Typography>
            <Typography fontWeight="medium">{currentTest.title}</Typography>
          </Box>
          <Box>
            <Typography>Lab:</Typography>
            <Typography fontWeight="medium">{currentTest.lab}</Typography>
          </Box>
          <Box>
            <Typography>Date:</Typography>
            <Typography fontWeight="medium">
              {selectedDate ? formatDate(selectedDate) : 'Not selected'}
            </Typography>
          </Box>
          <Box>
            <Typography>Time:</Typography>
            <Typography fontWeight="medium">
              {selectedTime || 'Not selected'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6">Price:</Typography>
          <Typography variant="h6" fontWeight="bold" color={primaryColor}>
            {currentTest.price.toLocaleString()} ₸
          </Typography>
        </Box>
      </Box>

      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={handleAddToCart}
        disabled={!selectedDate || !selectedTime || isLoading}
        startIcon={isLoading ? <CircularProgress size={24} /> : <ShoppingCartIcon />}
        sx={{
          py: 1.5,
          backgroundColor: primaryColor,
          '&:hover': { backgroundColor: secondaryColor },
          '&:disabled': { opacity: 0.7 }
        }}
      >
        {isLoading ? 'Adding...' : 'Add to Cart'}
      </Button>
    </Box>
  );

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h5" fontWeight="bold" color={primaryColor}>
                {currentTest.title}
              </Typography>
              <Box display="flex" alignItems="center" flexWrap="wrap" gap={1} mt={1}>
                <Chip
                  label={currentTest.lab}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: primaryColor, color: primaryColor }}
                />
              </Box>
            </Box>
            <IconButton onClick={handleClose} sx={{ color: 'text.secondary' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h5" color={primaryColor} fontWeight="bold">
                {currentTest.price.toLocaleString()} ₸
              </Typography>
              <Typography variant="body2" display="flex" alignItems="center">
                <TimeIcon fontSize="small" sx={{ mr: 0.5, color: primaryColor }} />
                Turnaround: {currentTest.ready}
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={handleTakeNow}
              sx={{
                backgroundColor: primaryColor,
                '&:hover': { backgroundColor: secondaryColor }
              }}
            >
              Take Now
            </Button>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Box display="flex">
              <Button
                onClick={() => setActiveTab('details')}
                sx={{
                  ...(activeTab === 'details' && {
                    color: primaryColor,
                    borderBottom: `2px solid ${primaryColor}`,
                    fontWeight: 'bold'
                  }),
                  mr: 2,
                  textTransform: 'none',
                  color: 'text.primary'
                }}
              >
                Details
              </Button>
              <Button
                onClick={() => setActiveTab('schedule')}
                sx={{
                  ...(activeTab === 'schedule' && {
                    color: primaryColor,
                    borderBottom: `2px solid ${primaryColor}`,
                    fontWeight: 'bold'
                  }),
                  textTransform: 'none',
                  color: 'text.primary'
                }}
              >
                Schedule
              </Button>
            </Box>
          </Box>

          {activeTab === 'details' && renderDetailsTab()}
          {activeTab === 'schedule' && renderScheduleTab()}
        </Box>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TestDetailsModal;