import '@/styles/globals.css'
import { ThemeProvider } from '@material-ui/core/styles';
import  CssBaseline  from '@material-ui/core/CssBaseline';
import { theme } from '../styles/theme';


export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
