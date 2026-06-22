import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khôi phục session từ localStorage khi app mount
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const rawUser = localStorage.getItem('user');
      if (token && rawUser) {
        setUser(JSON.parse(rawUser)); // parse an toàn trong try/catch
      }
    } catch {
      // chuỗi user hỏng -> dọn sạch để tránh treo app
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false); // luôn tắt loading dù thành công hay lỗi
    }
  }, []);

  // EXCEPTION #1: lưu CẢ token + user object
  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const updateUser = (updatedFields) => {
    const merged = { ...JSON.parse(localStorage.getItem('user') || '{}'), ...updatedFields };
    localStorage.setItem('user', JSON.stringify(merged));
    setUser(merged);
  };

  // EXCEPTION #6: redirect bằng window.location.href, KHÔNG useNavigate trong Context
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}