import React from "react";
import { Box, useMediaQuery } from "@mui/material";

const BackgroundImages = () => {
  const isMobile = useMediaQuery("(max-width:768px)");

  return (
    <Box sx={{ width: "100%", overflowX: "hidden" }}>
      {/* Первый фон */}
      <Box
        sx={{
          width: "100%",
          minHeight: isMobile ? "70vh" : "100vh",
          backgroundImage: "url('/secph.png')",
          backgroundSize: isMobile ? "cover" : "cover",
          backgroundPosition: isMobile ? "center center" : "center",
          backgroundRepeat: "no-repeat",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(111, 172, 78, 0.4)",
            mixBlendMode: "multiply",
            backdropFilter: "blur(3px)",
          },
        }}
      />

      {/* Второй фон */}
      <Box
        sx={{
          width: "100%",
          minHeight: isMobile ? "70vh" : "100vh",
          backgroundImage: "url('image.png')",
          backgroundSize: isMobile ? "cover" : "cover",
          backgroundPosition: isMobile ? "center center" : "center",
          backgroundRepeat: "no-repeat",
          position: "relative",
          marginTop: "250px",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(14, 65, 3, 0.4)",
            mixBlendMode: "multiply",
            backdropFilter: "blur(3px)",
          },
        }}
      />

      {/* Третий фон (исправленный) */}
      <Box
  sx={{
    width: "100%",
    minHeight: isMobile ? "70vh" : "100vh",
    backgroundImage: "url('IMG_4707 (1).JPG')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    position: "relative",
    zIndex: 1, // Оставляем z-index меньше чем у формы
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(14, 65, 3, 0.4)",
      mixBlendMode: "multiply",
      backdropFilter: "blur(2px)",
      zIndex: 1
    }
  }}
/>
    </Box>
  );
};

export default BackgroundImages;