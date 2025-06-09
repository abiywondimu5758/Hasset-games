import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { CssBaseline, createTheme, ThemeProvider } from '@mui/material';
import { useThemeStore } from './store/themeStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// eslint-disable-next-line react-refresh/only-export-components
const Root = () => {
  const { theme } = useThemeStore();
  const muiTheme = createTheme({
    palette: {
      mode: theme, // Set MUI theme mode (light or dark)
    },
  });

  return (
    
    <ThemeProvider theme={muiTheme}>
      <QueryClientProvider client={queryClient}>
        <CssBaseline />
        <App />
      </QueryClientProvider>
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<Root />);
