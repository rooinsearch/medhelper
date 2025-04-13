import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";
import {
  Box,
  Typography,
  CircularProgress,
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
} from "@mui/material";
import { ExpandMore, ExpandLess, ShoppingBag } from "@mui/icons-material";

/* ---------- helpers ---------- */
const statusColor = {
  pending: "default",
  completed: "success",
  rejected: "error",
};

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "KZT", 
  maximumFractionDigits: 0,
});

/* ------------------------------------------------------------------ */
const MyTestsPage = () => {
  const { state } = useLocation();
  const newRecords = state?.newRecords || [];
  const theme = useTheme();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openFresh, setOpenFresh] = useState(true);

  /* pagination */
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  /* ---------- load data ---------- */
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const { data } = await api.get("/analysis/records/");
        setRecords(data);
      } catch {
        setError("Failed to load records.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  /* ---------- handlers ---------- */
  const handleChangePage = (_e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  /* ---------- UI ---------- */
  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress color="success" />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" align="center" sx={{ mt: 8 }}>
        {error}
      </Typography>
    );

  return (
    <Box
      sx={{
        px: { xs: 2, md: 6 },
        py: { xs: 3, md: 6 },
        maxWidth: 1400,
        mx: "auto",
        width: "100%",
      }}
    >
      {/* header */}
      <Stack direction="row" alignItems="center" spacing={1} mb={4}>
        <Avatar sx={{ bgcolor: theme.palette.success.main }}>
          <ShoppingBag />
        </Avatar>
        <Typography variant="h4" fontWeight={700}>
          My purchases
        </Typography>
      </Stack>

      {/* ---------- Latest orders card ---------- */}
      {newRecords.length > 0 && (
        <Card elevation={4} sx={{ mb: 5, borderRadius: 4 }}>
          <CardHeader
            title={`Latest Orders (${newRecords.length})`}
            titleTypographyProps={{ fontWeight: 600 }}
            sx={{
              bgcolor: theme.palette.success.light,
              cursor: "pointer",
            }}
            onClick={() => setOpenFresh((p) => !p)}
            action={
              <IconButton>
                {openFresh ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            }
          />
          <Collapse in={openFresh} timeout="auto" unmountOnExit>
            <CardContent>
              <Stack spacing={1} divider={<Divider flexItem />}>
                {newRecords.map((r) => (
                  <Stack
                    key={r.id}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    alignItems={{ sm: "center" }}
                    justifyContent="space-between"
                  >
                    <Typography fontWeight={500} flex={1}>
                      {r.analysis.title}
                    </Typography>
                    <Typography>
                      {currencyFormatter.format(r.analysis.price)}
                    </Typography>
                    <Chip
                      label={r.status}
                      color={statusColor[r.status]}
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Collapse>
        </Card>
      )}

      {/* ---------- table ---------- */}
      <Card elevation={3} sx={{ borderRadius: 4 }}>
        <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {[
                  "Test",
                  "Price",
                  "Hospital",
                  "Date",
                  "Status",
                ].map((h) => (
                  <TableCell
                    key={h}
                    sx={{
                      fontWeight: 600,
                      bgcolor: theme.palette.grey[100],
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {records
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((r, idx) => (
                  <TableRow
                    key={r.id}
                    hover
                    sx={{
                      bgcolor:
                        idx % 2 === 0
                          ? theme.palette.action.hover
                          : "inherit",
                    }}
                  >
                    <TableCell>{r.analysis.title}</TableCell>
                    <TableCell>
                      {currencyFormatter.format(r.analysis.price)}
                    </TableCell>
                    <TableCell>{r.hospital?.name || "-"}</TableCell>
                    <TableCell>
                      {new Date(r.test_date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.status}
                        color={statusColor[r.status]}
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            rowsPerPageOptions={[8, 16, 32]}
            count={records.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Card>
    </Box>
  );
};

export default MyTestsPage;
