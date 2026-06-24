import { createContext, useState, useEffect } from 'react';
<<<<<<< HEAD
import api from '../services/api';
=======
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

<<<<<<< HEAD
  const normalizeUser = (payloadUser) => ({
    userId: payloadUser.userId ?? payloadUser.user_id,
    fullName: payloadUser.fullName ?? payloadUser.full_name,
    email: payloadUser.email,
    role: payloadUser.role?.toLowerCase(),
    ownerId: payloadUser.ownerId,
    jockeyId: payloadUser.jockeyId,
    staffId: payloadUser.staffId,
    refereeId: payloadUser.refereeId,
  });

  // Khôi phục session từ localStorage, nhưng xác thực lại bằng JWT trên backend.
  useEffect(() => {
    let alive = true;

    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        if (alive) setLoading(false);
        return;
      }

      try {
        const res = await api.get('/me');
        const verifiedUser = normalizeUser(res.data);
        localStorage.setItem('user', JSON.stringify(verifiedUser));
        if (alive) setUser(verifiedUser);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (alive) setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    restoreSession();
    return () => { alive = false; };
=======
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
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
  }, []);

  // EXCEPTION #1: lưu CẢ token + user object
  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // EXCEPTION #6: redirect bằng window.location.href, KHÔNG useNavigate trong Context
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
