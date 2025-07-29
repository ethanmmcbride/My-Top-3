import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Auth from './Auth.jsx'

const token = localStorage.getItem('token');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {token ? <App /> : <Auth />}
  </StrictMode>,
)
