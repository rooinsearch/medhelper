import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Modal,
  Avatar,
  Stack,
  Paper,
  CircularProgress
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { format } from "date-fns";
import api from "../api/axios"; // Убедитесь, что путь к API корректный

// Цветовая палитра (ваши стили)
const colors = {
  primary: "#1a5f1a",
  accent: "#4caf50",
  background: "#e8f5e9",
  error: "#d32f2f",
  warning: "#ed6c02"
};

// Стили для карточек (ваши стили)
const cardStyles = {
  root: {
    cursor: "pointer",
    borderRadius: 1,
    borderLeft: "3px solid " + colors.accent,
    boxShadow: "0 1px 4px rgba(0, 30, 0, 0.1)",
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 2px 8px rgba(0, 30, 0, 0.15)"
    }
  },
  content: {
    p: 1.5
  }
};

// Модальное окно (ваши стили)
const DetailModal = ({ open, onClose, record }) => {
  if (!record) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "85%",
        maxWidth: 400,
        bgcolor: "background.paper",
        borderRadius: 1,
        boxShadow: 8,
        p: 2,
        borderLeft: "3px solid " + colors.accent
      }}>
        {/* ... (ваше содержимое модального окна без изменений) ... */}
      </Box>
    </Modal>
  );
};

// Основной компонент с бэкенд-логикой
const TestHistoryPage = () => {
  const [testRecords, setTestRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Загрузка данных с бэкенда
  useEffect(() => {
    const fetchTestRecords = async () => {
      try {
        setLoading(true);
        const response = await api.get("/analysis/records/");
        setTestRecords(response.data);
      } catch (err) {
        console.error("Error fetching test records:", err);
        setError("Failed to load test records");
      } finally {
        setLoading(false);
      }
    };

    fetchTestRecords();
  }, []);

  const handleCardClick = (record) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  // Состояние загрузки
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px'
      }}>
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  // Состояние ошибки
  if (error) {
    return (
      <Box sx={{ 
        p: 3, 
        textAlign: 'center',
        bgcolor: colors.background,
        borderRadius: 1,
        borderLeft: `3px solid ${colors.error}`
      }}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="outlined" 
          onClick={() => window.location.reload()}
          sx={{ 
            mt: 2,
            color: colors.primary,
            borderColor: colors.primary
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  // Ваш интерфейс с восстановленной бэкенд-логикой
  return (
    <Box sx={{ p: 2 }}>
      {/* Заголовок (ваш стиль) */}
      <Box sx={{ width: "100%", transform: 'translateY(-6px)', ml: 0 }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 'bold', 
          color: '#001A00'
        }}>
          Test History & Results
        </Typography>
      </Box>

      {/* Список тестов (ваш стиль) */}
      {testRecords.length === 0 ? (
        <Paper sx={{ 
          p: 2, 
          textAlign: 'center',
          bgcolor: colors.background,
          borderRadius: 1,
          borderLeft: `3px solid ${colors.accent}`,
          mt: 3
        }}>
          <Typography variant="body2">
            No test records available
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {testRecords.map((record) => (
            <Grid item xs={12} sm={6} md={4} key={record.id}>
              <Card 
                sx={cardStyles.root}
                onClick={() => handleCardClick(record)}
              >
                <CardContent sx={cardStyles.content}>
                  {/* ... (ваше содержимое карточки без изменений) ... */}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <DetailModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        record={selectedRecord} 
      />
    </Box>
  );
};

export default TestHistoryPage;