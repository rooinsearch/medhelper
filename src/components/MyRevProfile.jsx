
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Rating,
  Divider,
  Chip,
  IconButton,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import { Delete, Edit, Star, StarBorder } from '@mui/icons-material';
import api from '../api/axios';

const MyRevProfile = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Проверяем, можно ли редактировать отзыв (в течение 24 часов)
  const canEditReview = (reviewDate) => {
    const now = new Date();
    const reviewTime = new Date(reviewDate);
    const hoursDiff = (now - reviewTime) / (1000 * 60 * 60);
    return hoursDiff < 24;
  };

  // Загрузка отзывов с бэкенда
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await api.get('/reviews/my/');
        setReviews(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        showSnackbar('Failed to load reviews', 'error');
      }
    };

    fetchReviews();
  }, []);

  const handleDeleteReview = async (id) => {
    try {
      await api.delete(`/reviews/${id}/`);
      setReviews(prev => prev.filter(review => review.id !== id));
      showSnackbar('Review deleted successfully', 'success');
    } catch (err) {
      showSnackbar('Failed to delete review', 'error');
    }
  };

  const handleEditClick = (review) => {
    if (!canEditReview(review.created_at)) {
      showSnackbar('You can only edit reviews within 24 hours of posting', 'warning');
      return;
    }
    setEditingReview(review);
    setEditComment(review.comment);
    setEditRating(review.rating);
  };

  const handleEditSubmit = async () => {
    try {
      const updatedReview = {
        ...editingReview,
        comment: editComment,
        rating: editRating
      };
      
      const response = await api.put(`/reviews/${editingReview.id}/`, updatedReview);
      
      setReviews(reviews.map(review => 
        review.id === editingReview.id ? response.data : review
      ));
      
      setEditingReview(null);
      showSnackbar('Review updated successfully', 'success');
    } catch (err) {
      showSnackbar('Failed to update review', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress color="success" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="outlined" 
          sx={{ mt: 2, color: '#004d00', borderColor: '#004d00' }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 2,
      height: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 2,
          color: '#001A00',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Star sx={{ mr: 1, color: '#ffc107' }} />
        My Reviews
      </Typography>

      {reviews.length === 0 ? (
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f9f5',
          borderRadius: 1,
          p: 2
        }}>
          <Typography variant="body2" textAlign="center">
            You haven't left any reviews yet.<br />
            Your feedback helps others make better healthcare choices
          </Typography>
        </Box>
        ) : (
        <Box sx={{ 
          flex: 1,
          overflow: 'auto',
          pr: 1,
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#bdbdbd',
            borderRadius: '2px',
          }
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {reviews.map((review) => (
              <Card 
                key={review.id} 
                sx={{ 
                  borderRadius: 1,
                  borderLeft: '3px solid #4caf50',
                  boxShadow: '0 1px 3px rgba(0, 30, 0, 0.1)',
                  mb: 1
                }}
              >
                <CardContent sx={{ p: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="subtitle2"
                        sx={{ 
                          fontWeight: 'bold',
                          color: '#001A00',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: '0.9rem'
                        }}
                      >
                        {review.doctor_name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#004d00',
                          mb: 0.5,
                          fontSize: '0.75rem'
                        }}
                      >
                        {review.doctor_specialty}
                      </Typography>
                      <Chip 
                        label={review.clinic_name} 
                        size="small" 
                        sx={{ 
                          bgcolor: '#e8f5e9', 
                          color: '#004d00',
                          mb: 0.5,
                          height: '22px',
                          fontSize: '0.65rem'
                        }} 
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
                      <Rating
                        value={review.rating}
                        readOnly
                        precision={0.5}
                        size="small"
                        icon={<Star fontSize="small" sx={{ color: '#ffc107' }} />}
                        emptyIcon={<StarBorder fontSize="small" sx={{ color: '#ffc107' }} />}
                      />
                    </Box>
                  </Box>

                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mt: 0.5,
                      color: '#333',
                      fontSize: '0.8rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.3'
                    }}
                  >
                    "{review.comment}"
                  </Typography>

                  <Divider sx={{ my: 0.5 }} />

                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#004d00',
                        fontSize: '0.65rem'
                      }}
                    >
                      Posted {new Date(review.created_at).toLocaleString()}
                      {!canEditReview(review.created_at) && (
                        <Typography component="span" variant="caption" sx={{ color: '#d32f2f', ml: 0.5, fontSize: '0.65rem' }}>
                          (editing expired)
                        </Typography>
                      )}
                    </Typography>
                    
                    <Box>
                      <IconButton 
                        onClick={() => handleEditClick(review)}
                        sx={{ 
                          color: canEditReview(review.created_at) ? '#004d00' : '#9e9e9e',
                          p: 0.3,
                          '& svg': { fontSize: '0.9rem' }
                        }}
                        disabled={!canEditReview(review.created_at)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeleteReview(review.id)}
                        sx={{ 
                          color: '#d32f2f',
                          p: 0.3,
                          '& svg': { fontSize: '0.9rem' }
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Диалог редактирования */}
      <Dialog 
        open={Boolean(editingReview)} 
        onClose={() => setEditingReview(null)} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 1,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              backgroundColor: '#4caf50',
              borderTopLeftRadius: '4px',
              borderBottomLeftRadius: '4px'
            }
          }
        }}
      >
        <DialogTitle sx={{ pl: 3 }}>Edit Review</DialogTitle>
        <DialogContent sx={{ pl: 3 }}>
          <Rating
            value={editRating}
            onChange={(_, newValue) => setEditRating(newValue)}
            precision={0.5}
            sx={{ my: 1 }}
            icon={<Star sx={{ color: '#ffc107' }} />}
            emptyIcon={<StarBorder sx={{ color: '#ffc107' }} />}
          />
          <TextField
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ pl: 3 }}>
          <Button onClick={() => setEditingReview(null)}>Cancel</Button>
          <Button 
            onClick={handleEditSubmit}
            variant="contained"
            sx={{ 
              bgcolor: '#004d00', 
              '&:hover': { bgcolor: '#003300' },
              ml: 1
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyRevProfile;