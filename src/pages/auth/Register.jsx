import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'SPECTATOR' // Mặc định là Khán giả
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Gửi Payload lên Backend
      await apiService.register(formData);
      
      setSuccess('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
      // Đợi 1.5s rồi chuyển về trang Login
      setTimeout(() => navigate('/login'), 1500);
      
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Email có thể đã tồn tại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow-sm" style={{ width: '450px', borderRadius: '12px' }}>
        <div className="text-center mb-4">
          <h3 className="fw-bold text-success">Đăng Ký Tài Khoản</h3>
          <p className="text-muted small">Dành cho Khán giả, Chủ ngựa và Nài ngựa</p>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}
        {success && <div className="alert alert-success py-2">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Họ và Tên</label>
            <input type="text" name="fullName" className="form-control" value={formData.fullName} onChange={handleChange} required />
          </div>
          
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
          </div>
          
          <div className="mb-3">
            <label className="form-label fw-semibold">Mật khẩu</label>
            <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} required />
          </div>
          
          <div className="mb-4">
            <label className="form-label fw-semibold">Vai trò (Role)</label>
            <select name="role" className="form-select" value={formData.role} onChange={handleChange}>
              <option value="SPECTATOR">Spectator (Khán giả theo dõi)</option>
              <option value="OWNER">Owner (Chủ ngựa / Huấn luyện)</option>
              <option value="JOCKEY">Jockey (Nài ngựa thi đấu)</option>
            </select>
          </div>
          
          <button type="submit" className="btn btn-success w-100 fw-bold" disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Xác nhận Đăng ký'}
          </button>
        </form>

        <div className="text-center mt-4 small">
          Đã có tài khoản? <Link to="/login" className="text-decoration-none fw-bold">Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;