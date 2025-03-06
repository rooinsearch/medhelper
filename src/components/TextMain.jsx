import { Box, Typography } from "@mui/material";

const TextMain = () => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: "250px",
        left: "70%",
        transform: "translate(-50%, -50%)",
        width: "90%",
        maxWidth: 800,
        color: "white",
        textAlign: "center",
        p: 3,
        borderRadius: 2,
      }}
    >
      
      <Typography variant="h5" fontWeight="bold" sx={{ mt: 2 }}>
        <span style={{ color: "orange" }}>70%</span>of users return for a follow-up appointment
      </Typography>
      <Typography variant="h5" fontWeight="bold" sx={{ mt: 2 }}>
        Over <span style={{ color: "orange" }}>10,000</span> doctors with a{" "}
        <span style={{ color: "orange" }}>4.5+</span> star rating
      </Typography>
      <Typography variant="h5" fontWeight="bold" sx={{ mt: 2}}>
        AI analyzes <span style={{ color: "orange" }}>10,000+</span> medical reports daily
      </Typography>
    </Box>
  );
};

export default TextMain;
