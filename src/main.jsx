import React from 'react'
import ReactDOM from 'react-dom/client'
import {router} from './App.jsx'
import {RouterProvider} from "react-router-dom";
import {CssBaseline, ThemeProvider} from "@mui/material";
import './index.css'
import theme from "./theme";
import { SnackbarProvider } from 'notistack'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            <RouterProvider router={router} />
          </SnackbarProvider>
      </ThemeProvider>
  </React.StrictMode>,
)
