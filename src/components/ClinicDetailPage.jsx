import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import {
  Box, Typography, Button, Avatar, Rating, Divider,
  Paper, Grid, Chip, Card, CardContent, CardActions,
  TextField, Fade
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  AccessTime as TimeIcon,
  ArrowBack as BackIcon,
  LocalHospital as ClinicIcon,
  Category as CategoryIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const GradientPaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #001A00 0%, #004D00 100%)',
  color: theme.palette.common.white,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  boxShadow: theme.shadows[4],
}));

const ReviewCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[2],
  },
}));

const TestCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
}));

const ClinicDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [clinic, setClinic] = useState(null);
  const [tests, setTests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const primaryColor = '#001A00';
  const accentColor = '#00C853';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [analysisRes, hospitalsRes, reviewsRes] = await Promise.all([
          api.get('analysis/'),                      // GET /api/analysis/
          api.get('analysis/hospitals/'),            // GET /api/analysis/hospitals/
          api.get('analysis/hospital-reviews/', { params: { hospital: id } }) // GET /api/analysis/hospital-reviews/?hospital=ID
        ]);
        const analyses = analysisRes.data;
        const hospitals = hospitalsRes.data;
        const rv = reviewsRes.data;
        const found = hospitals.find(h => h.id === parseInt(id, 10));
        if (found) {
          setClinic(found);
          setTests(analyses.filter(a => a.lab_info?.id === found.id));
          setReviews(rv);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const submitReview = async e => {
    e.preventDefault();
    if (!newReview.rating || !newReview.comment.trim()) return;
    try {
      await api.post('analysis/hospital-reviews/', {
        hospital: id,
        rating: newReview.rating,
        comment: newReview.comment
      });
      const rres = await api.get('analysis/hospital-reviews/', { params: { hospital: id } });
      setReviews(rres.data);
      setNewReview({ rating: 0, comment: '' });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (!clinic) return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Button variant="contained" startIcon={<BackIcon />} onClick={() => navigate('/clinics')} sx={{ backgroundColor: primaryColor }}>
        Back to clinics list
      </Button>
    </Box>
  );

  const rvCount = reviews.length;
  const avg = rvCount ? (reviews.reduce((sum, r) => sum + r.rating, 0) / rvCount).toFixed(1) : '0.0';

  return (
    <Box sx={{ maxWidth: 1200, m: '0 auto', p: { xs: 2, sm: 3 }, minHeight: '100vh' }}>
      <Button variant="text" startIcon={<BackIcon />} onClick={() => navigate('/clinics')} sx={{ mb: 2, color: primaryColor, textTransform: 'none', fontWeight: 500 }}>
        Back to clinics
      </Button>

      <GradientPaper>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Avatar src={clinic.photo} sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)' }}>
            <ClinicIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'white' }}>{clinic.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Rating
                value={parseFloat(avg)}
                precision={0.1}
                readOnly
                icon={<StarIcon sx={{ color: '#FFD700' }} />}
                emptyIcon={<StarBorderIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />}
              />
              <Typography sx={{ ml: 1.5, color: 'rgba(255,255,255,0.9)' }}>{avg} ({rvCount})</Typography>
            </Box>
          </Box>
        </Box>
      </GradientPaper>

      {/* Address & Hours as Card Grid */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 3
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <LocationIcon color="primary" /> Address & Hours
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: '0px 1px 5px rgba(0,0,0,0.05)'
              }}
            >
              <CardContent>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, mb: 1 }}
                >
                  Address
                </Typography>
                <Typography>{clinic.address}</Typography>

                <Divider sx={{ my: 2 }} />

                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, mb: 1 }}
                >
                  Working Hours
                </Typography>
                <Typography sx={{ fontStyle: 'italic' }}>
                  {clinic.working_time}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>



      {/* Available Tests */}
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ClinicIcon color="primary" /> Available Tests
        </Typography>
        <Grid container spacing={2}>
          {tests.map(test => (
            <Grid item xs={12} sm={6} md={4} key={test.id}>
              <TestCard>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontWeight: 600 }}>{test.title}</Typography>
                    <Typography sx={{ fontWeight: 700, color: primaryColor }}>
                      {parseFloat(test.price).toLocaleString()} ₸
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Chip icon={<TimeIcon fontSize="small" />} label={test.ready} size="small" sx={{ fontSize: '0.75rem' }} />
                    <Chip icon={<CategoryIcon fontSize="small" />} label={test.category} size="small" sx={{ fontSize: '0.75rem' }} />
                  </Box>
                </CardContent>
              </TestCard>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Reviews */}
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <StarIcon color="primary" /> Patient Reviews
        </Typography>

        {/* New Review Form */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.02)' }}>
          <Typography sx={{ mb: 2, fontWeight: 600 }}>Leave Your Review</Typography>
          <Box component="form" onSubmit={submitReview}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>Your Rating:</Typography>
              <Rating
                value={newReview.rating}
                onChange={(e, v) => setNewReview({ ...newReview, rating: v })}
                precision={1}
                icon={<StarIcon sx={{ color: '#FFD700' }} />}
                emptyIcon={<StarBorderIcon sx={{ color: 'rgba(0,0,0,0.26)' }} />}
              />
            </Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="Share your experience with this clinic..."
              value={newReview.comment}
              onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SendIcon />}
                disabled={!newReview.rating || !newReview.comment.trim()}
                sx={{
                  backgroundColor: primaryColor,
                  '&:hover': { backgroundColor: '#003300' },
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                Submit Review
              </Button>
            </Box>
            <Fade in={submitted}>
              <Typography sx={{ mt: 1, color: accentColor, fontWeight: 500, textAlign: 'center' }}>
                Thank you! Your review has been submitted.
              </Typography>
            </Fade>
          </Box>
        </Paper>

        {/* Existing Reviews */}
        {reviews.length > 0 ? (
          reviews.map(review => (
            <ReviewCard key={review.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: '#E8F5E9', mr: 2 }}>
                      {review.user_email.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>{review.user_email}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(review.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Rating
                    value={review.rating}
                    readOnly
                    size="small"
                    icon={<StarIcon sx={{ color: '#FFD700' }} />}
                    emptyIcon={<StarBorderIcon sx={{ color: 'rgba(0,0,0,0.26)' }} />}
                  />
                </Box>
                <Typography sx={{ pl: 6 }}>{review.comment}</Typography>
              </CardContent>
            </ReviewCard>
          ))
        ) : (
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <Typography color="text.secondary">No reviews yet. Be the first to leave one!</Typography>
          </Paper>
        )}
      </Paper>
    </Box>
  );
};

export default ClinicDetailPage;
