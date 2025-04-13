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
  Snackbar,
  Alert,
  CircularProgress,
  Avatar,
  Stack,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { format } from "date-fns";
import api from "../api/axios";

/* зелёная палитра проекта */
const color = {
  main: "#1a5f1a",
  light: "#4a8c4a",
  dark: "#003600",
};

const TestRecordDetailModal = ({ open, handleClose, record }) => {
  if (!record) return null;
  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95%", sm: 500 },
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h5" fontWeight={600} sx={{ color: color.main, mb: 2 }}>
          {record.analysis?.title || "Test Detail"}
        </Typography>

        <Stack spacing={1} mb={2}>
          <Typography variant="subtitle2">
            <strong>Hospital:</strong> {record.hospital?.name || "N/A"}
          </Typography>
          <Typography variant="subtitle2">
            <strong>Date:</strong> {format(new Date(record.test_date), "PPPp")}
          </Typography>
          <Typography variant="subtitle2">
            <strong>Status:</strong>{" "}
            <Chip
              label={record.status}
              color={
                record.status === "completed"
                  ? "success"
                  : record.status === "rejected"
                  ? "error"
                  : "warning"
              }
              size="small"
            />
          </Typography>
        </Stack>

        {record.notes && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Notes:</strong> {record.notes}
          </Typography>
        )}

        {record.result && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Result:</strong> {record.result}
          </Typography>
        )}

        {record.reviewed_at && (
          <Typography variant="body2">
            Reviewed at: {format(new Date(record.reviewed_at), "PPPp")}
          </Typography>
        )}

        <Box textAlign="right" mt={4}>
          <Button
            variant="contained"
            onClick={handleClose}
            sx={{ bgcolor: color.main, "&:hover": { bgcolor: color.dark } }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const TestHistoryPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/analysis/records/");
        setRecords(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load test history.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const handleCardClick = (record) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  /* ---------- состояния ---------- */
  if (loading)
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <CircularProgress color="success" />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading test history…
        </Typography>
      </Box>
    );

  if (error)
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );

  /* ---------- UI ---------- */
  return (
    <Box sx={{ width: "100%" }}>
      {/* заголовок */}
      <Typography
        variant="h5"
        fontWeight={600}
        sx={{
          color: color.main,
          mb: 3,
          borderLeft: `6px solid ${color.light}`,
          pl: 1.5,
        }}
      >
        Test History & Results
      </Typography>

      {/* сетка карточек */}
      {records.length === 0 ? (
        <Typography variant="body1" textAlign="center" color="text.secondary">
          No test records found.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {records.map((rec) => (
            <Grid item xs={12} sm={6} md={4} key={rec.id}>
              <Card
                onClick={() => handleCardClick(rec)}
                sx={{
                  cursor: "pointer",
                  borderRadius: 3,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  transition: "transform 0.25s, box-shadow 0.25s",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  },
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <Avatar sx={{ bgcolor: color.light, width: 32, height: 32 }}>
                      <AssignmentIcon fontSize="small" />
                    </Avatar>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{ color: color.dark }}
                      noWrap
                    >
                      {rec.analysis?.title || "Unknown Test"}
                    </Typography>
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    {rec.hospital?.name || "No Hospital"}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(rec.test_date), "PPP")}
                  </Typography>

                  <Box mt={1}>
                    <Chip
                      label={rec.status}
                      size="small"
                      color={
                        rec.status === "completed"
                          ? "success"
                          : rec.status === "rejected"
                          ? "error"
                          : "warning"
                      }
                    />
                  </Box>

                  {rec.result && (
                    <Typography variant="body2" sx={{ mt: 1 }} noWrap>
                      {rec.result}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* модалка + snackbar */}
      <TestRecordDetailModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        record={selectedRecord}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TestHistoryPage;
