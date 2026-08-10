// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import 'leaflet/dist/leaflet.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AlertProvider } from './context/AlertContext.jsx'
import { FavoritesProvider } from './context/FavoritesContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import {LocationProvider} from './context/LocationContext.jsx'
import { useLocation as useRouterLocation } from "react-router-dom";

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <LocationProvider>
                    <NotificationProvider>
            <AlertProvider>
              <App />
            </AlertProvider>
                    </NotificationProvider>
              </LocationProvider>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
)