'use client';
import { Inter } from "next/font/google";
import { createTheme } from '@mui/material/styles';
import { blue, yellow } from "@mui/material/colors";

const inter = Inter({ subsets: ['latin'] });

const theme = createTheme({
  palette: {
    primary: {
      main: blue[700],
    },
    secondary: {
      main: yellow[800],
    },
    background: {
      default: '#f1f3f4',
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 400,
      fontSize: '1.25rem',
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true,
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        variant: 'outlined', // Change default variant to outlined
      },
    },
  }
});

export default theme;