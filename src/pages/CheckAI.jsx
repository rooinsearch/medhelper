import React, { useState, useRef, useEffect } from "react";
import {
  Box, Typography, TextField, IconButton, Avatar,
  CircularProgress, Paper, Menu, MenuItem, Dialog,
  DialogContent, DialogTitle, Button, Alert
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Send, MoreVert, Delete, Add, Image, History, Download, Warning
} from "@mui/icons-material";
import axios from "axios";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || "ваш_api_ключ_здесь";

// Пример функции для отправки запроса
async function sendToGemini(prompt) {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

const medicalBackground = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <!-- Анимированный стетоскоп -->
    <path d="M50,20 Q60,20 60,30 T70,40 L70,50 Q70,60 65,60" stroke="#0A3D2F" stroke-width="2" fill="none">
      <animate attributeName="d" 
        values="M50,20 Q60,20 60,30 T70,40 L70,50 Q70,60 65,60;
                M50,20 Q65,22 65,32 T75,42 L75,52 Q75,62 70,62;
                M50,20 Q60,20 60,30 T70,40 L70,50 Q70,60 65,60" 
        dur="5s" repeatCount="indefinite"/>
    </path>
    
    <!-- Пульсирующий крест -->
    <g transform="translate(25,25)">
      <rect x="-3" y="-10" width="6" height="20" fill="green">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
      </rect>
      <rect x="-10" y="-3" width="20" height="6" fill="green">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
      </rect>
    </g>
    
    <!-- Вращающаяся молекула -->
    <g transform="translate(75,25)">
      <circle cx="0" cy="0" r="3" fill="#E3A700">
        <animate attributeName="r" values="3;4;3" dur="3s" repeatCount="indefinite"/>
      </circle>
      <g>
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="10s" repeatCount="indefinite"/>
        <circle cx="0" cy="-8" r="2" fill="#E3A700" opacity="0.8"/>
        <circle cx="8" cy="0" r="2" fill="#E3A700" opacity="0.8"/>
        <circle cx="0" cy="8" r="2" fill="#E3A700" opacity="0.8"/>
        <circle cx="-8" cy="0" r="2" fill="#E3A700" opacity="0.8"/>
      </g>
    </g>
    
    <!-- Движущиеся капсулы -->
    <g transform="translate(20,70)">
      <ellipse cx="0" cy="0" rx="10" ry="5" fill="#0A3D2F" opacity="0.7">
        <animate attributeName="rx" values="10;12;10" dur="4s" repeatCount="indefinite"/>
        <animate attributeName="ry" values="5;6;5" dur="4s" repeatCount="indefinite"/>
      </ellipse>
      <animateTransform attributeName="transform" 
        type="translate" 
        from="20,70" 
        to="80,70" 
        dur="15s" 
        repeatCount="indefinite"
        additive="sum"/>
    </g>
    
    <!-- Пульсирующая сердечная линия -->
    <polyline points="10,85 15,85 20,65 25,95 30,85 35,85" 
      stroke="#FF8C00" 
      fill="none" 
      stroke-width="1.5">
      <animate attributeName="points" 
        values="10,85 15,85 20,65 25,95 30,85 35,85;
                10,85 15,85 20,75 25,85 30,85 35,85;
                10,85 15,85 20,65 25,95 30,85 35,85" 
        dur="1.5s" 
        repeatCount="indefinite"/>
    </polyline>
    
    <!-- Движущиеся ДНК спирали -->
    <path d="M85,40 C90,45 90,55 85,60 C80,65 80,75 85,80" 
      stroke="#E3A700" 
      fill="none" 
      stroke-width="1.5">
      <animate attributeName="d" 
        values="M85,40 C90,45 90,55 85,60 C80,65 80,75 85,80;
                M85,40 C80,45 80,55 85,60 C90,65 90,75 85,80;
                M85,40 C90,45 90,55 85,60 C80,65 80,75 85,80" 
        dur="6s" 
        repeatCount="indefinite"/>
    </path>
    <path d="M80,40 C75,45 75,55 80,60 C85,65 85,75 80,80" 
      stroke="#0A3D2F" 
      fill="none" 
      stroke-width="1.5">
      <animate attributeName="d" 
        values="M80,40 C75,45 75,55 80,60 C85,65 85,75 80,80;
                M80,40 C85,45 85,55 80,60 C75,65 75,75 80,80;
                M80,40 C75,45 75,55 80,60 C85,65 85,75 80,80" 
        dur="6s" 
        repeatCount="indefinite"/>
    </path>
  </svg>
`;

const createAppTheme = () => createTheme({
  palette: {
    primary: { main: "#001A00" },
    secondary: { main: "#6D6D6D" },
    background: {
      default: "#F7F9FC",
      paper: "#FFFFFF"
    },
    chat: {
      user: "#001A00",
      ai: "#F0F2F5",
      aiAlt: "#EBEEF2"
    },
    text: {
      primary: "#2D3748",
      secondary: "#718096"
    }
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h5: { fontWeight: 700 },
    body1: { fontWeight: 400 },
    button: { fontWeight: 600 }
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          padding: "8px 18px",
          borderRadius: 30,
          transition: "all 0.2s ease"
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 30,
            backgroundColor: "#F5F7FA",
            "&:hover": { backgroundColor: "#EFF1F5" },
            "&.Mui-focused": { backgroundColor: "#EFF1F5" }
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          boxShadow: "0 8px 32px rgba(6, 6, 6, 0.08)"
        }
      }
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 700
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: "transform 0.2s ease",
          "&:hover": {
            transform: "scale(1.05)"
          }
        }
      }
    }
  }
});

export default function EnhancedAIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState("default");
  const [anchorEl, setAnchorEl] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [apiLimit, setApiLimit] = useState(15);
  const [apiError, setApiError] = useState(null);
  const [emergencyAlert, setEmergencyAlert] = useState(false);

  const theme = createAppTheme();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Загрузка истории чатов при инициализации
  useEffect(() => {
    const savedChats = localStorage.getItem("aiChatHistory");
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      setChatHistory(parsedChats);
      if (parsedChats.length > 0) {
        setCurrentChatId(parsedChats[0].id);
        setMessages(parsedChats[0].messages);
      }
    }
  }, []);

  // Сохранение истории чатов при изменении сообщений
  useEffect(() => {
    if (messages.length > 0) {
      const existingChats = [...chatHistory];
      const chatIndex = existingChats.findIndex(chat => chat.id === currentChatId);
      
      if (chatIndex >= 0) {
        existingChats[chatIndex].messages = messages;
        existingChats[chatIndex].lastUpdated = new Date().toISOString();
      } else {
        const newChat = {
          id: currentChatId || `chat_${Date.now()}`,
          title: messages[0]?.content.substring(0, 30) + "...",
          messages: messages,
          lastUpdated: new Date().toISOString()
        };
        existingChats.unshift(newChat);
        setCurrentChatId(newChat.id);
      }
      
      existingChats.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
      setChatHistory(existingChats);
      localStorage.setItem("aiChatHistory", JSON.stringify(existingChats));
    }
  }, [messages]);

  // Прокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Определение языка сообщения
  const detectLanguage = (text) => {
    return /[а-яА-ЯЁё]/.test(text) ? 'ru' : 'en';
  };

  // Запрос к Gemini API с улучшенным промптом
  const fetchAIResponse = async (userMessage, attachedImage = null) => {
    if (apiLimit <= 0) {
      const isEnglish = detectLanguage(userMessage) === 'en';
      setMessages(prev => [...prev, {
        role: "ai",
        content: isEnglish 
          ? "Daily request limit reached (15/day). Try again tomorrow." 
          : "Достигнут дневной лимит запросов (15/день). Попробуйте завтра.",
        timestamp: new Date().toISOString()
      }]);
      return;
    }

    setIsTyping(true);
    setApiError(null);
    setEmergencyAlert(false);

    try {
      const userLanguage = detectLanguage(userMessage);
      const isEnglish = userLanguage === 'en';
      
      const disclaimer = isEnglish
        ? "⚠️ **Important**: I'm an AI assistant, not a doctor. For serious symptoms, consult a healthcare professional immediately.\n\n"
        : "⚠️ **Важно**: Я ИИ-ассистент, а не врач. При серьезных симптомах срочно обратитесь к специалисту.\n\n";

      const promptTemplate = isEnglish
        ? `${disclaimer}### Analysis:\n[Brief context]\n\n### Recommendations:\n1. [Action 1]\n2. [Action 2]\n\n### ❗ Emergency signs:\n• [Symptom 1]\n• [Symptom 2]\n\nKeep response under 500 tokens. Be factual. Question: ${userMessage}`
        : `${disclaimer}### Анализ:\n[Краткий контекст]\n\n### Рекомендации:\n1. [Действие 1]\n2. [Действие 2]\n\n### 🚨 Срочно к врачу:\n• [Симптом 1]\n• [Симптом 2]\n\nОтветьте кратко (до 500 токенов). Вопрос: ${userMessage}`;

      const contents = [];
      
      if (attachedImage) {
        const imagePart = {
          inlineData: {
            data: attachedImage.split(',')[1],
            mimeType: 'image/png'
          }
        };
        
        contents.push({
          parts: [
            { text: promptTemplate },
            imagePart
          ]
        });
      } else {
        contents.push({
          parts: [
            { text: promptTemplate }
          ]
        });
      }

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: contents,
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7
          }
        },
        { timeout: 10000 }
      );

      const aiText = response.data.candidates[0].content.parts[0].text;
      const aiResponse = {
        role: "ai",
        content: aiText,
        timestamp: new Date().toISOString(),
        language: userLanguage
      };
      
      // Проверка на опасные симптомы
      const dangerKeywords = isEnglish 
        ? ['emergency', 'urgent', 'stroke', 'heart attack', '911'] 
        : ['срочно', 'немедленно', 'инсульт', 'инфаркт', 'скорую'];
      
      if (dangerKeywords.some(keyword => aiText.includes(keyword))) {
        setEmergencyAlert(true);
      }
      
      setMessages((prevMessages) => [...prevMessages, aiResponse]);
      setApiLimit(prev => prev - 1);
    } catch (error) {
      console.error("API Error:", error);
      const isEnglish = detectLanguage(input) === 'en';
      setApiError(error.message);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "ai",
          content: isEnglish
            ? "🚨 Service error. Please try again later."
            : "🚨 Ошибка сервера. Попробуйте позже.",
          timestamp: new Date().toISOString(),
          error: true
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Обработка отправки сообщения
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() && !imagePreview) return;
    
    const newUserMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
      image: imagePreview,
      language: detectLanguage(input)
    };
    
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInput("");
    setImagePreview(null);
    setSelectedFile(null);
    fetchAIResponse(input, imagePreview);
  };

  // Выбор и предпросмотр файла
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();

    if (file.type.startsWith("image/")) {
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      const isEnglish = detectLanguage(input) === 'en';
      alert(isEnglish ? "Only images (JPEG, PNG) are supported" : "Поддерживаются только изображения (JPEG, PNG)");
      setSelectedFile(null);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(`chat_${Date.now()}`);
    setHistoryOpen(false);
    setEmergencyAlert(false);
  };

  const loadChat = (chatId) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chatId);
      setHistoryOpen(false);
      setEmergencyAlert(false);
    }
  };

  const deleteChat = (chatId) => {
    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
    setChatHistory(updatedHistory);
    localStorage.setItem("aiChatHistory", JSON.stringify(updatedHistory));
    if (currentChatId === chatId) startNewChat();
  };

  const downloadChatHistory = () => {
    const currentChat = chatHistory.find(chat => chat.id === currentChatId);
    if (!currentChat) return;
    const chatData = JSON.stringify(currentChat.messages, null, 2);
    const blob = new Blob([chatData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setAnchorEl(null);
  };

  const formatTime = (timestamp) => timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "background.default", padding: 2, position: "relative" }}>
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(medicalBackground)}")`,
            backgroundSize: '150px 150px',
            opacity: 0.2,
            zIndex: 0,
            animation: 'backgroundFloat 60s linear infinite',
            '@keyframes backgroundFloat': {
              '0%': { backgroundPosition: '0 0' },
              '100%': { backgroundPosition: '150px 150px' }
            }
          }}
        />

        <Box sx={{ width: "100%", maxWidth: 800, height: "85vh", display: "flex", flexDirection: "column", backgroundColor: "background.paper", borderRadius: 3, overflow: "hidden", position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 2, borderBottom: `1px solid rgba(0, 0, 0, 0.05)` }}>
            <Typography variant="h5" color="primary">CheckAI</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ mr: 2 }}>
                {detectLanguage(navigator.language) === 'ru' ? 'Запросов' : 'Requests'}: {apiLimit}/15
              </Typography>
              <Button startIcon={<History />} variant="outlined" onClick={() => setHistoryOpen(true)}>
                {detectLanguage(navigator.language) === 'ru' ? 'История' : 'History'}
              </Button>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}><MoreVert /></IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={startNewChat}><Add /> {detectLanguage(navigator.language) === 'ru' ? 'Новый чат' : 'New chat'}</MenuItem>
                <MenuItem onClick={downloadChatHistory}><Download /> {detectLanguage(navigator.language) === 'ru' ? 'Экспорт' : 'Export'}</MenuItem>
                <MenuItem onClick={() => { deleteChat(currentChatId); setAnchorEl(null); }}><Delete /> {detectLanguage(navigator.language) === 'ru' ? 'Удалить' : 'Delete'}</MenuItem>
              </Menu>
            </Box>
          </Box>

          {emergencyAlert && (
            <Alert 
              severity="error" 
              icon={<Warning />}
              sx={{ 
                mx: 2, 
                mt: 1,
                alignItems: 'center',
                '& .MuiAlert-message': { overflow: 'hidden' }
              }}
            >
              {detectLanguage(input) === 'en' 
                ? "⚠️ Critical symptoms detected! Please seek immediate medical attention!" 
                : "⚠️ Обнаружены опасные симптомы! Немедленно обратитесь за медицинской помощью!"}
            </Alert>
          )}

          <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)}>
            <DialogTitle>{detectLanguage(navigator.language) === 'ru' ? 'История чатов' : 'Chat history'}</DialogTitle>
            <DialogContent>
              <Button fullWidth variant="contained" startIcon={<Add />} onClick={startNewChat}>
                {detectLanguage(navigator.language) === 'ru' ? 'Новый чат' : 'New chat'}
              </Button>
              {chatHistory.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 1 }}>
                  <Typography variant="body1">
                    {detectLanguage(navigator.language) === 'ru' ? 'История чатов пуста' : 'No chat history'}
                  </Typography>
                </Box>
              ) : (
                chatHistory.map(chat => (
                  <Paper key={chat.id} sx={{ p: 2, mb: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => loadChat(chat.id)}>
                    <Box sx={{ overflow: "hidden", flexGrow: 1 }}>
                      <Typography variant="body1">{chat.title}</Typography>
                      <Typography variant="caption">{new Date(chat.lastUpdated).toLocaleString()}</Typography>
                    </Box>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}><Delete /></IconButton>
                  </Paper>
                ))
              )}
            </DialogContent>
          </Dialog>

          <Box sx={{ flexGrow: 1, overflowY: "auto", p: 3 }}>
            {messages.length === 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <Typography variant="h4">
                  {detectLanguage(navigator.language) === 'ru' ? "Чем могу помочь?" : "How can I help?"}
                </Typography>
                <Typography variant="body1">
                  {detectLanguage(navigator.language) === 'ru' 
                    ? "Задайте вопрос или загрузите изображение" 
                    : "Ask a question or upload an image"}
                </Typography>
              </Box>
            ) : (
              messages.map((msg, index) => (
                <Box key={index} sx={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: "flex-start", mb: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: msg.role === "user" ? theme.palette.primary.main : theme.palette.secondary.main,
                    position: 'relative'
                  }}>
                    {msg.role === "user" ? (detectLanguage(navigator.language) === 'ru' ? "Вы" : "You") : "AI"}
                    <Box sx={{
                      position: 'absolute',
                      bottom: -5,
                      right: -5,
                      bgcolor: msg.language === 'en' ? '#1976d2' : '#d32f2f',
                      color: 'white',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      fontSize: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {msg.language === 'en' ? 'EN' : 'RU'}
                    </Box>
                  </Avatar>
                  <Box sx={{ mx: 1.5, maxWidth: "75%" }}>
                    <Paper sx={{ 
                      p: 2, 
                      borderRadius: msg.role === "user" ? "20px 20px 5px 20px" : "20px 20px 20px 5px",
                      whiteSpace: 'pre-wrap',
                      '& strong': { fontWeight: 'bold' },
                      '& em': { fontStyle: 'italic' }
                    }}>
                      {msg.image && <img src={msg.image} alt="User upload" style={{ maxWidth: "100%", maxHeight: 250, borderRadius: 2, marginBottom: 16 }} />}
                      <Typography component="div" dangerouslySetInnerHTML={{ 
                        __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                          .replace(/\n/g, '<br />') 
                      }} />
                    </Paper>
                    <Typography variant="caption">{formatTime(msg.timestamp)}</Typography>
                  </Box>
                </Box>
              ))
            )}
            {isTyping && (
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>AI</Avatar>
                <Paper sx={{ p: 2, ml: 1.5 }}>
                  <CircularProgress size={16} color="primary" />
                  <Typography variant="body2">
                    {detectLanguage(input) === 'ru' ? "Обработка запроса..." : "Processing request..."}
                  </Typography>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {imagePreview && (
            <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <img src={imagePreview} alt="Preview" style={{ height: 50, width: 50, objectFit: "cover", borderRadius: 8 }} />
                <Typography variant="body2">{selectedFile?.name || (detectLanguage(navigator.language) === 'ru' ? "Изображение" : "Image")}</Typography>
              </Box>
              <IconButton color="error" onClick={() => { setSelectedFile(null); setImagePreview(null); }}><Delete /></IconButton>
            </Box>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, display: "flex", alignItems: "center" }}>
            <IconButton onClick={() => fileInputRef.current.click()}><Image /></IconButton>
            <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleFileSelect} />
            <TextField 
              fullWidth 
              placeholder={detectLanguage(navigator.language) === 'ru' ? "Введите сообщение..." : "Type a message..."} 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              sx={{ mr: 1 }} 
            />
            <IconButton type="submit" disabled={!input.trim() && !imagePreview}><Send /></IconButton>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}