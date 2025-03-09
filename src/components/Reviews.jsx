import React from "react";
import { Card, CardContent, Typography, Avatar, Box, IconButton } from "@mui/material";
import Rating from "@mui/material/Rating";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import { EffectCoverflow, Navigation } from "swiper/modules";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

const reviews = [
  { id: 1, name: "ademizhann", rating: 4, text: "I had been searching for a good dermatologist for months. MedHelper helped me find a highly rated specialist nearby, and the appointment booking was super easy!" },
  { id: 2, name: "rdkaruzhan", rating: 5, text: "I was struggling to understand my blood test results, and CheckAI gave me a clear analysis in seconds! It even suggested possible next steps. Such a lifesaver!" },
  { id: 3, name: "janymgul_", rating: 3, text: "I love the weekly health hacks! I learned how to improve my sleep routine, drink enough water, and even manage stress better. Feels like having a personal health coach!" },
  { id: 4, name: "healthguru", rating: 5, text: "CheckAI changed my life! I can now track my health reports easily and get expert advice instantly." },
  { id: 5, name: "wellness_expert", rating: 4, text: "Such a great app for managing my health records. Highly recommended!" },
  { id: 6, name: "medlover", rating: 4, text: "This app made my healthcare experience so much easier! Finding doctors is now effortless." }
];

const Reviews = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#D1653E",
        py: 3,
        textAlign: "center",
        position: "absolute",
        bottom: "300px",
        width: "100%",
        minHeight: 250,
        overflow: "hidden",
        zIndex: 20,
      }}
    >
      <Typography variant="h6" color="white" fontWeight="bold" gutterBottom>
        Real Stories, Real Impact
      </Typography>
      

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <IconButton className="swiper-button-prev" sx={{ color: "white" }}>
          <ArrowBackIos />
        </IconButton>

        <Swiper
          effect="coverflow"
          grabCursor
          centeredSlides
          slidesPerView="auto"
          navigation={{ nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }}
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
                  <Rating value={review.rating} readOnly precision={0.5} size="medium" />
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {review.text}
                  </Typography>
                </CardContent>
                <Box mt={1} display="flex" alignItems="center" justifyContent="center" gap={1}>
                  <Avatar sx={{ bgcolor: "#F97316", width: 25, height: 25 }}>
                    {review.name[0].toUpperCase()}
                  </Avatar>
                  <Typography variant="subtitle2" fontWeight="bold" fontSize="0.7rem">
                    @{review.name}
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
    </Box>
  );
};

export default Reviews;

