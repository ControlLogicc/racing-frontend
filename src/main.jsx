import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// 1. App.jsx giờ đang nằm ngay cạnh main.jsx
import App from './App.jsx';

// 2. Tìm vào thư mục context
import { AuthProvider } from './context/AuthContext.jsx';

// 3. Tìm vào thư mục styles
import './styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);