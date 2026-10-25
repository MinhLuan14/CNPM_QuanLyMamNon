import { useCallback, useMemo, useRef, useState } from 'react';
import './Login.css';
// Dùng lucide-react hoặc react-icons cho các icon
import { User, Lock, Eye, EyeOff, ShieldCheck, Heart, TrendingUp, LogIn, X } from 'lucide-react';
import logoImg from '../../assets/Logo.png';
import heroImg from '../../assets/Hero.png';
import childrenImg from '../../assets/iconchildren.png'
import fishBlueImg from '../../assets/Fish.png';
import { authRequest, fetchCsrfToken, responseError } from '../../api/auth'
import Toast from '../../components/Toast'
const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isSupportSubmitting, setIsSupportSubmitting] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportError, setSupportError] = useState('');
  const [recoveryMode, setRecoveryMode] = useState('login');
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryRole, setRecoveryRole] = useState('PHUHUYNH');
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [isRecoverySubmitting, setIsRecoverySubmitting] = useState(false);
  const [supportForm, setSupportForm] = useState({
    hoTen: '',
    soDienThoai: '',
    email: '',
    loaiYeuCau: 'QUEN_MAT_KHAU',
    loaiTaiKhoan: 'PHUHUYNH',
    noiDung: '',
  });
  const submitInProgress = useRef(false);
  const loginToast = useMemo(() => error ? {
    type: 'error',
    title: 'Đăng nhập không thành công',
    message: error,
  } : null, [error]);
  const closeLoginToast = useCallback(() => setError(''), []);

  const openRecovery = (mode) => {
    setRecoveryMode(mode);
    setRecoveryEmail('');
    setRecoveryMessage('');
    setRecoveryError('');
    setIsRecoveryOpen(true);
  };

  const closeRecovery = () => {
    if (isRecoverySubmitting) return;
    setIsRecoveryOpen(false);
    setRecoveryMode('login');
    setRecoveryError('');
  };

  const handleRecoverySubmit = async (event) => {
    event.preventDefault();
    setIsRecoverySubmitting(true);
    setRecoveryError('');
    setRecoveryMessage('');
    try {
      const csrfToken = await fetchCsrfToken();
      const response = await authRequest(
        `/api/auth/${recoveryMode === 'forgot-username' ? 'forgot-username' : 'forgot-password'}`,
        {
          method: 'POST',
          headers: { 'X-XSRF-TOKEN': csrfToken },
          body: JSON.stringify({
            email: recoveryEmail.trim(),
            loaiTaiKhoan: recoveryRole,
          }),
        },
      );
      if (!response.ok) {
        throw new Error(await responseError(response, 'Không thể xử lý yêu cầu. Vui lòng thử lại sau.'));
      }
      const body = await response.json();
      setRecoveryMessage(body.message);
    } catch (requestError) {
      setRecoveryError(requestError.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setIsRecoverySubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitInProgress.current) return;

    submitInProgress.current = true;
    setError('');
    setIsSubmitting(true);

    try {
      const csrfToken = await fetchCsrfToken();
      const response = await authRequest('/api/auth/login', {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': csrfToken },
        body: JSON.stringify({ tenDangNhap: username, matKhau: password, rememberMe }),
      });

      if (!response.ok) {
        throw new Error(await responseError(response, 'Đăng nhập không thành công.'));
      }

      onLogin(await response.json());
    } catch (requestError) {
      setError(requestError.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      submitInProgress.current = false;
      setIsSubmitting(false);
    }
  };

  const openSupport = (loaiYeuCau) => {
    setSupportForm((current) => ({ ...current, loaiYeuCau }));
    setSupportMessage('');
    setSupportError('');
    setIsSupportOpen(true);
  };

  const closeSupport = () => {
    if (isSupportSubmitting) return;
    setIsSupportOpen(false);
    setSupportForm({
      hoTen: '',
      soDienThoai: '',
      email: '',
      loaiYeuCau: 'QUEN_MAT_KHAU',
      loaiTaiKhoan: 'PHUHUYNH',
      noiDung: '',
    });
    setSupportMessage('');
    setSupportError('');
  };

  const handleSupportSubmit = async (event) => {
    event.preventDefault();
    setIsSupportSubmitting(true);
    setSupportError('');
    try {
      const csrfToken = await fetchCsrfToken();
      const response = await authRequest('/api/auth/yeu-cau-ho-tro', {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': csrfToken },
        body: JSON.stringify({
          ...supportForm,
          hoTen: supportForm.hoTen.trim(),
          soDienThoai: supportForm.soDienThoai.trim(),
          email: supportForm.email.trim() || null,
          noiDung: supportForm.noiDung.trim() || null,
        }),
      });
      if (!response.ok) {
        throw new Error(await responseError(response, 'Không thể gửi yêu cầu. Vui lòng thử lại sau.'));
      }
      const body = await response.json();
      setSupportMessage(body.message);
    } catch (requestError) {
      setSupportError(requestError.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setIsSupportSubmitting(false);
    }
  };

  return (
    <>
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
              <span className="highlight">
                BabyShark – Giải pháp quản lý mầm non thông minh
              </span>
              <br />
              <span className="tagline">
                Kết nối nhà trường và phụ huynh.
              </span>
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
                  placeholder="Tên đăng nhập"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
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
              </div>

              {/* Nút Đăng nhập */}
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                <LogIn size={18} style={{ marginRight: '8px' }} />
                {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
              <div className="login-help-links">
                <button type="button" onClick={() => openRecovery('forgot-username')}>
                  Quên tên đăng nhập
                </button>
                <button type="button" onClick={() => openRecovery('forgot-password')}>
                  Quên mật khẩu
                </button>
              </div>
            </form>

            {/* Thông báo bên dưới */}
            <div className="info-banner">
              <ShieldCheck className="info-icon" size={24} />
              <span>Hệ thống dành riêng cho cán bộ, giáo viên và phụ huynh của trường mầm non.</span>
            </div>
          </div>
        </div>
        {isSupportOpen && (
          <div className="support-modal-backdrop" onClick={closeSupport}>
            <section
              className="support-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="support-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="support-modal-header">
                <div>
                  <h2 id="support-modal-title">Yêu cầu hỗ trợ đăng nhập</h2>
                  <p>Nhà trường sẽ tiếp nhận và xác minh thông tin trước khi hỗ trợ.</p>
                </div>
                <button type="button" onClick={closeSupport} aria-label="Đóng">
                  <X size={20} />
                </button>
              </header>
              {supportMessage ? (
                <div className="support-feedback" role="status">
                  <ShieldCheck size={22} />
                  <p>{supportMessage}</p>
                  <button className="submit-btn" type="button" onClick={closeSupport}>Đóng</button>
                </div>
              ) : (
                <form className="support-form" onSubmit={handleSupportSubmit}>
                  <label>
                    Loại tài khoản *
                    <select
                      value={supportForm.loaiTaiKhoan}
                      onChange={(event) => setSupportForm({ ...supportForm, loaiTaiKhoan: event.target.value })}
                      required
                    >
                      <option value="PHUHUYNH">Phụ huynh</option>
                      <option value="GIAOVIEN">Giáo viên</option>
                    </select>
                  </label>
                  <label>
                    Họ và tên đã đăng ký *
                    <input
                      value={supportForm.hoTen}
                      onChange={(event) => setSupportForm({ ...supportForm, hoTen: event.target.value })}
                      maxLength={356}
                      autoComplete="name"
                      required
                    />
                  </label>
                  <label>
                    Số điện thoại đã đăng ký *
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={supportForm.soDienThoai}
                      onChange={(event) => setSupportForm({ ...supportForm, soDienThoai: event.target.value })}
                      maxLength={20}
                      required
                    />
                  </label>
                  <label>
                    Email đã đăng ký (nếu có)
                    <input
                      type="email"
                      value={supportForm.email}
                      onChange={(event) => setSupportForm({ ...supportForm, email: event.target.value })}
                      maxLength={100}
                    />
                  </label>
                  <label>
                    Loại yêu cầu *
                    <select
                      value={supportForm.loaiYeuCau}
                      onChange={(event) => setSupportForm({ ...supportForm, loaiYeuCau: event.target.value })}
                      required
                    >
                      <option value="QUEN_TEN_DANG_NHAP">Quên tên đăng nhập</option>
                      <option value="QUEN_MAT_KHAU">Quên mật khẩu</option>
                      <option value="KHONG_DANG_NHAP_DUOC">Không đăng nhập được</option>
                      <option value="HO_TRO_KHAC">Yêu cầu hỗ trợ khác</option>
                    </select>
                  </label>
                  <label>
                    Nội dung mô tả (không bắt buộc)
                    <textarea
                      value={supportForm.noiDung}
                      onChange={(event) => setSupportForm({ ...supportForm, noiDung: event.target.value })}
                      maxLength={1000}
                      rows={3}
                    />
                  </label>
                  <p className="support-privacy-note">
                    Không nhập mật khẩu hoặc mã xác minh. Nếu email đã đăng ký, hãy dùng chức năng khôi phục
                    qua email trên trang đăng nhập; nhân viên sẽ xác minh trực tiếp nếu hồ sơ không có email phù hợp.
                  </p>
                  {supportError && <p className="login-error" role="alert">{supportError}</p>}
                  <div className="support-form-actions">
                    <button type="button" className="support-cancel-btn" onClick={closeSupport}>
                      Hủy
                    </button>
                    <button type="submit" className="submit-btn" disabled={isSupportSubmitting}>
                      {isSupportSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                    </button>
                  </div>
                </form>
              )}
            </section>
          </div>
        )}
        {isRecoveryOpen && (
          <div className="support-modal-backdrop" onClick={closeRecovery}>
            <section
              className="support-modal recovery-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="recovery-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="support-modal-header">
                <div>
                  <h2 id="recovery-modal-title">
                    {recoveryMode === 'forgot-username'
                      ? 'Khôi phục tên đăng nhập'
                      : 'Khôi phục mật khẩu'}
                  </h2>
                  <p>
                    {recoveryMode === 'forgot-password'
                      ? 'Nhập email đã đăng ký. Nếu thông tin phù hợp, mật khẩu tạm thời sẽ được gửi qua email; bạn cần đổi mật khẩu sau khi đăng nhập.'
                      : 'Nhập email đã đăng ký. Nếu thông tin phù hợp, tên đăng nhập sẽ được gửi qua email.'}
                  </p>
                </div>
                <button type="button" onClick={closeRecovery} aria-label="Đóng">
                  <X size={20} />
                </button>
              </header>
              {recoveryMessage ? (
                <div className="support-feedback" role="status">
                  <ShieldCheck size={22} />
                  <p>{recoveryMessage}</p>
                  <button className="submit-btn" type="button" onClick={closeRecovery}>Về đăng nhập</button>
                </div>
              ) : (
                <form className="support-form recovery-form" onSubmit={handleRecoverySubmit}>
                  <label>
                    Loại tài khoản *
                    <select
                      value={recoveryRole}
                      onChange={(event) => setRecoveryRole(event.target.value)}
                      required
                    >
                      <option value="PHUHUYNH">Phụ huynh</option>
                      <option value="GIAOVIEN">Giáo viên</option>
                    </select>
                  </label>
                  <label>
                    Email đã đăng ký *
                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={(event) => setRecoveryEmail(event.target.value)}
                      maxLength={100}
                      autoComplete="email"
                      required
                    />
                  </label>
                  {recoveryError && <p className="login-error" role="alert">{recoveryError}</p>}
                  <div className="support-form-actions">
                    <button type="button" className="support-cancel-btn" onClick={closeRecovery}>
                      Hủy
                    </button>
                    <button type="submit" className="submit-btn" disabled={isRecoverySubmitting}>
                      {isRecoverySubmitting
                        ? 'Đang xử lý...'
                        : recoveryMode === 'forgot-username'
                          ? 'Gửi tên đăng nhập'
                          : 'Gửi mật khẩu tạm thời'}
                    </button>
                  </div>
                </form>
              )}
            </section>
          </div>
        )}
      </div>
      <Toast
        toast={loginToast}
        onClose={closeLoginToast}
        duration={4000}
        className="login-toast"
      />
    </>
  );
};

export default Login;