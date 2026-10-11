import React, { useState } from 'react';
import './Login.css';
// Dùng lucide-react hoặc react-icons cho các icon
import { User, Lock, Eye, EyeOff, ShieldCheck, Heart, TrendingUp, LogIn } from 'lucide-react';
import logoImg from '../../assets/Logo.png';
import heroImg from '../../assets/Hero.png';
import childrenImg from '../../assets/iconchildren.png'
import fishBlueImg from '../../assets/Fish.png';
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ username, password, rememberMe });
    // Xử lý gửi API đăng nhập tại đây (Fetch / Axios)
  };

  return (
    <div className="login-container" style={{ backgroundImage: `url(${heroImg})` }}>      {/* Nền phía trái / Hình nền minh họa */}
      <div className="login-left">
        {/* Logo góc trên bên trái */}
        <div className="top-logo">
          <img src={logoImg} alt="BabyShark Logo" className="brand-logo" />
          <div className="brand-text">
            <h2>BabyShărk</h2>
            <p>Hệ thống quản lý mầm non</p>
          </div>
          <div className="characters">
            <img src={childrenImg} alt="Ba đứa trẻ" className="kids" />
            <img src={fishBlueImg} alt="Cá xanh BabyShark" className="fish-blue" />
          </div>
        </div>

        {/* Thông tin mô tả bên trái */}
        <div className="left-content">
          <div className="badges-list">
            <span className="badge love"><span className="icon">❤️</span> Yêu thương</span>
            <span className="badge respect"><span className="icon">⭐</span> Tôn trọng</span>
            <span className="badge grow"><span className="icon">🌱</span> Phát triển</span>
            <span className="badge happy"><span className="icon">😊</span> Hạnh phúc</span>
          </div>

          <div className="features-card">
            <div className="feature-item">
              <ShieldCheck className="f-icon" />
              <div>
                <strong>An toàn</strong>
                <p>dữ liệu</p>
              </div>
            </div>
            <div className="divider"></div>
            <div className="feature-item">
              <Heart className="f-icon" />
              <div>
                <strong>Đồng hành</strong>
                <p>cùng trẻ</p>
              </div>
            </div>
            <div className="divider"></div>
            <div className="feature-item">
              <TrendingUp className="f-icon" />
              <div>
                <strong>Hiện đại</strong>
                <p>hiệu quả</p>
              </div>
            </div>
          </div>

          <p className="sub-description">
            BabyShark – Giải pháp quản lý mầm non thông minh,<br />
            kết nối nhà trường và phụ huynh.
          </p>
        </div>
      </div>

      {/* Khung Đăng nhập phía phải */}
      <div className="login-right">
        {/* Slogan góc trên bên phải */}
        <div className="slogan-text">
          Cùng con lớn lên <br /> mỗi ngày ♡
        </div>

        <div className="login-card">
          {/* Logo trong Card - Đã sửa lại dùng biến logoImg */}
          <div className="card-header">
            <img src={logoImg} alt="BabyShark Logo" className="card-logo" />
            <h2 className="brand-title">BabyShărk</h2>
            <p className="brand-subtitle">Hệ thống quản lý mầm non</p>
          </div>

          <div className="form-title-group">
            <h3>Đăng nhập hệ thống</h3>
            <p>Vui lòng nhập thông tin để tiếp tục</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Ô nhập Tên đăng nhập */}
            <div className="input-group">
              <User className="input-icon" size={20} />
              <input
                type="text"
                placeholder="Tên đăng nhập hoặc Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Ô nhập Mật khẩu */}
            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Ghi nhớ & Quên mật khẩu */}
            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark"></span>
                Ghi nhớ đăng nhập
              </label>
              <a href="#forgot" className="forgot-link">Quên mật khẩu?</a>
            </div>

            {/* Nút Đăng nhập */}
            <button type="submit" className="submit-btn">
              <LogIn size={18} style={{ marginRight: '8px' }} /> Đăng nhập
            </button>
          </form>

          <div className="or-divider">
            <span>Hoặc</span>
          </div>

          {/* Thông báo bên dưới */}
          <div className="info-banner">
            <ShieldCheck className="info-icon" size={24} />
            <span>Hệ thống dành riêng cho cán bộ, giáo viên và phụ huynh của trường mầm non.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;