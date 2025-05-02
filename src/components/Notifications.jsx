import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Switch,
  List,
  ListItem,
  ListItemText,
  Divider,
  Badge,
  IconButton,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
  styled
} from "@mui/material";
import { 
  Close, 
  Notifications as NotificationsIcon, 
  Refresh,
  ExpandMore
} from "@mui/icons-material";
import api from "../api/axios";

const ScrollContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  '& .scroll-content': {
    flex: 1,
    overflowY: 'auto',
    paddingRight: theme.spacing(1),
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.grey[400],
      borderRadius: '3px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: theme.palette.grey[100],
    }
  }
}));

const ITEMS_PER_PAGE = 10;
const SYNC_INTERVAL = 60000;

const Notifications = ({ updateUnreadCount }) => {
  const [settings, setSettings] = useState({
    testReminders: true,
    resultAlerts: true
  });

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [syncingData, setSyncingData] = useState(false);

  // Загрузка настроек уведомлений
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await api.get("/notifications/settings/");
        setSettings(response.data);
      } catch (error) {
        console.error("Error fetching notification settings:", error);
        setError("Failed to load notification settings");
        showError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Загрузка уведомлений
  const fetchNotifications = useCallback(async (pageNum = 1, refresh = false) => {
    try {
      if (pageNum === 1 || refresh) {
        setLoading(true);
      } else {
        setSyncingData(true);
      }
      
      const response = await api.get("/notifications/", {
        params: {
          page: pageNum,
          page_size: ITEMS_PER_PAGE
        }
      });
      
      if (refresh) {
        setNotifications(response.data.results || []);
      } else {
        setNotifications(prev => 
          pageNum === 1 
            ? response.data.results || [] 
            : [...prev, ...(response.data.results || [])]
        );
      }
      
      setHasMore(response.data.next !== null);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Failed to load notifications");
      showError("Failed to load notifications");
    } finally {
      setLoading(false);
      setSyncingData(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(page);
  }, [page, fetchNotifications]);

  // Автообновление уведомлений
  useEffect(() => {
    const syncInterval = setInterval(() => {
      fetchNotifications(1, true);
    }, SYNC_INTERVAL);
    
    return () => clearInterval(syncInterval);
  }, [fetchNotifications]);

  // Обновление счетчика непрочитанных
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    updateUnreadCount(unreadCount);
  }, [notifications, updateUnreadCount]);

  // Сохранение настроек
  const saveSettings = async (newSettings) => {
    setSavingSettings(true);
    try {
      await api.put("/notifications/settings/", newSettings);
      setSettings(newSettings);
      showSuccess("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      showError("Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const showSuccess = (message) => {
    setSnackbar({
      open: true,
      message,
      severity: "success"
    });
  };

  const showError = (message) => {
    setSnackbar({
      open: true,
      message,
      severity: "error"
    });
  };

  const handleSettingChange = (setting) => {
    const newSettings = { ...settings, [setting]: !settings[setting] };
    saveSettings(newSettings);
  };

  // Пометить как прочитанное
  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/mark-read/`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      showError("Failed to mark notification as read");
    }
  };

  // Удаление уведомления
  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}/`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      showSuccess("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      showError("Failed to delete notification");
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    fetchNotifications(1, true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Группировка уведомлений по дате
  const groupByDate = (notifs) => {
    if (!notifs || !Array.isArray(notifs)) {
      return {};
    }
    
    const groups = {};
    
    notifs.forEach(notification => {
      if (!notification?.created_at) return;
      
      const date = new Date(notification.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateKey;
      if (date.toDateString() === today.toDateString()) {
        dateKey = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = "Yesterday";
      } else {
        dateKey = date.toLocaleDateString(undefined, { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(notification);
    });
    
    return groups;
  };
  
  const groupedNotifications = groupByDate(notifications);

  return (
    <ScrollContainer>
      <Box sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'space-between' }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            transform: 'translateY(-5px)' ,
            ml:-0.5
          }}>
            <NotificationsIcon sx={{ 
              mr: 1, 
              fontSize: 24, 
              color: '#001A00'
            }} />
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold', 
              color: '#001A00'
            }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Badge badgeContent={unreadCount} color="error" sx={{ ml: 2 }} />
            )}
          </Box>
          
          <IconButton 
            onClick={handleRefresh} 
            disabled={loading || syncingData}
            sx={{ color: '#004d00' }}
          >
            {(loading || syncingData) ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <Refresh />
            )}
          </IconButton>
        </Box>

        {/* Настройки уведомлений */}
        <Paper elevation={0} sx={{ 
          p: 2, 
          mb: 2, 
          borderRadius: 2,
          bgcolor: 'background.paper',
          position: 'relative'
        }}>
          {savingSettings && (
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 2,
              zIndex: 1
            }}>
              <CircularProgress size={24} />
            </Box>
          )}
          
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#001A00', mb: 2 }}>
            Notification Settings
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            p: 1,
            borderRadius: 1,
            '&:hover': { bgcolor: '#f5f5f5' }
          }}>
            <Box>
              <Typography sx={{ color: '#001A00', fontSize: '0.9rem' }}>Test Reminders</Typography>
              <Typography variant="body2" sx={{ color: '#004d00', fontSize: '0.8rem' }}>
                Get reminders about upcoming tests
              </Typography>
            </Box>
            <Switch
              checked={settings.testReminders}
              onChange={() => handleSettingChange('testReminders')}
              color="primary"
              size="small"
              disabled={savingSettings}
            />
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1,
            borderRadius: 1,
            '&:hover': { bgcolor: '#f5f5f5' }
          }}>
            <Box>
              <Typography sx={{ color: '#001A00', fontSize: '0.9rem' }}>Result Alerts</Typography>
              <Typography variant="body2" sx={{ color: '#004d00', fontSize: '0.8rem' }}>
                Notify when test results are available
              </Typography>
            </Box>
            <Switch
              checked={settings.resultAlerts}
              onChange={() => handleSettingChange('resultAlerts')}
              color="primary"
              size="small"
              disabled={savingSettings}
            />
          </Box>
        </Paper>
      </Box>

      {/* Список уведомлений */}
      <Box className="scroll-content">
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ 
            fontWeight: 'bold',
            color: '#001A00',
            mb: 2,
            px: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Recent Notifications</span>
            {syncingData && notifications.length > 0 && (
              <CircularProgress size={16} sx={{ ml: 1 }} />
            )}
          </Typography>
          
          {loading && notifications.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} color="inherit" />
            </Box>
          ) : error && notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3, color: '#FF3B30' }}>
              <Typography variant="body2">{error}</Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleRefresh}
                sx={{ mt: 1, color: '#004d00', borderColor: '#004d00' }}
              >
                Try Again
              </Button>
            </Box>
          ) : notifications.length === 0 ? (
            <Typography variant="body2" sx={{ textAlign: 'center', p: 3, color: '#004d00' }}>
              No notifications available
            </Typography>
          ) : (
            <>
              {Object.entries(groupedNotifications).map(([dateGroup, notifs]) => (
                <Box key={dateGroup} sx={{ mb: 2 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block', 
                      mb: 1, 
                      fontWeight: 'medium',
                      color: '#004d00',
                      px: 1
                    }}
                  >
                    {dateGroup}
                  </Typography>
                  <List dense>
                    {notifs.map((notification) => (
                      <React.Fragment key={notification.id}>
                        <ListItem
                          sx={{
                            borderRadius: 1,
                            mb: 1,
                            bgcolor: notification.read ? 'inherit' : '#e6f0e6',
                            '&:hover': { bgcolor: notification.read ? '#f5f5f5' : '#d9e6d9' },
                            position: 'relative'
                          }}
                          onClick={() => !notification.read && markAsRead(notification.id)}
                        >
                          <ListItemText
                            primary={notification.message}
                            secondary={new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            sx={{
                              '& .MuiListItemText-primary': {
                                fontWeight: notification.read ? 'normal' : '600',
                                color: '#001A00',
                                fontSize: '0.875rem'
                              },
                              '& .MuiListItemText-secondary': {
                                color: '#004d00',
                                fontSize: '0.75rem'
                              }
                            }}
                          />
                          <IconButton
                            edge="end"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            sx={{ color: '#004d00' }}
                            size="small"
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              ))}
              
              {hasMore && (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Button
                    variant="text"
                    onClick={loadMore}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : <ExpandMore />}
                    sx={{ color: '#004d00' }}
                  >
                    Load more
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
      
      {/* Уведомления об операциях */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ScrollContainer>
  );
};

export default Notifications;