import { useState, useRef, useEffect } from "react";
import { Card, CardContent, TextField, IconButton, Box, Typography, Button, Avatar, CircularProgress } from "@mui/material";
import { Mic, Upload, Send, Add } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

console.log("API_KEY (process.env):", process.env.REACT_APP_OPENAI_API_KEY);
const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

const API_URL = "https://api.openai.com/v1/chat/completions";

if (!API_KEY) {
  console.error("❌ Ошибка: API-ключ не найден! Проверь .env файл.");
}

const theme = createTheme({
  palette: {
    primary: { main: "#001A00", contrastText: "#ffffff" },
    secondary: { main: "#228B22" },
  },
});

export default function CheckAI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) console.log("📂 Файл загружен:", file.name);
  };

  const fetchAIResponse = async (userMessage) => {
    setIsTyping(true);

    const payload = {
      model: "gpt-3.5-turbo", // Или "gpt-4" для GPT-4
      messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: userMessage }],
      max_tokens: 256,
      temperature: 0.7,
    };

    console.log("🔹 Отправка запроса в OpenAI API...");
    console.log("🔑 API_KEY:", API_KEY);
    console.log("🌐 URL:", API_URL);
    console.log("📨 Запрос:", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error("❌ Ошибка запроса:", response.status, response.statusText);
        setMessages((prevMessages) => [...prevMessages, { role: "ai", content: `Ошибка ${response.status}: ${response.statusText}` }]);
        setIsTyping(false);
        return;
      }

      const data = await response.json();
      console.log("✅ Ответ API:", data);

      const aiResponse = {
        role: "ai",
        content: data.choices?.[0]?.message?.content || "Ошибка AI-ответа",
      };

      setMessages((prevMessages) => [...prevMessages, aiResponse]);
    } catch (error) {
      console.error("❌ Ошибка API:", error);
      setMessages((prevMessages) => [...prevMessages, { role: "ai", content: "Ошибка при получении ответа." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");

    fetchAIResponse(input);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box display="flex" width="100%" height="100vh" p={2} gap={2}>
        <Box sx={{ width: 250, bgcolor: "grey.100", p: 2, borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="h6" fontWeight="bold" mb={2} color="primary.main">Chats</Typography>
          <Button variant="contained" color="primary" startIcon={<Add />} fullWidth sx={{ fontWeight: "bold" }}>
            New Chat
          </Button>
        </Box>

        <Box flex={1} display="flex" flexDirection="column" gap={2}>
          <Typography variant="h4" fontWeight="bold" color="primary.main">Check AI</Typography>
          <Card sx={{ flex: 1, boxShadow: 3, borderRadius: 2 }}>
            <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <Box sx={{ flex: 1, overflowY: "auto", bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
                {messages.length === 0 ? (
                  <Typography color="textSecondary" textAlign="center">No messages yet</Typography>
                ) : (
                  messages.map((msg, index) => (
                    <Box key={index} display="flex" flexDirection="column" alignItems={msg.role === "user" ? "flex-end" : "flex-start"} mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {msg.role === "ai" && <Avatar sx={{ bgcolor: "primary.main" }}>AI</Avatar>}
                        <Box sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: msg.role === "user" ? "primary.main" : "grey.300", color: msg.role === "user" ? "white" : "black" }}>
                          {msg.content}
                        </Box>
                        {msg.role === "user" && <Avatar sx={{ bgcolor: "secondary.main" }}>U</Avatar>}
                      </Box>
                    </Box>
                  ))
                )}
                {isTyping && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ bgcolor: "primary.main" }}>AI</Avatar>
                    <Box sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: "grey.300" }}>
                      <CircularProgress size={14} />
                    </Box>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </Box>

              <Box component="form" onSubmit={handleSubmit} display="flex" alignItems="center" gap={1} mt={2}>
                <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} />
                <IconButton onClick={() => fileInputRef.current.click()} color="primary"><Upload /></IconButton>
                <TextField fullWidth variant="outlined" size="small" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Введите сообщение..." sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                <IconButton type="submit" color="primary"><Send /></IconButton>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
