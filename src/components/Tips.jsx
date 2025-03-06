import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Typography, Avatar, Box, IconButton, Button, Collapse } from "@mui/material";
import { Favorite, ChatBubbleOutline, ExpandMore, LightbulbOutlined } from "@mui/icons-material";

const tips = [
  {
    id: 1,
    username: "janymgul_",
    avatarColor: "red",
    title: "Headache or Migraine?",
    description: "What's the difference? Tension in muscles vs. blood vessel pressure.",
    fullDescription: "Tension headaches involve muscle strain and create a band-like pressure. Migraines, however, are more intense and can include light sensitivity, nausea, and throbbing pain.",
    likes: 35,
    comments: 18,
  },
  {
    id: 2,
    username: "ademizhann",
    avatarColor: "green",
    title: "How to Protect Your Heart?",
    description: "Walk 10,000 steps, do breathing exercises, and eat heart-friendly foods.",
    fullDescription: "Regular walking, breathing exercises, and a diet rich in omega-3 can improve heart health and reduce stress.",
    likes: 28,
    comments: 19,
  },
  {
    id: 3,
    username: "rdkaruzhan",
    avatarColor: "blue",
    title: "The Importance of Water",
    description: "Adults need 1.5-2 liters of water daily. Dehydration causes fatigue.",
    fullDescription: "Proper hydration supports metabolism, prevents fatigue, and improves cognitive function.",
    likes: 30,
    comments: 17,
  },
];

export default function HealthTips() {
  const [expandedTip, setExpandedTip] = useState(null);
  const navigate = useNavigate(); // Для перехода на страницу "Health Tips"

  const toggleTipExpansion = (tipId) => {
    setExpandedTip(expandedTip === tipId ? null : tipId);
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: "135px",
        left: "20px",
        width: "280px", // Adjusted container width
        height: "calc(121vh - 110px)", // Taller container
        overflowY: "auto",
        zIndex: 10,
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      <Box
        sx={{
          backgroundColor: "rgba(63, 78, 61, 0.7)",
          borderRadius: 3,
          boxShadow: 4,
          p: 2,
        }}
      >
        {/* Заголовок с лампочкой */}
        <Typography
          variant="h6"
          fontWeight="bold"
          textAlign="center"
          mb={2}
          color="white"
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={1}
        >
          <LightbulbOutlined fontSize="meduim" sx={{ color: "white" }} />
          Weekly Top Health-Tips
        </Typography>

        {tips.map((tip) => (
          <Card
            key={tip.id}
            sx={{
              mb: 2,
              p: 1.5, // Smaller padding inside the card
              borderRadius: 3,
              backgroundColor: "#fefefe",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: "0 6px 14px rgba(0, 0, 0, 0.15)",
              },
              width: "100%", // Adjusted card width
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar sx={{ bgcolor: tip.avatarColor, width: 28, height: 28 }}>
                {tip.username[0].toUpperCase()}
              </Avatar>
              <Typography fontWeight="bold" fontSize="0.9rem">{tip.username}</Typography>
            </Box>

            <Typography variant="subtitle2" fontWeight="bold" mt={1}>
              {tip.title}
            </Typography>

            <Typography variant="body2" color="text.secondary" fontSize="0.85rem">
              {tip.description}
            </Typography>

            <Collapse in={expandedTip === tip.id}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} fontSize="0.85rem">
                {tip.fullDescription}
              </Typography>
            </Collapse>

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
              <Box display="flex" alignItems="center">
                <IconButton size="small" color="error">
                  <Favorite fontSize="small" /> <Typography ml={0.5} fontSize="0.8rem">{tip.likes}</Typography>
                </IconButton>

                <IconButton size="small" color="primary">
                  <ChatBubbleOutline fontSize="small" /> <Typography ml={0.5} fontSize="0.8rem">{tip.comments}</Typography>
                </IconButton>
              </Box>

              <Button
                size="small"
                onClick={() => toggleTipExpansion(tip.id)}
                endIcon={
                  <ExpandMore
                    sx={{
                      transform: expandedTip === tip.id ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.3s ease-in-out",
                    }}
                  />
                }
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  color: "primary.main",
                  "&:hover": { color: "primary.dark" },
                }}
              >
                {expandedTip === tip.id ? "Hide" : "See More"}
              </Button>
            </Box>
          </Card>
        ))}

        {/* Кнопка "See more Health Tips" */}
        <Typography
          variant="body2"
          color="001A00"
          fontWeight="bold"
          textAlign="center"
          sx={{ mt: 2, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
          onClick={() => navigate("/health-tips")}
        >
          See more Health Tips →
        </Typography>
      </Box>
    </Box>
  );
}
