import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Создаем тему с кастомным шрифтом
const theme = createTheme({
  typography: {
    fontFamily: "Poppins, sans-serif",
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Сбрасывает стандартные стили браузера */}
      {/* Весь твой контент */}
    </ThemeProvider>
  );
}

export default App;

