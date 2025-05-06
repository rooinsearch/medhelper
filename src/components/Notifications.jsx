import React, { useState, useEffect, useCallback, useMemo } from "react";
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

// Константы для стилизации
const COLORS = {
  primary: '#004d00',
  darkPrimary: '#001A00',
  lightPrimary: '#e6f0e6',
  hoverLight: '#f5f5f5',
  hoverDark: '#d9e6d9',
};

const ITEMS_PER_PAGE = 10;
const SYNC_INTERVAL = 60000; // 1 минута

// Стилизованные компоненты
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

const NotificationItem = styled(ListItem)(({ isRead }) => ({
  borderRadius: 8,
  marginBottom: 8,
  backgroundColor: isRead ? 'inherit' : COLORS.lightPrimary,
  '&:hover': { 
    backgroundColor: isRead ? COLORS.hoverLight : COLORS.hoverDark 
  },
  position: 'relative',
}));

const Notifications = ({ updateUnreadCount }) => {
  // Состояния
  const [settings, setSettings] = useState({
    testReminders: true,
    resultAlerts: true
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [syncingData, setSyncingData] = useState(false);
  const [hasMarkedAllRead, setHasMarkedAllRead] = useState(false); // Для предотвращения повторного сброса

  // Получение настроек уведомлений
  const fetchSettings = useCallback(async () => {
    try {
      const response = await api.get("/notifications/settings/");
      setSettings({
        testReminders: response.data.testReminders ?? true,
        resultAlerts: response.data.resultAlerts ?? true
      });
      return true;
    } catch (err) {
      console.error("Error fetching notification settings:", err);
      setError("Failed to load notification settings");
      showSnackbar("Failed to load settings", "error");
      return false;
    }
  }, []);

  // Получение уведомлений с пагинацией
  const fetchNotifications = useCallback(async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) {
        setSyncingData(true);
      } else if (pageNum === 1) {
        setInitialLoading(true);
      } else {
        setLoading(true);
      }
      
      const response = await api.get("/notifications/", {
        params: {
          page: pageNum,
          page_size: ITEMS_PER_PAGE
        }
      });
      
      const newNotifications = response.data.results;
      
      setNotifications(prev => {
        if (refresh || pageNum === 1) {
          return newNotifications;
        } else {
          return [...prev, ...newNotifications];
        }
      });
      
      setHasMore(response.data.next !== null);
      setError(null);
      
      return newNotifications;
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
      showSnackbar("Failed to load notifications", "error");
      return null;
    } finally {
      setInitialLoading(false);
      setLoading(false);
      setSyncingData(false);
    }
  }, []);

  // Обработчик сообщений Snackbar
  const showSnackbar = useCallback((message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  }, []);

  // Начальная загрузка данных
  useEffect(() => {
    const initialize = async () => {
      setInitialLoading(true);
      await fetchSettings();
      await fetchNotifications(1);
      setInitialLoading(false);
    };
    
    initialize();
    
    // Настройка периодической синхронизации
    const syncInterval = setInterval(() => {
      fetchNotifications(1, true);
    }, SYNC_INTERVAL);
    
    return () => clearInterval(syncInterval);
  }, [fetchSettings, fetchNotifications]);

  // Загрузка следующей страницы при изменении номера страницы
  useEffect(() => {
    if (page > 1) {
      fetchNotifications(page);
    }
  }, [page, fetchNotifications]);

  // Сохранение настроек
  const saveSettings = useCallback(async (newSettings) => {
    setSavingSettings(true);
    try {
      await api.put("/notifications/settings/", newSettings);
      setSettings(newSettings);
      showSnackbar("Settings saved successfully", "success");
    } catch (err) {
      console.error("Error saving settings:", err);
      showSnackbar("Failed to save settings", "error");
    } finally {
      setSavingSettings(false);
    }
  }, [showSnackbar]);

  // Изменение настроек
  const handleSettingChange = useCallback((setting) => {
    const newSettings = { ...settings, [setting]: !settings[setting] };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Отметка уведомления как прочитанного
  const markAsRead = useCallback(async (id) => {
    try {
      await api.patch(`/notifications/${id}/mark-read/`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
      showSnackbar("Failed to mark notification as read", "error");
    }
  }, [showSnackbar]);

  // Отметка всех уведомлений как прочитанные
  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) return;
    
    try {
      await api.post("/notifications/mark-all-read/");
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      updateUnreadCount(0);
      showSnackbar("All notifications marked as read", "success");
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      showSnackbar("Failed to mark all notifications as read", "error");
    }
  }, [notifications, updateUnreadCount, showSnackbar]);

  // Удаление уведомления
  const deleteNotification = useCallback(async (id, event) => {
    if (event) {
      event.stopPropagation();
    }
    try {
      await api.delete(`/notifications/${id}/`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      showSnackbar("Notification deleted", "success");
    } catch (err) {
      console.error("Error deleting notification:", err);
      showSnackbar("Failed to delete notification", "error");
    }
  }, [showSnackbar]);

  // Загрузка дополнительных уведомлений
  const loadMore = useCallback(() => {
    if (!loading && !syncingData && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, syncingData, hasMore]);

  // Обновление списка уведомлений
  const handleRefresh = useCallback(() => {
    setPage(1);
    fetchNotifications(1, true);
  }, [fetchNotifications]);

  // Закрытие Snackbar
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Мемоизированная группировка уведомлений по дате
  const groupedNotifications = useMemo(() => {
    const groups = {};
    notifications.forEach(notification => {
      const date = new Date(notification.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      let dateKey;
      if (date.toDateString() === today.toDateString()) {
        dateKey = "Сегодня";
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = "Вчера";
      } else {
        dateKey = date.toLocaleDateString('ru-RU', { 
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
  }, [notifications]);

  // Подсчет непрочитанных уведомлений
  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
    [notifications]
  );

  // === ГЛАВНОЕ: Логика отображения и сброса счётчика ===

  // 1. Сбросить счётчик при заходе в раздел уведомлений (только если включены уведомления)
  useEffect(() => {
    if (
      (settings.testReminders || settings.resultAlerts) &&
      !hasMarkedAllRead &&
      notifications.some(n => !n.read)
    ) {
      markAllAsRead();
      setHasMarkedAllRead(true);
    }
    // Если уведомления выключены, сбрасываем счётчик
    if (!settings.testReminders && !settings.resultAlerts) {
      updateUnreadCount(0);
    }
    // eslint-disable-next-line
  }, [settings, notifications]);

  // 2. Обновлять счётчик только если хотя бы один тип уведомлений включён
  useEffect(() => {
    if (settings.testReminders || settings.resultAlerts) {
      updateUnreadCount(unreadCount);
    } else {
      updateUnreadCount(0);
    }
  }, [unreadCount, settings, updateUnreadCount]);

  // 3. Сбросить флаг hasMarkedAllRead при обновлении уведомлений (например, при появлении новых)
  useEffect(() => {
    if (notifications.some(n => !n.read)) {
      setHasMarkedAllRead(false);
    }
  }, [notifications]);

  return (
    <ScrollContainer role="region" aria-label="Уведомления">
      <Box sx={{ p: 2 }}>
        {/* Заголовок */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3, 
          justifyContent: 'space-between' 
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            transform: 'translateY(-5px)',
            ml: -0.5
          }}>
            <NotificationsIcon sx={{ 
              mr: 1, 
              fontSize: 24, 
              color: COLORS.darkPrimary
            }} />
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold', 
              color: COLORS.darkPrimary
            }}>
              Уведомления
            </Typography>
            {(settings.testReminders || settings.resultAlerts) && unreadCount > 0 && (
              <Badge 
                badgeContent={unreadCount} 
                color="error" 
                sx={{ ml: 2 }} 
                aria-label={`${unreadCount} непрочитанных уведомлений`}
              />
            )}
          </Box>
          
          <Box>
            {(settings.testReminders || settings.resultAlerts) && unreadCount > 0 && (
              <Button
                size="small"
                variant="text"
                onClick={markAllAsRead}
                disabled={initialLoading || syncingData}
                sx={{ mr: 1, color: COLORS.primary }}
                aria-label="Отметить все как прочитанные"
              >
                Прочитать все
              </Button>
            )}
            
            <IconButton 
              onClick={handleRefresh} 
              disabled={initialLoading || syncingData}
              sx={{ color: COLORS.primary }}
              aria-label="Обновить уведомления"
            >
              {(initialLoading || syncingData) ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Refresh />
              )}
            </IconButton>
          </Box>
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
            }}
            aria-live="polite"
            aria-label="Сохранение настроек"
            >
              <CircularProgress size={24} />
            </Box>
          )}
          
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: COLORS.darkPrimary, mb: 2 }}>
            Настройки уведомлений
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            p: 1,
            borderRadius: 1,
            '&:hover': { bgcolor: COLORS.hoverLight }
          }}>
            <Box>
              <Typography sx={{ color: COLORS.darkPrimary, fontSize: '0.9rem' }}>
                Напоминания о тестах
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.primary, fontSize: '0.8rem' }}>
                Получать напоминания о предстоящих тестах
              </Typography>
            </Box>
            <Switch
              checked={settings.testReminders}
              onChange={() => handleSettingChange('testReminders')}
              color="primary"
              size="small"
              disabled={savingSettings || initialLoading}
              inputProps={{
                'aria-label': 'Включить напоминания о тестах'
              }}
            />
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1,
            borderRadius: 1,
            '&:hover': { bgcolor: COLORS.hoverLight }
          }}>
            <Box>
              <Typography sx={{ color: COLORS.darkPrimary, fontSize: '0.9rem' }}>
                Оповещения о результатах
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.primary, fontSize: '0.8rem' }}>
                Уведомлять, когда доступны результаты тестов
              </Typography>
            </Box>
            <Switch
              checked={settings.resultAlerts}
              onChange={() => handleSettingChange('resultAlerts')}
              color="primary"
              size="small"
              disabled={savingSettings || initialLoading}
              inputProps={{
                'aria-label': 'Включить оповещения о результатах'
              }}
            />
          </Box>
        </Paper>
      </Box>

      {/* Список уведомлений */}
      <Box className="scroll-content">
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ 
            fontWeight: 'bold',
            color: COLORS.darkPrimary,
            mb: 2,
            px: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Недавние уведомления</span>
            {syncingData && notifications.length > 0 && (
              <CircularProgress size={16} sx={{ ml: 1 }} />
            )}
          </Typography>
          
          {initialLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={30} sx={{ color: COLORS.primary }} />
            </Box>
          ) : error && notifications.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              p: 3, 
              color: '#FF3B30', 
              bgcolor: 'rgba(255,59,48,0.05)', 
              borderRadius: 2 
            }}>
              <Typography variant="body2">{error}</Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleRefresh}
                sx={{ mt: 1, color: COLORS.primary, borderColor: COLORS.primary }}
              >
                Попробовать снова
              </Button>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              p: 3, 
              color: COLORS.primary,
              bgcolor: 'rgba(0,77,0,0.03)',
              borderRadius: 2
            }}>
              <Typography variant="body2">
                Нет доступных уведомлений
              </Typography>
            </Box>
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
                      color: COLORS.primary,
                      px: 1
                    }}
                  >
                    {dateGroup}
                  </Typography>
                  <List dense>
                    {notifs.map((notification) => (
                      <React.Fragment key={notification.id}>
                        <NotificationItem
                          isRead={notification.read}
                          onClick={() => !notification.read && markAsRead(notification.id)}
                          button
                          aria-label={notification.read ? "Уведомление прочитано" : "Отметить как прочитанное"}
                        >
                          <ListItemText
                            primary={notification.subject}
                            secondary={
                              <>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: COLORS.primary, 
                                    fontSize: '0.75rem',
                                    mb: 0.5
                                  }}
                                >
                                  {notification.body}
                                </Typography>
                                <Typography variant="caption" sx={{ color: COLORS.primary }}>
                                  {new Date(notification.created_at).toLocaleTimeString('ru-RU', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </Typography>
                              </>
                            }
                            sx={{
                              '& .MuiListItemText-primary': {
                                fontWeight: notification.read ? 'normal' : '600',
                                color: COLORS.darkPrimary,
                                fontSize: '0.875rem'
                              }
                            }}
                          />
                          <IconButton
                            edge="end"
                            onClick={(e) => deleteNotification(notification.id, e)}
                            sx={{ color: COLORS.primary }}
                            size="small"
                            aria-label="Удалить уведомление"
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </NotificationItem>
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
                    disabled={loading || syncingData}
                    startIcon={loading ? <CircularProgress size={16} /> : <ExpandMore />}
                    sx={{ color: COLORS.primary }}
                    aria-label="Загрузить больше уведомлений"
                  >
                    Загрузить ещё
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
  
      {/* Всплывающие уведомления */}
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