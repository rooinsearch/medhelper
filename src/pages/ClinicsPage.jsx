import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import {
  Box, Typography, Button, Avatar, Rating, Card, CardContent,
  CardActions, Grid, Paper, Container, TextField, InputAdornment,
  Divider, CircularProgress, Chip
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  ArrowForward as ArrowIcon,
  Search as SearchIcon,
  LocalHospital as ClinicIcon
} from '@mui/icons-material';

const ClinicTestsPreview = ({ tests }) => {
  const previewTests = tests.slice(0, 3);
  
  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={1}>
        {previewTests.map(test => (
          <Grid item xs={12} sm={6} md={4} key={test.id}>
            <Box sx={{ 
              p: 1.5,
              bgcolor: 'rgba(0, 26, 0, 0.02)',
              borderRadius: 1,
              border: '1px solid rgba(0, 26, 0, 0.08)'
            }}>
              <Chip
                label={test.category}
                size="small"
                sx={{
                  mb: 1,
                  bgcolor: 'rgba(0, 26, 0, 0.08)',
                  color: '#001A00'
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {test.title}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <TimeIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                  {test.ready}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {parseFloat(test.price).toLocaleString()} ₸
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
      {tests.length > 3 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          +{tests.length - 3} more tests available
        </Typography>
      )}
    </Box>
  );
};

const ClinicsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [clinics, setClinics] = useState([]);
  const [filteredClinics, setFilteredClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const primaryColor = '#001A00';
  const city = localStorage.getItem("selectedCity") || "Almaty";

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlSearchTerm = searchParams.get('search');
    if (urlSearchTerm) setSearchTerm(urlSearchTerm);
  }, [location.search]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [hospitalsRes, analysisRes, reviewsRes] = await Promise.all([
          api.get('/analysis/hospitals/'),
          api.get('/analysis/'),
          api.get('/analysis/hospital-reviews/')
        ]);

        const clinicsData = hospitalsRes.data.results.map(hospital => ({
          id: hospital.id,
          name: hospital.name,
          logo: hospital.photo,
          address: hospital.address,
          working_time: hospital.working_time,
          tests: analysisRes.data.results.filter(test => test.lab_info?.id === hospital.id),
          rating: calculateAverageRating(reviewsRes.data.results.filter(r => r.hospital === hospital.id)),
          reviewsCount: reviewsRes.data.results.filter(r => r.hospital === hospital.id).length
        }));

        setClinics(clinicsData);
        setFilteredClinics(clinicsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateAverageRating = (reviews) => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return parseFloat((sum / reviews.length).toFixed(1));
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClinics(clinics);
      return;
    }

    const filtered = clinics.filter(clinic => 
      clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.tests.some(test => 
        test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredClinics(filtered);
  }, [searchTerm, clinics]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/clinics?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleClinicClick = (clinicId) => {
    navigate(`/clinics/${clinicId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: primaryColor }}>
        {searchTerm ? `Search results for "${searchTerm}"` : `Clinics in ${city}`}
      </Typography>

      <Paper component="form" onSubmit={handleSearch} sx={{ p: 2, mb: 4, display: 'flex', borderRadius: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search clinics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        <Button type="submit" variant="contained" sx={{ ml: 2, bgcolor: primaryColor }}>
          Search
        </Button>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress sx={{ color: primaryColor }} />
        </Box>
      ) : filteredClinics.length === 0 ? (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            No clinics found
          </Typography>
          <Button variant="outlined" onClick={() => setSearchTerm('')}>
            Clear search
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredClinics.map(clinic => (
            <Grid item xs={12} key={clinic.id}>
              <Card 
                sx={{ 
                  '&:hover': { 
                    boxShadow: 3,
                    cursor: 'pointer' 
                  } 
                }}
                onClick={() => handleClinicClick(clinic.id)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar 
                      src={clinic.logo} 
                      sx={{ 
                        width: 80, 
                        height: 80,
                        bgcolor: 'rgba(0,26,0,0.08)'
                      }}
                    >
                      <ClinicIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {clinic.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Rating value={clinic.rating} precision={0.1} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {clinic.rating} ({clinic.reviewsCount} reviews)
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{clinic.address}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <ClinicTestsPreview tests={clinic.tests} />
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button 
                    endIcon={<ArrowIcon />}
                    sx={{ color: primaryColor }}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ClinicsPage;