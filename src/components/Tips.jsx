import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  Typography, 
  Box, 
  Button, 
  Collapse, 
  Skeleton,
  useMediaQuery,
  useTheme,
  IconButton
} from "@mui/material";
import { ExpandMore, LightbulbOutlined, Whatshot, Close } from "@mui/icons-material";
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
  const [loading, setLoading] = useState({ tips: true, articles: true });
  const [error, setError] = useState(null);
  const [isExpandedMobile, setIsExpandedMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading({ tips: true, articles: true });
        const [tipsResponse, popularResponse] = await Promise.all([
          api.get('/health-tips/').catch(e => ({ data: [] })),
          api.get('/articles/popular/').catch(e => ({ data: [] }))
        ]);

        setTips(tipsResponse.data.slice(0, isMobile ? 2 : 3));
        setPopularArticles(popularResponse.data.slice(0, isMobile ? 1 : 2));
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
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        width: "100%",
        maxHeight: isExpandedMobile ? "90vh" : "50vh",
        height: "auto",
        zIndex: 1300,
        borderRadius: "16px 16px 0 0",
        boxShadow: "0 -4px 12px rgba(0,0,0,0.2)",
        transform: `translateY(${isExpandedMobile ? '0' : 'calc(100% - 56px)'})`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      };
    }
    
    if (isTablet) {
      return {
        position: "absolute",
        right: "20px",
        top: "20px",
        width: "250px",
        height: "calc(100vh - 40px)",
        zIndex: 1000
      };
    }
    
    return {
      position: "absolute",
      left: "20px",
      top: "1px",
      width: "280px",
      height: "calc(105vh - 40px)",
      zIndex: 1000
    };
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
      "&::-webkit-scrollbar": { display: "none" }
    }}>
      <Box sx={{
        backgroundColor: "rgba(63, 78, 61, 0.95)",
        borderRadius: isMobile ? "16px 16px 0 0" : "8px",
        p: isMobile ? 1 : 2,
        height: "100%",
        position: "relative"
      }}>
        {isMobile && (
          <Box sx={{
            position: "sticky",
            top: 0,
            bgcolor: "rgba(63, 78, 61, 0.95)",
            zIndex: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1,
            borderBottom: "1px solid rgba(255,255,255,0.1)"
          }}>
            <Typography variant="subtitle1" color="white" sx={{ display: "flex", alignItems: "center" }}>
              <LightbulbOutlined sx={{ mr: 1, fontSize: "1.2rem" }} />
              Health Tips
            </Typography>
            <IconButton 
              onClick={() => setIsExpandedMobile(!isExpandedMobile)}
              sx={{ color: "white" }}
            >
              {isExpandedMobile ? <Close /> : <ExpandMore />}
            </IconButton>
          </Box>
        )}

        {!isMobile && (
          <Typography variant="h6" fontWeight="bold" textAlign="center" mb={2} color="white"
            sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <LightbulbOutlined fontSize="medium" sx={{ color: "white" }} />
            Weekly Health Tips
          </Typography>
        )}

        <Box sx={{ mb: isMobile ? 1 : 3 }}>
          <Typography 
            variant={isMobile ? "body2" : "subtitle1"} 
            fontWeight="bold" 
            color="white"
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 1, 
              mb: 1,
              position: isMobile ? "sticky" : "static",
              top: isMobile ? 40 : 0,
              bgcolor: isMobile ? "rgba(63, 78, 61, 0.95)" : "transparent",
              zIndex: 1,
              p: isMobile ? 1 : 0
            }}>
            <Whatshot fontSize={isMobile ? "small" : "medium"} />
            Popular Now
          </Typography>
          
          {loading.articles ? (
            Array(isMobile ? 1 : 2).fill(0).map((_, index) => (
              <Card key={`article-skeleton-${index}`} sx={{ 
                mb: 2, 
                p: 1, 
                borderRadius: 2,
                backgroundColor: "rgba(255,255,255,0.1)"
              }}>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="100%" height={20} />
              </Card>
            ))
          ) : (
            popularArticles.map((article) => (
              <Card 
                key={`popular-${article.id}`}
                sx={{
                  mb: 2,
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: "#fefefe",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  "&:hover": { 
                    transform: isMobile ? "none" : "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                  }
                }} 
                onClick={() => navigate(`/articles/${article.slug}`)}
              >
                <Typography variant="body2" fontWeight="bold">
                  {article.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isMobile ? `${article.excerpt.substring(0, 80)}...` : article.excerpt}
                </Typography>
              </Card>
            ))
          )}
        </Box>

        {loading.tips ? (
          Array(isMobile ? 2 : 3).fill(0).map((_, index) => (
            <Card 
              key={`tip-skeleton-${index}`} 
              sx={{ 
                mb: 2, 
                p: 1, 
                borderRadius: 2,
                backgroundColor: "rgba(255,255,255,0.1)"
              }}>
              <Skeleton variant="text" width="80%" height={24} />
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="60%" height={20} />
            </Card>
          ))
        ) : (
          tips.map((tip) => (
            <Card 
              key={tip.id} 
              sx={{
                mb: 2,
                p: 1,
                borderRadius: 2,
                backgroundColor: "#fefefe",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                transition: "all 0.2s",
                "&:hover": {
                  transform: isMobile ? "none" : "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }
              }}>
              <Typography variant="body2" fontWeight="bold">
                {tip.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isMobile ? `${tip.short_description.substring(0, 100)}...` : tip.short_description}
              </Typography>

              <Collapse in={expandedTip === tip.id}>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  {tip.full_description}
                </Typography>
              </Collapse>

              <Box display="flex" justifyContent="flex-end" mt={1}>
                <Button
                  size="small"
                  onClick={() => toggleTipExpansion(tip.id)}
                  endIcon={<ExpandMore sx={{
                    transform: expandedTip === tip.id ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease"
                  }} />}
                  sx={{
                    textTransform: "none",
                    fontWeight: "bold",
                    fontSize: "0.75rem",
                    color: "primary.main",
                    "&:hover": { color: "primary.dark" }
                  }}>
                  {expandedTip === tip.id ? "Hide" : "Read More"}
                </Button>
              </Box>
            </Card>
          ))
        )}

        {!isMobile && (
          <Typography 
            variant="body2" 
            color="white" 
            fontWeight="bold" 
            textAlign="center" 
            sx={{ 
              mt: 2, 
              cursor: "pointer", 
              "&:hover": { textDecoration: "underline" } 
            }} 
            onClick={() => navigate("/health-tips")}
          >
            See more Health Tips →
          </Typography>
        )}
      </Box>
    </Box>
  );
}