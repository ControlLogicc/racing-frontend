import { Link } from 'react-router-dom';

const Home = () => {
  const goldColor = '#D4AF37';

  return (
    <div style={{ backgroundColor: '#111', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* Thanh Điều Hướng (Navbar) */}
      <nav className="navbar navbar-expand-lg navbar-dark px-5 py-3 fixed-top" style={{ backgroundColor: 'rgba(17, 17, 17, 0.85)', backdropFilter: 'blur(10px)' }}>
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold" style={{ color: goldColor, letterSpacing: '2px' }} to="/">
            🏇 HKJC <span className="text-white fs-6 fw-normal">Prestige Racing</span>
          </Link>
          
          <div className="collapse navbar-collapse justify-content-center">
            <ul className="navbar-nav gap-4 fw-semibold" style={{ fontSize: '14px', letterSpacing: '1px' }}>
              <li className="nav-item"><Link className="nav-link" style={{ color: goldColor }} to="/">HOME</Link></li>
              <li className="nav-item"><Link className="nav-link text-white" to="#">RACING INFO</Link></li>
              <li className="nav-item"><Link className="nav-link text-white" to="#">GALLERY</Link></li>
              <li className="nav-item"><Link className="nav-link text-white" to="#">CONTACT</Link></li>
            </ul>
          </div>

          <div className="d-flex gap-3">
            <Link to="/login" className="btn fw-bold px-4" style={{ border: `1px solid ${goldColor}`, color: goldColor }}>LOGIN</Link>
            <Link to="/register" className="btn fw-bold px-4 text-dark" style={{ backgroundColor: goldColor }}>REGISTER</Link>
          </div>
        </div>
      </nav>

      {/* Phần Banner Chính (Hero Section) */}
      <div 
        className="d-flex align-items-center justify-content-center text-center" 
        style={{
          height: '100vh',
          // Thay link ảnh này bằng ảnh hero thực tế trong thư mục public/assets của bạn nếu có
          background: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(17, 17, 17, 0.9)), url("https://images.unsplash.com/photo-1598284566270-4fde5e3241ea?q=80&w=2000&auto=format&fit=crop") center/cover no-repeat'
        }}
      >
        <div className="container px-5" style={{ marginTop: '60px' }}>
          <h1 className="display-3 fw-bold mb-4" style={{ letterSpacing: '4px', textTransform: 'uppercase', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            Experience The <span style={{ color: goldColor }}>Thrill</span><br/> Of Horse Racing
          </h1>
          <p className="lead mb-5 mx-auto fw-light" style={{ maxWidth: '700px', color: '#ccc', letterSpacing: '1px' }}>
            Hệ thống quản lý giải đua ngựa đẳng cấp. Trở thành Chủ ngựa, Nài ngựa chuyên nghiệp và khẳng định vị thế của bạn trên đường đua HKJC.
          </p>
          <div className="d-flex justify-content-center gap-4">
            <Link to="/register" className="btn fw-bold btn-lg px-5 py-3 text-dark shadow" style={{ backgroundColor: goldColor, borderRadius: '4px', letterSpacing: '1px' }}>
              JOIN THE CLUB
            </Link>
            <Link to="/login" className="btn fw-bold btn-lg px-5 py-3 text-white" style={{ border: '2px solid #fff', borderRadius: '4px', letterSpacing: '1px' }}>
              EXPLORE MORE
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;