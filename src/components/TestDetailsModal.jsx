import React, { useState } from 'react';
import {
  Box,
  Modal,
  Typography,
  Button,
  Divider,
  IconButton,
  Rating,
  TextField,
  Stack,
  Avatar,
  Chip,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  Close as CloseIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  Info as InfoIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import api from '../api/axios';  

const primaryColor = '#1a5f1a';
const primaryLight = '#4a8c4a';
const primaryDark = '#003600';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', md: '80%' },
  maxWidth: 800,
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 3,
  overflowY: 'auto',
  p: { xs: 2, md: 4 },
  '&:focus-visible': { outline: 'none' },
  '&::-webkit-scrollbar': { width: '6px' },
  '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '10px' },
  '&::-webkit-scrollbar-thumb': {
    background: primaryColor,
    borderRadius: '10px',
    '&:hover': { background: primaryDark }
  },
  scrollbarWidth: 'thin',
  scrollbarColor: `${primaryColor} #f1f1f1`
};

const defaultTest = {
  title: "Vitamin D (25-OH)",
  description: "A blood test to measure vitamin D levels in your body.",
  lab: "Invivo Clinical Labs",
  labId: "invivo-labs",
  price: 20000,
  ready: "1 day",
  rating: 4.9,
  reviews: 3710,
  about: "This test measures 25-hydroxyvitamin D concentration in blood...",
  preparation: [
    "No fasting required.",
    "Avoid vitamin D supplements 24h before test.",
    "Drink plenty of water before the test.",
    "Inform your doctor about any medications."
  ],
  relatedTests: [
    { name: "Calcium Test", price: 20000, ready: "1 day" },
    { name: "Parathyroid Hormone", price: 20000, ready: "1 day" },
    { name: "Complete Blood Count", price: 25000, ready: "1 day" }
  ],
  reviewsData: [
    {
      name: "Ardak Aruzhan",
      rating: 5,
      text: "Painless test with quick results. The staff was very professional.",
      date: "15 March 2025"
    }
  ]
};

const availableDates = ['2025-04-15', '2025-04-16', '2025-04-17', '2025-04-18', '2025-04-19'];
const availableTimes = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

