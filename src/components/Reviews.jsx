import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Avatar, Box, IconButton } from "@mui/material";
import Rating from "@mui/material/Rating";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import { EffectCoverflow, Navigation } from "swiper/modules";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch('/data/testimonials.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load reviews');
        }
        return response.json();
      })
      .then(data => setReviews(data))
      .catch(error => {
        console.error('Error loading reviews:', error);
        setReviews([
          {
            id: 1,
            name: "default_user",
            rating: 4,
            text: "Loading reviews...",
          }
        ]);
      });
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: "#D1653E",
        py: 3,
        textAlign: "center",
        width: "100%",
        minHeight: 250,
        overflow: "hidden",
        zIndex: 20,
        position: "absolute",
        top: "550px",
      }}
    >
      <Typography variant="h6" color="white" fontWeight="bold" gutterBottom>
        Real Stories, Real Impact
      </Typography>

      {reviews.length > 0 ? (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconButton className="swiper-button-prev" sx={{ color: "white" }}>
            <ArrowBackIos />
          </IconButton>

          <Swiper
            effect="coverflow"
            grabCursor
            centeredSlides
            slidesPerView="auto"
            navigation={{ 
              nextEl: ".swiper-button-next", 
              prevEl: ".swiper-button-prev" 
            }}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 100,
              modifier: 2,
              slideShadows: false,
            }}
            modules={[EffectCoverflow, Navigation]}
            style={{ maxWidth: "85%", margin: "0 auto" }}
          >
            {reviews.map((review) => (
              <SwiperSlide key={review.id} style={{ maxWidth: 320 }}>
                <Card
                  sx={{
                    height: 180,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    p: 2,
                    borderRadius: 3,
                    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.15)",
                    backgroundColor: "white",
                    textAlign: "center",
                    overflow: "hidden",
                  }}
                >
                  <CardContent
                    sx={{
                      overflow: "auto",
                      height: "100%",
                      "::-webkit-scrollbar": { display: "none" },
                      "-ms-overflow-style": "none",
                      "scrollbar-width": "none",
                    }}
                  >
                    <Rating 
                      value={review.rating} 
                      readOnly 
                      precision={0.5} 
                      size="medium" 
                    />
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      {review.text}
                    </Typography>
                  </CardContent>
                  <Box mt={1} display="flex" alignItems="center" justifyContent="center" gap={1}>
                    <Avatar sx={{ bgcolor: "#F97316", width: 25, height: 25 }}>
                      {review.name[0].toUpperCase()}
                    </Avatar>
                    <Typography variant="subtitle2" fontWeight="bold" fontSize="0.7rem">
                      {review.name}
                    </Typography>
                  </Box>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>

          <IconButton className="swiper-button-next" sx={{ color: "white" }}>
            <ArrowForwardIos />
          </IconButton>
        </Box>
      ) : (
        <Typography color="white">Loading reviews...</Typography>
      )}
    </Box>
  );
};

export default Reviews;