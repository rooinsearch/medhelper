import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  TextField,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  ShoppingCartCheckout as CheckoutIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

/* фирменная зелёная палитра */
const C = {
  main: "#1a5f1a",
  light: "#4a8c4a",
  dark: "#003600",
  greyBg: "#FAFAFA",
};

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [editingItemId, setEditingItemId] = useState(null);
  const [quantityEdits, setQuantityEdits] = useState({});
  const navigate = useNavigate();

  /* ------------------------- helpers ------------------------- */
  const fetchCart = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/cart/");
      setCart(data);
    } catch {
      setError("Failed to load cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateQuantity = async (id) => {
    const qty = quantityEdits[id];
    if (!qty || qty < 1) {
      setSnackbar({ open: true, message: "Quantity must be at least 1", severity: "error" });
      return;
    }
    try {
      await api.patch(`/cart/item/${id}/`, { quantity: qty });
      setSnackbar({ open: true, message: "Quantity updated", severity: "success" });
      fetchCart();
      setEditingItemId(null);
    } catch {
      setSnackbar({ open: true, message: "Update failed", severity: "error" });
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      await api.delete(`/cart/item/${id}/remove/`);
      setSnackbar({ open: true, message: "Item removed", severity: "success" });
      fetchCart();
    } catch {
      setSnackbar({ open: true, message: "Remove failed", severity: "error" });
    }
  };

  const handleCheckout = async () => {
    try {
      const { data } = await api.post("/cart/checkout/");

      // локально очищаем корзину, чтобы UI не мигал
      setCart({ ...cart, items: [], total_price: 0 });

      setSnackbar({ open: true, message: data.message, severity: "success" });

      // переходим на страницу результатов и передаём созданные записи
      navigate("/my-tests", { state: { newRecords: data.records } });
    } catch (err) {
      if (err.response?.status === 400) {
        setSnackbar({ open: true, message: "Корзина пуста", severity: "warning" });
      } else if (err.response?.status === 402) {
        setSnackbar({ open: true, message: "Платёж не прошёл", severity: "error" });
      } else {
        setSnackbar({ open: true, message: "Checkout failed", severity: "error" });
      }
    }
  };

  const closeSnack = () => setSnackbar((s) => ({ ...s, open: false }));

  /* --------------------------- UI ---------------------------- */
  if (loading)
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <CircularProgress color="success" />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading cart…
        </Typography>
      </Box>
    );

  if (error) return <Typography color="error">{error}</Typography>;

  if (!cart?.items?.length)
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Typography variant="h6" sx={{ color: C.main }}>
          Your cart is empty
        </Typography>
      </Box>
    );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      {/* header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 1 }}>
        <Badge badgeContent={cart.items.length} color="success">
          <CheckoutIcon sx={{ color: C.main }} />
        </Badge>
        <Typography variant="h5" fontWeight={600} sx={{ color: C.main }}>
          Your Cart
        </Typography>
      </Box>

      {/* grid */}
      <Grid container spacing={2}>
        {cart.items.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card
              sx={{
                bgcolor: C.greyBg,
                borderRadius: 3,
                p: 1,
                transition: "transform .25s, box-shadow .25s",
                boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                },
              }}
            >
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ color: C.dark }} noWrap>
                  {item.analysis.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" noWrap>
                  {item.analysis.description}
                </Typography>

                <Typography variant="subtitle2" sx={{ mt: 1, color: C.main, fontWeight: 700 }}>
                  {parseFloat(item.analysis.price).toLocaleString()} ₸
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                {/* quantity row */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography variant="body2" fontWeight={500}>
                    Qty:
                  </Typography>

                  {editingItemId === item.id ? (
                    <TextField
                      type="number"
                      size="small"
                      autoFocus
                      value={quantityEdits[item.id] ?? item.quantity}
                      onChange={(e) =>
                        setQuantityEdits({
                          ...quantityEdits,
                          [item.id]: parseInt(e.target.value, 10),
                        })
                      }
                      sx={{ width: 80 }}
                    />
                  ) : (
                    <Typography variant="body2">{item.quantity}</Typography>
                  )}

                  <Box>
                    <Tooltip title={editingItemId === item.id ? "Save" : "Edit"}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          editingItemId === item.id
                            ? handleUpdateQuantity(item.id)
                            : setEditingItemId(item.id)
                        }
                        sx={{ color: C.main }}
                      >
                        {editingItemId === item.id ? <SaveIcon /> : <EditIcon />}
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Remove">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveItem(item.id)}
                        sx={{ color: C.dark }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* total + checkout */}
      <Divider sx={{ my: 4 }} />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ color: C.dark }}>
          Total: {parseFloat(cart.total_price).toLocaleString()} ₸
        </Typography>

        <Button
          onClick={handleCheckout}
          sx={{
            background: `linear-gradient(135deg, ${C.main} 0%, ${C.light} 100%)`,
            color: "#fff",
            px: 4,
            py: 1.5,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
            "&:hover": {
              background: `linear-gradient(135deg, ${C.dark} 0%, ${C.main} 100%)`,
            },
          }}
        >
          Checkout
        </Button>
      </Box>

      {/* snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={closeSnack} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CartPage;