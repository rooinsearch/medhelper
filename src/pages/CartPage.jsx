import React, { useState, useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import api from '../api/axios';

const primaryColor = '#1a5f1a';
const primaryLight = '#4a8c4a';
const primaryDark = '#003600';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editingItemId, setEditingItemId] = useState(null);
  const [quantityEdits, setQuantityEdits] = useState({});

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cart/');
      setCart(response.data);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Failed to load cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);


  const handleUpdateQuantity = async (itemId) => {
    const newQty = quantityEdits[itemId];
    if (!newQty || newQty < 1) {
      setSnackbar({ open: true, message: "Quantity must be at least 1", severity: "error" });
      return;
    }
    try {
      await api.patch(`/cart/item/${itemId}/`, { quantity: newQty });
      setSnackbar({ open: true, message: "Quantity updated.", severity: "success" });
      fetchCart();
      setEditingItemId(null);
    } catch (err) {
      console.error("Error updating cart item:", err);
      setSnackbar({ open: true, message: "Failed to update item.", severity: "error" });
    }
  };


  const handleRemoveItem = async (itemId) => {
    try {
      await api.delete(`/cart/item/${itemId}/remove/`);
      setSnackbar({ open: true, message: "Item removed from cart.", severity: "success" });
      fetchCart();
    } catch (err) {
      console.error("Error removing cart item:", err);
      setSnackbar({ open: true, message: "Failed to remove item.", severity: "error" });
    }
  };


  const handleCheckout = async () => {
    try {
      await api.post('/cart/checkout/');
      setSnackbar({ open: true, message: "Checkout successful. Cart cleared.", severity: "success" });
      fetchCart();
    } catch (err) {
      console.error("Error during checkout:", err);
      setSnackbar({ open: true, message: "Checkout failed.", severity: "error" });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress color="success" />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading cart...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" sx={{ color: primaryColor }}>Your cart is empty.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: primaryColor,
          fontWeight: 'bold',
          textAlign: 'center',
          mb: 4,
          borderBottom: `2px solid ${primaryLight}`,
          pb: 1
        }}
      >
        Your Shopping Cart
      </Typography>
      <Grid container spacing={3}>
        {cart.items.map((item) => (
          <Grid item xs={12} sm={6} key={item.id}>
            <Card
              sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                boxShadow: 3,
                borderTop: `4px solid ${primaryColor}`,
                backgroundColor: '#f9f9f9'
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ color: primaryColor, fontWeight: 'medium' }}>
                  {item.analysis.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {item.analysis.description}
                </Typography>
                <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold', color: primaryDark }}>
                  Price: {parseFloat(item.analysis.price).toLocaleString()} ₸
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    Quantity:
                  </Typography>
                  {editingItemId === item.id ? (
                    <TextField
                      type="number"
                      value={quantityEdits[item.id] || item.quantity}
                      onChange={(e) =>
                        setQuantityEdits({ ...quantityEdits, [item.id]: parseInt(e.target.value, 10) })
                      }
                      size="small"
                      sx={{ width: 80 }}
                    />
                  ) : (
                    <Typography variant="body2">{item.quantity}</Typography>
                  )}
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() =>
                        editingItemId === item.id
                          ? handleUpdateQuantity(item.id)
                          : setEditingItemId(item.id)
                      }
                      sx={{ color: primaryColor }}
                    >
                      {editingItemId === item.id ? <SaveIcon /> : <EditIcon />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveItem(item.id)}
                      sx={{ color: primaryDark }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Divider sx={{ my: 4, borderColor: primaryLight }} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Typography variant="h6" sx={{ color: primaryDark, fontWeight: 'bold' }}>
          Total: {parseFloat(cart.total_price).toLocaleString()} ₸
        </Typography>
        <Button
          variant="contained"
          onClick={handleCheckout}
          sx={{
            backgroundColor: primaryColor,
            '&:hover': { backgroundColor: primaryDark },
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 'bold'
          }}
        >
          Checkout
        </Button>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CartPage;
