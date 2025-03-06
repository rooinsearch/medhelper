import React from "react";
import { Box } from "@mui/material";

const BackgroundImages = () => {
  return (
    <Box sx={{ width: "100%", overflowX: "hidden" }}> 
      {/* Первый фон */}
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          backgroundImage: "url('/secph.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          position: "relative",
          
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(111, 172, 78, 0.4)", // Синий оттенок
            mixBlendMode: "multiply", // Дает красивый эффект наложения цвета
            backdropFilter: "blur(3px)", // Размытие
          },
        }}
      />

      {/* Второй фон */}
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          backgroundImage: "url('/image.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          position: "relative",
          marginTop: "50px",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(216, 131, 73, 0.4)", // Красный оттенок
            mixBlendMode: "multiply",
            backdropFilter: "blur(3px)",
          },
        }}
      />
    </Box>
  );
};

export default BackgroundImages;