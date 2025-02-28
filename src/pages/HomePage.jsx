import React, { useState } from 'react';
import {
  Typography,
  Button,
  Grid,
  Card,
  Box,
  IconButton,
  Avatar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from 'react-router-dom';

const healthTips = [
  {
    id: 1,
    username: "janymgul_",
    avatar: "/images/avatar1.png",
    title: "Headache or Migraine?",
    description: 
      "How to tell the difference between a headache, pain, or migraine: \n" +
      "✓ Duration: A migraine can last from 4-72 hours, while a headache typically lasts 30 minutes to a few hours \n" +
      "✓ Pain type: A migraine causes pulsating pain, while a headache causes pressure-like pain \n" ,
  
    likes: 190,
    comments: 50,
  },
  {
    id: 2,
    username: "ademizhann",
    avatar: "/images/avatar2.png",
    title: "How to Protect Your Heart?",
    description: 
      "✓ Walk 10,000 steps a day for better heart health \n" +
      "✓ Avoid smoking \n" +
      "✓ Manage stress (breathing exercises) \n" ,
    likes: 131,
    comments: 87,
  },
  {
    id: 3,
    username: "rdkaruzhan",
    avatar: "/images/avatar3.png",
    title: "The Importance of Water",
    description: 
      "Adults need 2-3 liters of water per day \n" +
      "✓ Dehydration causes fatigue and headaches \n" +
      "✓ Drink one or more water before meals \n" ,
    likes: 240,
    comments: 70,
  },
];

function HomePage() {
  const navigate = useNavigate();
  const [likes, setLikes] = useState(healthTips.map(tip => tip.likes));
  const [likedPosts, setLikedPosts] = useState(Array(healthTips.length).fill(false));
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [commentCounts, setCommentCounts] = useState(healthTips.map(tip => tip.comments));
  
  const handleLike = (index) => {
    const newLikedPosts = [...likedPosts];
    const newLikes = [...likes];
    
    if (newLikedPosts[index]) {
      newLikes[index] -= 1;
      newLikedPosts[index] = false;
    } else {
      newLikes[index] += 1;
      newLikedPosts[index] = true;
    }
    
    setLikes(newLikes);
    setLikedPosts(newLikedPosts);
  };

  const handleCommentOpen = (index) => {
    setCurrentTipIndex(index);
    setCommentDialogOpen(true);
  };

  const handleCommentClose = () => {
    setCommentDialogOpen(false);
    setCommentText("");
  };

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      const newCommentCounts = [...commentCounts];
      newCommentCounts[currentTipIndex] += 1;
      setCommentCounts(newCommentCounts);
      setCommentText("");
      setCommentDialogOpen(false);
    }
  };

  return (
    <Box sx={{ 
      backgroundImage: `url('/IMG_8206.JPG')`, 
      backgroundSize: "cover", 
      backgroundPosition: "center", 
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column" 
    }}>
      <Grid container sx={{ flex: 1 }}>
        <Grid item xs={12} md={4} lg={3} sx={{ bgcolor: "#f5f5f5", p: 2, minHeight: "100vh" }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Most Popular Health Tips This Week
            </Typography>
            {healthTips.map((tip, index) => (
              <Card key={tip.id} sx={{ mb: 2, borderRadius: "10px", overflow: "hidden" }}>
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Avatar src={tip.avatar} sx={{ width: 24, height: 24, mr: 1, bgcolor: index === 0 ? "#ef5350" : index === 1 ? "#66bb6a" : "#5c6bc0" }} />
                    <Typography variant="body2" fontWeight={600}>@{tip.username}</Typography>
                  </Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>{tip.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: "pre-line" }}>{tip.description}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton size="small" sx={{ mr: 1 }} onClick={() => handleLike(index)}>
                      {likedPosts[index] ? 
                        <FavoriteIcon fontSize="small" color="error" /> : 
                        <FavoriteBorderIcon fontSize="small" color="error" />
                      }
                    </IconButton>
                    <Typography variant="body2" sx={{ mr: 2 }}>{likes[index]}</Typography>
                    <IconButton size="small" sx={{ mr: 1 }} onClick={() => handleCommentOpen(index)}>
                      <CommentIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="body2">{commentCounts[index]}</Typography>
                  </Box>
                </Box>
              </Card>
            ))}
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Button 
                variant="text" 
                onClick={() => navigate('/health-tips')} 
                endIcon={<ArrowForwardIosIcon sx={{ fontSize: 12 }} />}
                sx={{ textTransform: 'none', fontWeight: 600, color: '#616161' }}
              >
                See more Health Tips
              </Button>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={8} lg={9}>
          <Box sx={{ p: 4, height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ mb: 4, color: "white", textAlign: "right", mt: 2 }}>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                <span style={{ color: "#ffcc00" }}>70%</span> of users return for a follow-up appointment
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                Over <span style={{ color: "#ff6f00" }}>10,000</span> doctors with a <span style={{ color: "#f44336" }}>4.5+</span> star rating
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                AI analyzes <span style={{ color: "#ff6f00" }}>10,000+</span> medical reports daily
              </Typography>
            </Box>
            <Box sx={{ 
              borderRadius: "10px", 
              p: 3, 
              textAlign: "center", 
              background: "rgba(255, 255, 255, 0.75)", 
              backdropFilter: "blur(10px)", 
              maxWidth: "450px", 
              mx: "auto", 
              mt: "auto",
              mb: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)" 
            }}>
              <Typography variant="h4" fontWeight={700} color="#2e7d32" gutterBottom>
                CheckAI
              </Typography>
              <Typography variant="subtitle2" fontWeight={600} color="#555" gutterBottom>
                YOUR PERSONAL HEALTH ASSISTANT
              </Typography>
              <Typography variant="body2" color="#555" sx={{ mb: 3 }}>
                Got health questions? CheckAI provides instant insights, analyzes reports, and offers expert-backed recommendations – anytime, anywhere.
              </Typography>
              <Button 
                variant="contained" 
                color="success" 
                size="large" 
                sx={{ 
                  borderRadius: "30px", 
                  px: 4, 
                  py: 1, 
                  fontWeight: 600, 
                  textTransform: "none",
                  width: "140px",
                  backgroundColor: "#2e7d32" 
                }} 
                onClick={() => navigate('/checkai')}
              >
                Start Now
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Box sx={{ p: 3, color: "white", mt: "auto" }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Real Stories, Real Impact
        </Typography>
        <Typography variant="body2">
          Discover health journeys, share your own and connect with others!
        </Typography>
      </Box>

      {/* Comment Dialog */}
      <Dialog open={commentDialogOpen} onClose={handleCommentClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add a comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your comment"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCommentClose}>Cancel</Button>
          <Button onClick={handleCommentSubmit} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default HomePage;