import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth(); // Lấy hàm login từ Context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Gọi API đăng nhập và lấy role trả về
      const role = await login({ email, password });
      
      // Chuyển hướng dựa theo role
      if (role === 'ADMIN') navigate('/admin/dashboard');
      else if (role === 'OWNER') navigate('/owner/dashboard');
      else if (role === 'JOCKEY') navigate('/jockey/dashboard');
      else if (role === 'REFEREE') navigate('/referee/dashboard');
      else if (role === 'HANDICAPPER') navigate('/handicapper/dashboard');
      else navigate('/'); // Mặc định cho Spectator
      
    } catch (err) {
      setError(err.message || 'Sai email hoặc mật khẩu!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow-sm" style={{ width: '400px', borderRadius: '12px' }}>
        <div className="text-center mb-4">
          <h3 className="fw-bold text-primary">Đăng Nhập</h3>
          <p className="text-muted small">Hệ thống quản lý đua ngựa HKJC</p>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="Nhập email..." 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">Mật khẩu</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Nhập mật khẩu..." 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="text-center mt-4 small">
          Chưa có tài khoản? <Link to="/register" className="text-decoration-none fw-bold">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;