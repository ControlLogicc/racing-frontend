import { BrowserRouter } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import AppRoutes from './routes';

export default function App() {
  // AuthProvider bọc ngoài Router: nó chỉ dùng window.location nên không cần Router context
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}