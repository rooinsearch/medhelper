import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Button, Card, Container, CardContent, CardActions, 
  Dialog, DialogContent, DialogTitle, Grid, IconButton, 
  Menu, MenuItem, Pagination, Typography, CircularProgress,
  Snackbar, Alert, Skeleton
} from '@mui/material';
import { 
  BookmarkBorder as BookmarkBorderIcon, 
  Bookmark as BookmarkIcon,
  ArrowForward as ArrowForwardIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';


const API_URL = 'http://localhost:8000/api';
const api = axios.create({ baseURL: API_URL });

const dataCache = {
  categories: null,
  articles: {},
  savedArticles: null
};


const ArticleCardSkeleton = () => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Skeleton variant="rectangular" height={160} />
    <CardContent sx={{ flexGrow: 1 }}>
      <Skeleton width="40%" />
      <Skeleton width="100%" height={60} />
    </CardContent>
    <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
      <Skeleton width="30%" height={36} />
    </CardActions>
  </Card>
);


const ArticleCard = React.memo(({ article, savedArticles, handleBookmarkClick, handleArticleOpen }) => (
  <Card sx={{ 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column',
    borderRadius: 2,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0px 4px 12px rgba(0,0,0,0.15)'
    }
  }}>
    <Box sx={{ position: 'relative', height: 160 }}>
      <img
        src={article.image}
        alt={article.title}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8
        }}
        loading="lazy"
      />
      <IconButton
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: 'rgba(255,255,255,0.8)',
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleBookmarkClick(article.id);
        }}
      >
        {savedArticles.includes(article.id) ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
      </IconButton>
    </Box>
    <CardContent sx={{ flexGrow: 1 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
        {article.category_name}
      </Typography>
      <Typography variant="h6" component="h3" sx={{ 
        fontWeight: 'bold',
        mb: 1,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {article.title}
      </Typography>
    </CardContent>
    <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
      <Button
        size="small"
        endIcon={<ArrowForwardIcon />}
        onClick={() => handleArticleOpen(article)}
        sx={{ textTransform: 'none', color: '#0c5b3a', fontWeight: 'bold' }}
      >
        Full Article
      </Button>
    </CardActions>
  </Card>
));

const HealthTips = () => {
  // State management
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [savedArticles, setSavedArticles] = useState([]);
  const [openArticle, setOpenArticle] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Show snackbar notification
  const showNotification = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Fetch categories with caching
  const fetchCategories = useCallback(async () => {
    if (dataCache.categories) {
      setCategories(dataCache.categories);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/categories/');
      const data = response.data.results || response.data;
      dataCache.categories = data;
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
      showNotification('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch articles with caching
  const fetchArticles = useCallback(async () => {
    const cacheKey = `${selectedCategory || 'all'}-${currentPage}`;
    
    if (dataCache.articles[cacheKey]) {
      setArticles(dataCache.articles[cacheKey].items);
      setTotalPages(dataCache.articles[cacheKey].totalPages);
      return;
    }

    setLoading(true);
    try {
      let url = `/articles/?page=${currentPage}`;
      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }
      
      const response = await api.get(url);
      const items = response.data.results || response.data;
      const totalPages = Math.ceil(response.data.count / 10) || 1;
      
      dataCache.articles[cacheKey] = { items, totalPages };
      setArticles(items);
      setTotalPages(totalPages);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles');
      showNotification('Failed to load articles', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, currentPage]);

  // Fetch saved articles with caching
  const fetchSavedArticles = useCallback(async () => {
    if (dataCache.savedArticles) {
      setSavedArticles(dataCache.savedArticles);
      return;
    }

    try {
      const response = await api.get('/saved-articles/');
      const saved = response.data.results.map(item => item.article) || [];
      dataCache.savedArticles = saved;
      setSavedArticles(saved);
    } catch (err) {
      console.error('Error fetching saved articles:', err);
      showNotification('Please sign in to save articles', 'info');
    }
  }, []);

  // Initial data loading
  useEffect(() => {
    fetchCategories();
    fetchSavedArticles();
  }, [fetchCategories, fetchSavedArticles]);

  // Fetch articles when category or page changes
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Event handlers
  const handleCategoryMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleCategoryMenuClose = () => setAnchorEl(null);
  
  const handleCategorySelect = (categorySlug) => {
    setSelectedCategory(categorySlug);
    setCurrentPage(1);
    handleCategoryMenuClose();
  };
  
  // Toggle bookmark status
  const handleBookmarkClick = async (articleId) => {
    try {
      await api.post('/saved-articles/toggle/', { article_id: articleId });
      const newSavedArticles = savedArticles.includes(articleId) 
        ? savedArticles.filter(id => id !== articleId) 
        : [...savedArticles, articleId];
      
      setSavedArticles(newSavedArticles);
      dataCache.savedArticles = newSavedArticles;
      
      showNotification(
        savedArticles.includes(articleId) 
          ? 'Article removed from saved' 
          : 'Article saved for later',
        'success'
      );
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      showNotification('Failed to save article. Please try again.', 'error');
    }
  };

  // Open/close article modal
  const handleArticleOpen = async (article) => {
    try {
      // Show basic article data immediately
      setOpenArticle(article);
      
      // Fetch full article details in background
      const response = await api.get(`/articles/${article.slug}/`);
      setOpenArticle(response.data);
    } catch (err) {
      console.error('Error fetching article details:', err);
      showNotification('Failed to load full article content', 'error');
    }
  };
  
  const handleArticleClose = () => setOpenArticle(null);

  // Pagination handler
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get current category name for display
  const getCategoryName = () => {
    if (!selectedCategory) return null;
    const category = categories.find(cat => cat.slug === selectedCategory);
    return category ? category.name : null;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
      {/* Page Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', fontSize: 32 }}>
            Health Tips.
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: 14 }}>
            Your guide to a healthier life, one tip at a time.
          </Typography>
        </Box>
        
        <Button 
          variant="outlined" 
          endIcon={<KeyboardArrowDownIcon />}
          onClick={handleCategoryMenuOpen}
          sx={{ 
            borderRadius: 8, 
            backgroundColor: '#f5f5f5',
            color: '#000',
            border: 'none',
            textTransform: 'none',
            px: 2
          }}
        >
          {selectedCategory ? getCategoryName() : 'All Categories'}
        </Button>

        {/* Category Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCategoryMenuClose}
          sx={{ '& .MuiMenu-paper': { borderRadius: 2, maxHeight: 300, width: 250 } }}
        >
          <MenuItem onClick={() => handleCategorySelect(null)}>
            <Typography sx={{ fontWeight: selectedCategory === null ? 'bold' : 'normal' }}>
              All Categories
            </Typography>
          </MenuItem>
          {categories.map((category) => (
            <MenuItem 
              key={category.id} 
              onClick={() => handleCategorySelect(category.slug)}
              sx={{ 
                backgroundColor: selectedCategory === category.slug ? '#f0f7ff' : 'transparent',
                '&:hover': { backgroundColor: '#f5f5f5' }
              }}
            >
              <Typography sx={{ fontWeight: selectedCategory === category.slug ? 'bold' : 'normal' }}>
                {category.name}
              </Typography>
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Category Title (if selected) */}
      {getCategoryName() && (
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
          {getCategoryName()}
        </Typography>
      )}

      {/* Error state */}
      {error && !loading && (
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
          <Button 
            variant="outlined" 
            onClick={() => {
              setError(null);
              fetchCategories();
              fetchArticles();
            }}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      )}

      {/* Articles Grid */}
      <Grid container spacing={2}>
        {loading ? (
          // Show skeleton loaders while loading
          Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
              <ArticleCardSkeleton />
            </Grid>
          ))
        ) : articles.length > 0 ? (
          articles.map((article) => (
            <Grid item xs={12} sm={6} md={4} key={article.id}>
              <ArticleCard 
                article={article} 
                savedArticles={savedArticles} 
                handleBookmarkClick={handleBookmarkClick}
                handleArticleOpen={handleArticleOpen}
              />
            </Grid>
          ))
        ) : (
          !error && (
            <Box sx={{ py: 3, width: '100%', textAlign: 'center' }}>
              <Typography>No articles found in this category.</Typography>
            </Box>
          )
        )}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      {/* Full Article Modal */}
      <Dialog
        open={openArticle !== null}
        onClose={handleArticleClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        {openArticle && (
          <>
            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid #eee',
              py: 2
            }}>
              <Typography variant="h6" component="div">
                {openArticle.title}
              </Typography>
              <IconButton onClick={handleArticleClose} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <img 
                  src={openArticle.image} 
                  alt={openArticle.title}
                  style={{ 
                    width: '100%', 
                    height: 300, 
                    objectFit: 'cover', 
                    borderRadius: 8,
                    marginBottom: 16
                  }}
                  loading="lazy"
                />
                <Box dangerouslySetInnerHTML={{ __html: openArticle.content }} sx={{ 
                  '& h2': { fontSize: 24, fontWeight: 'bold', mb: 2 },
                  '& h3': { fontSize: 20, fontWeight: 'bold', mt: 3, mb: 1.5 },
                  '& h4': { fontSize: 18, fontWeight: 'bold', mt: 2, mb: 1 },
                  '& p': { mb: 2, lineHeight: 1.6 },
                  '& ul, & ol': { mb: 2, pl: 3 },
                  '& li': { mb: 1 }
                }} />
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Notification Snackbar */}
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
    </Container>
  );
};

export default HealthTips;