const TestDetailsModal = ({ open, handleClose, test = {} }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const currentTest = { ...defaultTest, ...test };

  const handleCloseSnackbar = (event, reason) => {
    if (reason !== 'clickaway') setSnackbarOpen(false);
  };

  const showNotification = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleAddToCart = () => {
    setIsLoading(true);
    const requestData = {
      analysis_id: currentTest.id,
      quantity: 1,
      scheduled_date: selectedDate, // формат YYYY-MM-DD
      scheduled_time: selectedTime  // например, "09:00"
    };
    console.log("Sending POST to /cart/add/ with data:", requestData);
    api.post('/cart/add/', requestData)
      .then((res) => {
        console.log("Response from /cart/add/:", res);
        showNotification(`${currentTest.title} added to cart`);
        setIsLoading(false);
        setTimeout(handleClose, 1500);
        if (window.updateCartBadge) window.updateCartBadge();
      })
      .catch((err) => {
        console.error("Error adding to cart:", err);
        showNotification("Error adding to cart", "error");
        setIsLoading(false);
      });
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    showNotification(
      isBookmarked ? 'Removed from favorites' : 'Added to favorites',
      isBookmarked ? 'info' : 'success'
    );
  };

  const handleAddRelatedTest = (relatedTest) => {
    const requestData = {
      analysis_id: relatedTest.id || currentTest.id,
      quantity: 1
    };
    console.log("Sending POST to /cart/add/ for related test with data:", requestData);
    api.post('/cart/add/', requestData)
      .then((res) => {
        console.log("Response from related test add:", res);
        showNotification(`${relatedTest.name} added to cart`);
        if (window.updateCartBadge) window.updateCartBadge();
      })
      .catch((err) => {
        console.error("Error adding related test:", err);
        showNotification("Error adding test", "error");
      });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const navigateToLabPage = () => {
    showNotification(`Opening ${currentTest.lab} page`, 'info');
  };

  const commonButtonStyle = {
    borderColor: primaryLight,
    color: primaryColor,
    '&:hover': {
      borderColor: primaryColor,
      backgroundColor: `${primaryLight}10`
    }
  };

  const tabButtonStyle = (tab) => ({
    borderBottom: activeTab === tab ? '2px solid' : 'none',
    borderColor: primaryColor,
    borderRadius: 0,
    fontWeight: activeTab === tab ? 'bold' : 'normal',
    color: activeTab === tab ? primaryColor : 'text.primary',
    '&:hover': { backgroundColor: `${primaryLight}08` }
  });

  const renderDetailsTab = () => (
    <>
      <Typography paragraph sx={{ lineHeight: 1.7 }}>{currentTest.description}</Typography>
      <Box sx={{
        bgcolor: 'rgba(0, 0, 0, 0.03)',
        p: 3,
        borderRadius: 2,
        borderLeft: `4px solid ${primaryColor}`,
        mb: 3
      }}>
        <Typography variant="subtitle1" fontWeight="bold" mb={1}>About This Test</Typography>
        <Typography paragraph sx={{ lineHeight: 1.7 }}>{currentTest.about}</Typography>
      </Box>
      <Typography variant="subtitle1" fontWeight="bold" mt={3} mb={1}>Preparation Instructions</Typography>
      <Box
        component="ul"
        sx={{
          pl: 2, mb: 3,
          '& li': { mb: 1.5, pl: 1, lineHeight: 1.6 }
        }}
      >
        {currentTest.preparation.map((item, i) => (
          <Box component="li" key={i}>
            <Typography variant="body2">{item}</Typography>
          </Box>
        ))}
      </Box>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" fontWeight="bold" mt={3} mb={2}>
        Frequently Booked Together
      </Typography>
      <Stack spacing={2}>
        {currentTest.relatedTests.map((test, i) => (
          <Box
            key={i}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={2}
            sx={{
              bgcolor: 'rgba(0, 0, 0, 0.02)',
              borderRadius: 1,
              border: '1px solid rgba(0, 0, 0, 0.05)',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.05)', cursor: 'pointer' }
            }}
          >
            <Box>
              <Typography fontWeight="bold">{test.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Results in {test.ready}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography fontWeight="bold" sx={{ color: primaryColor }}>
                {test.price.toLocaleString()} ₸
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleAddRelatedTest(test)}
                sx={commonButtonStyle}
              >
                Add
              </Button>
            </Box>
          </Box>
        ))}
      </Stack>
    </>
  );

  const renderReviewsTab = () => (
    <Box>
      {currentTest.reviewsData && currentTest.reviewsData.length > 0 ? (
        currentTest.reviewsData.map((review, i) => (
          <Box
            key={i}
            mb={3}
            p={3}
            bgcolor="rgba(0, 0, 0, 0.03)"
            borderRadius={2}
            borderLeft={`3px solid ${primaryColor}`}
          >
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar sx={{
                  width: 42,
                  height: 42,
                  bgcolor: `hsl(${i * 70}, 50%, 50%)`,
                  color: 'white'
                }}>
                  {review.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography fontWeight="bold">{review.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {review.date}
                  </Typography>
                </Box>
              </Box>
              <Rating
                value={review.rating}
                readOnly
                precision={0.5}
                size="small"
                sx={{ color: primaryColor }}
              />
            </Box>
            <Typography sx={{ mt: 1.5, lineHeight: 1.7 }}>
              {review.text}
            </Typography>
          </Box>
        ))
      ) : (
        <Typography variant="body1" textAlign="center" p={4}>
          No reviews available yet.
        </Typography>
      )}
      {currentTest.reviews > 0 && (
        <Box textAlign="center" mt={4}>
          <Button variant="outlined" endIcon={<ArrowForwardIcon />} sx={commonButtonStyle}>
            See All {currentTest.reviews.toLocaleString()} Reviews
          </Button>
        </Box>
      )}
    </Box>
  );

  const renderScheduleTab = () => (
    <Box
      p={3}
      bgcolor="rgba(0, 0, 0, 0.03)"
      borderRadius={2}
      borderLeft={`4px solid ${primaryColor}`}
    >
      <Typography variant="subtitle1" fontWeight="bold" mb={3}>
        Choose Date and Time
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={4}>
        <TextField
          select
          fullWidth
          label="Date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputProps={{
            startAdornment: <CalendarTodayIcon color="action" sx={{ mr: 1 }} />
          }}
          SelectProps={{ native: true, sx: { '& option': { padding: '10px' } } }}
          sx={{
            '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: primaryColor },
            '& .MuiInputLabel-root.Mui-focused': { color: primaryColor }
          }}
          helperText="Select available date"
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
          InputProps={{
            startAdornment: <AccessTimeIcon color="action" sx={{ mr: 1 }} />
          }}
          SelectProps={{ native: true, sx: { '& option': { padding: '10px' } } }}
          sx={{
            '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: primaryColor },
            '& .MuiInputLabel-root.Mui-focused': { color: primaryColor }
          }}
          helperText="Select preferred time slot"
        >
          <option value="">Select time</option>
          {availableTimes.map(time => (
            <option key={time} value={time}>{time}</option>
          ))}
        </TextField>
      </Stack>
      <Box
        bgcolor="white"
        p={3}
        borderRadius={2}
        mb={3}
        boxShadow="0px 2px 8px rgba(0, 0, 0, 0.1)"
      >
        <Typography variant="subtitle2" color="text.secondary" mb={2}>
          Order Summary
        </Typography>
        {['Test', 'Lab', 'Date', 'Time'].map((label) => (
          <Box key={label} display="flex" justifyContent="space-between" mb={1.5}>
            <Typography>{label}:</Typography>
            <Typography fontWeight="medium">
              {label === 'Test' ? currentTest.title :
               label === 'Lab' ? currentTest.lab :
               label === 'Date' ? (selectedDate ? formatDate(selectedDate) : '—') :
               selectedTime || '—'}
            </Typography>
          </Box>
        ))}
        <Divider sx={{ my: 2 }} />
        <Box display="flex" justifyContent="space-between">
          <Typography fontWeight="bold">Total:</Typography>
          <Typography fontWeight="bold" sx={{ color: primaryColor }}>
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
        startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <ShoppingCartIcon />}
        sx={{
          py: 1.5,
          backgroundColor: primaryColor,
          '&:hover': { backgroundColor: primaryDark },
          '&:disabled': { backgroundColor: '#e0e0e0' }
        }}
      >
        {isLoading ? 'Processing...' : 'Add to Cart'}
      </Button>
    </Box>
  );

  return (
    <>
      <Modal open={open} onClose={handleClose} aria-labelledby="test-modal">
        <Box sx={modalStyle}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {currentTest.title}
              </Typography>
              <Box display="flex" alignItems="center" flexWrap="wrap" gap={1} mb={2}>
                <Rating
                  value={currentTest.rating}
                  precision={0.1}
                  readOnly
                  size="small"
                  sx={{ color: primaryColor }}
                />
                <Typography variant="body2" color="text.secondary">
                  {currentTest.rating} ({currentTest.reviews.toLocaleString()} reviews)
                </Typography>
                <Chip
                  label={currentTest.lab}
                  size="small"
                  variant="outlined"
                  sx={{ ...commonButtonStyle, cursor: 'pointer' }}
                  icon={<InfoIcon fontSize="small" sx={{ color: primaryColor }} />}
                  onClick={navigateToLabPage}
                  clickable
                />
              </Box>
            </Box>
            <Box>
              <IconButton onClick={toggleBookmark} sx={{ color: isBookmarked ? primaryColor : 'inherit' }}>
                {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              </IconButton>
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h5" sx={{ color: primaryColor }} fontWeight="bold">
                {currentTest.price.toLocaleString()} ₸
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Results ready in {currentTest.ready}
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                onClick={toggleBookmark}
                sx={commonButtonStyle}
                startIcon={
                  isBookmarked
                    ? <FavoriteIcon sx={{ color: primaryColor }} />
                    : <FavoriteBorderIcon />
                }
              >
                {isBookmarked ? 'Saved' : 'Save'}
              </Button>
              <Button
                variant="contained"
                onClick={() => setActiveTab('schedule')}
                startIcon={<CalendarTodayIcon />}
                sx={{
                  backgroundColor: primaryColor,
                  '&:hover': { backgroundColor: primaryDark }
                }}
              >
                Book Now
              </Button>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box display="flex" gap={2} mb={3} borderBottom={1} borderColor="divider">
            <Button variant="text" onClick={() => setActiveTab('details')} sx={tabButtonStyle('details')}>
              Details
            </Button>
            <Button variant="text" onClick={() => setActiveTab('reviews')} sx={tabButtonStyle('reviews')}>
              Reviews ({currentTest.reviews.toLocaleString()})
            </Button>
            <Button variant="text" onClick={() => setActiveTab('schedule')} sx={tabButtonStyle('schedule')}>
              Schedule
            </Button>
          </Box>

          {activeTab === 'details' && renderDetailsTab()}
          {activeTab === 'reviews' && renderReviewsTab()}
          {activeTab === 'schedule' && renderScheduleTab()}
        </Box>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          variant="filled"
          sx={{
            width: '100%',
            backgroundColor: snackbarSeverity === 'success' ? primaryColor : undefined
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TestDetailsModal;
