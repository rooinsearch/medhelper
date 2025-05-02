import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Rating,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  TextField,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Container // Добавьте этот импорт
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  ArrowBack as BackIcon,
  LocalHospital as ClinicIcon,
  Star as StarIcon,
  MedicalServices as TestsIcon,
  Info as InfoIcon,
  Send as SendIcon
} from '@mui/icons-material';


const ClinicDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [clinic, setClinic] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const primaryColor = '#001A00';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [hospitalRes, reviewsRes] = await Promise.all([
          api.get(`/analysis/hospitals/${id}/`),
          api.get('/analysis/hospital-reviews/', { params: { hospital: id } })
        ]);

        setClinic(hospitalRes.data);
        setReviews(reviewsRes.data.results || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBack = () => {
    navigate('/clinics');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/analysis/hospital-reviews/', {
        hospital: id,
        rating: newReview.rating,
        comment: newReview.comment
      });
      const response = await api.get('/analysis/hospital-reviews/', { 
        params: { hospital: id } 
      });
      setReviews(response.data.results || []);
      setNewReview({ rating: 0, comment: '' });
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress sx={{ color: primaryColor }} />
      </Box>
    );
  }

  if (!clinic) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Clinic not found</Typography>
        <Button variant="contained" onClick={handleBack} startIcon={<BackIcon />}>
          Back to Clinics
        </Button>
      </Box>
    );
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button 
        startIcon={<BackIcon />} 
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Back to Clinics
      </Button>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Avatar 
              src={clinic.photo} 
              sx={{ 
                width: 100, 
                height: 100,
                bgcolor: 'rgba(0,26,0,0.08)'
              }}
            >
              <ClinicIcon sx={{ fontSize: 50 }} />
            </Avatar>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {clinic.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Rating 
                  value={parseFloat(averageRating)} 
                  precision={0.1} 
                  readOnly 
                  sx={{ mr: 1 }}
                />
                <Typography>
                  {averageRating} ({reviews.length} reviews)
                </Typography>
              </Box>
            </Box>
          </Box>

          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab label="Information" icon={<InfoIcon />} />
            <Tab label="Reviews" icon={<StarIcon />} />
          </Tabs>

          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  <LocationIcon sx={{ mr: 1 }} /> Address
                </Typography>
                <Typography sx={{ mb: 3 }}>{clinic.address}</Typography>
                
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  <TimeIcon sx={{ mr: 1 }} /> Working Hours
                </Typography>
                <Typography>{clinic.working_time}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  <TestsIcon sx={{ mr: 1 }} /> Available Tests
                </Typography>
                {clinic.tests && clinic.tests.length > 0 ? (
                  <Grid container spacing={2}>
                    {clinic.tests.map(test => (
                      <Grid item xs={12} key={test.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography sx={{ fontWeight: 600 }}>{test.title}</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                              <Chip label={test.category} size="small" />
                              <Typography sx={{ fontWeight: 700 }}>
                                {parseFloat(test.price).toLocaleString()} ₸
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography>No tests available</Typography>
                )}
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Box>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Leave a Review
                </Typography>
                <form onSubmit={handleSubmitReview}>
                  <Box sx={{ mb: 2 }}>
                    <Typography component="legend">Your Rating</Typography>
                    <Rating
                      value={newReview.rating}
                      onChange={(e, newValue) => 
                        setNewReview({ ...newReview, rating: newValue })
                      }
                    />
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    label="Your Review"
                    value={newReview.comment}
                    onChange={(e) => 
                      setNewReview({ ...newReview, comment: e.target.value })
                    }
                    sx={{ mb: 2 }}
                  />
                  <Button 
                    type="submit" 
                    variant="contained" 
                    startIcon={<SendIcon />}
                    disabled={!newReview.rating || !newReview.comment.trim()}
                  >
                    Submit Review
                  </Button>
                </form>
              </Paper>

              <Typography variant="h5" sx={{ mb: 3 }}>
                Patient Reviews
              </Typography>
              {reviews.length > 0 ? (
                <List>
                  {reviews.map(review => (
                    <React.Fragment key={review.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>
                            {review.user_name?.charAt(0) || 'U'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Rating value={review.rating} readOnly size="small" />
                                <Typography sx={{ ml: 1 }}>
                                  {review.user_name || 'Anonymous'}
                                </Typography>
                              </Box>
                            </>
                          }
                          secondary={
                            <>
                              <Typography>{review.comment}</Typography>
                              <Typography variant="caption">
                                {new Date(review.created_at).toLocaleDateString()}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography>No reviews yet</Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ClinicDetailPage;