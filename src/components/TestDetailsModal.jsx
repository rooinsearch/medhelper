import React, { useState } from 'react';
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
import api from '../api/axios';

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

const availableDates = ['2024-06-15', '2024-06-16', '2024-06-17', '2024-06-18'];
const availableTimes = ['08:00', '09:30', '11:00', '13:00', '14:30', '16:00'];

// Default test object with all necessary properties
const defaultTest = {
  id: null,
  title: '',
  description: '',
  about: '',
  preparation: [],
  price: 0,
  lab: '',
  ready: ''
};

const TestDetailsModal = ({ open, handleClose, test, onCartUpdate }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  // Use the provided test or fallback to defaultTest
  const currentTest = test || defaultTest;

  const handleTakeNow = () => {
    setActiveTab('schedule');
  };

  const handleAddToCart = async () => {
    if (!selectedDate || !selectedTime) {
      setSnackbarMessage('Please select date and time');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
  
    if (!currentTest.id) {
      setSnackbarMessage('Invalid test selected');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
  
    setIsLoading(true);
    try {
      // Разделяем дату и время перед отправкой
      const scheduled_date = selectedDate; // "2024-06-18"
      const scheduled_time = `${selectedTime}:00`; // "08:00:00"
  
      await api.post('/cart/add/', {
        analysis_id: currentTest.id,
        scheduled_date,  // Отправляем только дату
        scheduled_time,  // Отправляем только время
        quantity: 1
      });
      
      setSnackbarMessage(`${currentTest.title} added to cart`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      if (onCartUpdate) {
        await onCartUpdate();
      }
      
      handleClose();
    } catch (err) {
      console.error('Add to cart error:', err);
      setSnackbarMessage(err.response?.data?.message || 'Failed to add to cart');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
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
          {Array.isArray(currentTest.preparation) && currentTest.preparation.map((item, index) => (
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
            {(currentTest.price || 0).toLocaleString()} ₸
          </Typography>
        </Box>
      </Box>

      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={handleAddToCart}
        disabled={!selectedDate || !selectedTime || isLoading || !currentTest.id}
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

  if (!open) return null;

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
                {(currentTest.price || 0).toLocaleString()} ₸
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