import React from 'react';
import { Box, Typography, Button } from "@mui/material";

const AiMain = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '35px',
        left: '35%',
        width: '800px',
        height: '1000px',
        background: 'url(/path-to-background-image) no-repeat center center',
        backgroundSize: 'cover',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '1024px',
          background: 'rgba(255, 255, 255, 0.75)',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography 
          variant="h2" 
          sx={{ 
            color: '#000000', 
            fontWeight: 'bold', 
            marginBottom: '16px' 
          }}
        >
          CheckAI
        </Typography>
        
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#000000', 
            marginBottom: '24px',
            opacity: 0.7 
          }}
        >
          YOUR PERSONAL HEALTH ASSISTANT
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#000000', 
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto',
            opacity: 0.8 
          }}
        >
          Got health questions? CheckAI provides instant insights, analyzes reports, 
          and offers expert-backed recommendations – anytime, anywhere.
        </Typography>
        
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#1C3B2E',
            color: 'white',
            padding: '12px 32px',
            borderRadius: '100px',
            textTransform: 'none',
            fontSize: '16px',
            '&:hover': {
              backgroundColor: '#2C5B4A'
            }
          }}
        >
          Start Now
        </Button>
      </Box>
    </Box>
  );
};

export default AiMain;