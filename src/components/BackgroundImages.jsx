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
          minHeight: "100vh",
          backgroundImage: "url('/image.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          position: "relative",
          marginTop: "-4px", // Убираем зазор между блоками
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0, // Исправлено с 30 на 0
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(14, 65, 3, 0.4)",
            mixBlendMode: "multiply",
            backdropFilter: "blur(4px)",
          },
        }}
      />
    </Box>
  );
};

export default BackgroundImages;
