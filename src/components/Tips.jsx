import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  Typography, 
  Box, 
  Button, 
  Collapse, 
  CircularProgress,
  Skeleton,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { ExpandMore, LightbulbOutlined, Whatshot } from "@mui/icons-material";
import axios from "axios";

const API_URL = 'http://localhost:8000/api';
const api = axios.create({ 
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export default function HomepageHealthTips() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [expandedTip, setExpandedTip] = useState(null);
  const [tips, setTips] = useState([]);
  const [popularArticles, setPopularArticles] = useState([]);
  const [loading, setLoading] = useState({
    tips: true,
    articles: true
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading({ tips: true, articles: true });
        const [tipsResponse, popularResponse] = await Promise.all([
          api.get('/health-tips/').catch(e => ({ data: [] })),
          api.get('/articles/popular/').catch(e => ({ data: [] }))
        ]);

        setTips(prev => tipsResponse.data.slice(0, isMobile ? 2 : 3) || prev);
        setPopularArticles(prev => popularResponse.data.slice(0, isMobile ? 1 : 2) || prev);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load data');
      } finally {
        setLoading({ tips: false, articles: false });
      }
    };

    fetchData();
  }, [isMobile]);

  const toggleTipExpansion = (tipId) => {
    setExpandedTip(expandedTip === tipId ? null : tipId);
  };

  const getWidgetStyles = () => {
    if (isMobile) {
      return {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        width: "100%",
        height: "auto",
        maxHeight: "50vh",
        zIndex: 1000,
        borderRadius: "16px 16px 0 0",
        boxShadow: "0 -4px 12px rgba(0,0,0,0.1)"
      };
    } else if (isTablet) {
      return {
        position: "absolute",
        right: "20px",
        top: "20px",
        width: "250px",
        height: "calc(100vh - 40px)",
        zIndex: 1000
      };
    } else {
      return {
        position: "absolute",
        left: "20px",
        top: "20px",
        width: "280px",
        height: "calc(100vh - 40px)",
        zIndex: 1000
      };
    }
  };

  if (error && !tips.length && !popularArticles.length) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={() => window.location.reload()} sx={{ mt: 1 }} variant="contained">
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{
      ...getWidgetStyles(),
      overflowY: "auto",
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": { display: "none" },
      transition: "all 0.3s ease"
    }}>
      <Box sx={{
        backgroundColor: "rgba(63, 78, 61, 0.9)",
        borderRadius: isMobile ? "16px 16px 0 0" : "8px",
        p: isMobile ? 1.5 : 2,
        height: "100%"
      }}>
        <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" textAlign="center" mb={2} color="white"
          sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
          <LightbulbOutlined fontSize={isMobile ? "small" : "medium"} sx={{ color: "white" }} />
          {isMobile ? "Health Tips" : "Weekly Health Tips"}
        </Typography>

        {/* Популярные статьи */}
        <Box sx={{ mb: 3 }}>
          <Typography variant={isMobile ? "body2" : "subtitle1"} fontWeight="bold" color="white"
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Whatshot fontSize={isMobile ? "small" : "medium"} />
            Popular Now
          </Typography>
          
          {loading.articles ? (
            Array(isMobile ? 1 : 2).fill(0).map((_, index) => (
              <Card key={`article-skeleton-${index}`} sx={{ mb: 2, p: 1, borderRadius: 2 }}>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="100%" height={20} />
              </Card>
            ))
          ) : (
            popularArticles.map((article) => (
              <Card key={`popular-${article.id}`} sx={{
                mb: 2,
                p: isMobile ? 1 : 1.5,
                borderRadius: 2,
                backgroundColor: "#fefefe",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                cursor: "pointer",
                "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }
              }} onClick={() => navigate(`/articles/${article.slug}`)}>
                <Typography variant={isMobile ? "body2" : "subtitle2"} fontWeight="bold">
                  {article.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isMobile ? `${article.excerpt.substring(0, 60)}...` : article.excerpt}
                </Typography>
              </Card>
            ))
          )}
        </Box>

        {/* Советы по здоровью */}
        {loading.tips ? (
          Array(isMobile ? 2 : 3).fill(0).map((_, index) => (
            <Card key={`tip-skeleton-${index}`} sx={{ mb: 2, p: 1, borderRadius: 2 }}>
              <Skeleton variant="text" width="80%" height={24} />
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="60%" height={20} />
            </Card>
          ))
        ) : (
          tips.map((tip) => (
            <Card key={tip.id} sx={{
              mb: 2,
              p: isMobile ? 1 : 1.5,
              borderRadius: 2,
              backgroundColor: "#fefefe",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              "&:hover": {
                transform: isMobile ? "none" : "scale(1.02)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }
            }}>
              <Typography variant={isMobile ? "body2" : "subtitle2"} fontWeight="bold">
                {tip.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isMobile ? `${tip.short_description.substring(0, 80)}...` : tip.short_description}
              </Typography>

              <Collapse in={expandedTip === tip.id}>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  {tip.full_description}
                </Typography>
              </Collapse>

              <Box display="flex" justifyContent="flex-end" mt={1}>
                <Button size="small" onClick={() => toggleTipExpansion(tip.id)}
                  endIcon={<ExpandMore sx={{
                    transform: expandedTip === tip.id ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease"
                  }} />}
                  sx={{
                    textTransform: "none",
                    fontWeight: "bold",
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    color: "primary.main",
                    "&:hover": { color: "primary.dark" }
                  }}>
                  {expandedTip === tip.id ? "Hide" : "Read More"}
                </Button>
              </Box>
            </Card>
          ))
        )}

        <Typography variant="body2" color="white" fontWeight="bold" textAlign="center" sx={{ 
          mt: 2, cursor: "pointer", "&:hover": { textDecoration: "underline" } 
        }} onClick={() => navigate("/health-tips")}>
          {isMobile ? "More →" : "See more Health Tips →"}
        </Typography>
      </Box>
    </Box>
  );
}