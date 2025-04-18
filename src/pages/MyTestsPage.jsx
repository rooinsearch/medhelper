import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Chip,
  Stack,
  IconButton,
  Collapse,
  Avatar,
  Divider,
  useTheme,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Paper,
  CircularProgress,
  GlobalStyles
} from "@mui/material";
import { ExpandMore, ExpandLess, ShoppingBag, ArrowBack } from "@mui/icons-material";

/* ---------- palette ---------- */
const colors = {
  background: "#f8f9fa"
};

const statusColor = {
  pending: "default",
  processing: "warning",
  completed: "success",
  rejected: "error"
};

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "KZT",
  maximumFractionDigits: 0
});

const MyTestsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [openFresh, setOpenFresh] = useState(true);
  const [records, setRecords] = useState([]);
  const [newRecords, setNewRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  /* ---------- load data ---------- */
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);

        const { data } = await api.get("/analysis/records/");
        setRecords(data);

        if (location.state?.newRecords) {
          setNewRecords(location.state.newRecords);
        } else if (data.length > 0) {
          setNewRecords(data.slice(0, 2));
        }

        setError(null);
      } catch (err) {
        console.error("Failed to fetch records:", err);
        setError("Failed to load test records. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [location.state]);

  /* ---------- handlers ---------- */
  const handleChangePage = (_e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };
  const handleBack = () => navigate(-1);

  /* ---------- global bg ---------- */
  const globalBg = (
    <GlobalStyles styles={{ body: { backgroundColor: colors.background } }} />
  );

  /* ---------- loading & error ---------- */
  if (loading) {
    return (
      <>
        {globalBg}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh"
          }}
        >
          <CircularProgress color="success" />
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        {globalBg}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            px: 3
          }}
        >
          <Typography color="error" align="center">
            {error}
          </Typography>
        </Box>
      </>
    );
  }

  /* ---------- main UI ---------- */
  return (
    <>
      {globalBg}
      <Box
        sx={{
          px: { xs: 2, md: 6 },
          py: { xs: 3, md: 6 },
          maxWidth: 1400,
          mx: "auto",
          width: "100%",
          minHeight: "100vh"
        }}
      >
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1} mb={4}>
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Avatar sx={{ bgcolor: theme.palette.success.main }}>
            <ShoppingBag />
          </Avatar>
          <Typography variant="h4" fontWeight={700}>
            My Medical Tests
          </Typography>
        </Stack>

        {/* Recent Tests Card */}
        {newRecords.length > 0 && (
          <Card
            elevation={2}
            sx={{
              mb: 5,
              borderRadius: 4,
              borderLeft: `4px solid ${theme.palette.success.main}`
            }}
          >
            <CardHeader
              title={`Recent Tests (${newRecords.length})`}
              titleTypographyProps={{ fontWeight: 600 }}
              sx={{
                bgcolor: theme.palette.success.light,
                cursor: "pointer",
                "&:hover": { bgcolor: theme.palette.success.lighter }
              }}
              onClick={() => setOpenFresh((p) => !p)}
              action={
                <IconButton>{openFresh ? <ExpandLess /> : <ExpandMore />}</IconButton>
              }
            />
            <Collapse in={openFresh} timeout="auto" unmountOnExit>
              <CardContent>
                <Stack spacing={2} divider={<Divider flexItem />}>
                  {newRecords.map((r) => (
                    <Stack
                      key={r.id}
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      alignItems={{ sm: "center" }}
                      justifyContent="space-between"
                    >
                      <Typography fontWeight={500} flex={1}>
                        {r.analysis.title}
                      </Typography>
                      <Typography fontWeight={600}>
                        {currencyFormatter.format(r.analysis.price)}
                      </Typography>
                      <Chip
                        label={r.status}
                        color={statusColor[r.status]}
                        size="small"
                        sx={{
                          textTransform: "capitalize",
                          minWidth: 100
                        }}
                      />
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Collapse>
          </Card>
        )}

        {/* All tests table */}
        <Card
          elevation={2}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            "& .MuiTablePagination-root": {
              borderTop: `1px solid ${theme.palette.divider}`
            }
          }}
        >
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {["Test", "Price", "Hospital", "Date", "Status"].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        fontWeight: 600,
                        bgcolor: theme.palette.grey[100],
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        "&:first-of-type": { pl: 4 },
                        "&:last-of-type": { pr: 4 }
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {records.length ? (
                  records
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((r) => (
                      <TableRow
                        key={r.id}
                        hover
                        sx={{
                          "&:hover": { backgroundColor: theme.palette.action.hover }
                        }}
                      >
                        <TableCell sx={{ pl: 4 }}>{r.analysis.title}</TableCell>
                        <TableCell>
                          {currencyFormatter.format(r.analysis.price)}
                        </TableCell>
                        <TableCell>{r.hospital?.name || "-"}</TableCell>
                        <TableCell>
                          {new Date(r.test_date).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })}
                        </TableCell>
                        <TableCell sx={{ pr: 4 }}>
                          <Chip
                            label={r.status}
                            color={statusColor[r.status]}
                            size="small"
                            sx={{
                              textTransform: "capitalize",
                              minWidth: 100
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No test records found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {records.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={records.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ bgcolor: colors.background }}
            />
          )}
        </Card>
      </Box>
    </>
  );
};

export default MyTestsPage;
