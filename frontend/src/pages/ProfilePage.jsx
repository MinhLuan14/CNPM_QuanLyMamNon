import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Baby,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Heart,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';
import { authRequest, fetchCsrfToken, responseError } from '../api/auth';
import Modal from '../components/Modal';
import FormFieldError from '../components/FormFieldError';
import TeacherAvatar from '../components/teacher/TeacherAvatar';
import { clearFieldError, focusFirstInvalid, requiredText, validEmail, validVietnamesePhone, validateValues } from '../utils/formValidation';
import './ProfilePage.css';

const EMPTY_PASSWORD_FORM = {
  matKhauHienTai: '',
  matKhauMoi: '',
  xacNhanMatKhauMoi: '',
};

async function readResponse(response, fallback) {
  if (!response.ok) throw new Error(await responseError(response, fallback));
  return response.status === 204 ? null : response.json();
}

function display(value) {
  return value || 'Chưa cập nhật';
}

function formatChildDate(value) {
  if (!value) return 'Chưa cập nhật';
  const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return dateParts ? `${dateParts[3]}/${dateParts[2]}/${dateParts[1]}` : 'Chưa cập nhật';
}

export default function ProfilePage({ onShowToast, linkedChildren = [] }) {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [profileFieldErrors, setProfileFieldErrors] = useState({});
  const [passwordFieldErrors, setPasswordFieldErrors] = useState({});
  const saveInProgress = useRef(false);
  const passwordInProgress = useRef(false);

  const showToast = (type, title, message) => onShowToast?.({ type, title, message });

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const response = await authRequest('/api/profile');
      const data = await readResponse(response, 'Không thể tải hồ sơ cá nhân.');
      setProfile(data);
      setForm({
        soDienThoai: data.soDienThoai || '',
        email: data.email || '',
        diaChiLH: data.diaChiLH || '',
      });
    } catch (error) {
      setLoadError(error.message || 'Không thể tải hồ sơ cá nhân.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadProfile, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadProfile]);

  const handleSave = async (event) => {
    event.preventDefault();
    if (!form) return;
    if (saveInProgress.current) return;
    const errors = validateValues(form, {
      soDienThoai: (value) => requiredText(value, 'Số điện thoại') || validVietnamesePhone(value),
      email: (value) => isParent
        ? validEmail(value, true)
        : requiredText(value, 'Email') || validEmail(value),
      diaChiLH: (value) => requiredText(value, 'Địa chỉ liên hệ'),
    });
    setProfileFieldErrors(errors);
    if (Object.keys(errors).length) {
      focusFirstInvalid(event.currentTarget, errors);
      return;
    }
    saveInProgress.current = true;
    setIsSaving(true);
    setSaveError('');
    try {
      const csrfToken = await fetchCsrfToken();
      const response = await authRequest('/api/profile', {
        method: 'PUT',
        headers: { 'X-XSRF-TOKEN': csrfToken },
        body: JSON.stringify({
          soDienThoai: form.soDienThoai.trim(),
          email: form.email.trim() || null,
          diaChiLH: form.diaChiLH.trim(),
        }),
      });
      await readResponse(response, 'Không thể cập nhật hồ sơ.');
      await loadProfile();
      showToast('success', 'Đã lưu hồ sơ', 'Thông tin cá nhân đã được cập nhật.');
    } catch (error) {
      setSaveError(error.message || 'Không thể cập nhật hồ sơ. Vui lòng kiểm tra lại.');
    } finally {
      saveInProgress.current = false;
      setIsSaving(false);
    }
  };

  const closePasswordModal = () => {
    if (isChangingPassword) return;
    setIsPasswordOpen(false);
    setPasswordError('');
    setPasswordFieldErrors({});
    setPasswordForm(EMPTY_PASSWORD_FORM);
    setVisiblePasswords({});
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setPasswordError('');
    if (passwordInProgress.current) return;
    const errors = validateValues(passwordForm, {
      matKhauHienTai: (value) => requiredText(value, 'Mật khẩu hiện tại'),
      matKhauMoi: (value) => requiredText(value, 'Mật khẩu mới')
        || (value.length < 8 ? 'Mật khẩu mới phải có ít nhất 8 ký tự.' : ''),
      xacNhanMatKhauMoi: (value, values) => requiredText(value, 'Nhập lại mật khẩu mới')
        || (value !== values.matKhauMoi ? 'Hai mật khẩu mới không trùng nhau.' : ''),
    });
    setPasswordFieldErrors(errors);
    if (Object.keys(errors).length) {
      focusFirstInvalid(event.currentTarget, errors);
      return;
    }

    passwordInProgress.current = true;
    setIsChangingPassword(true);
    try {
      const csrfToken = await fetchCsrfToken();
      const response = await authRequest('/api/auth/change-password', {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': csrfToken },
        body: JSON.stringify(passwordForm),
      });
      const result = await readResponse(response, 'Không thể đổi mật khẩu.');
      setIsPasswordOpen(false);
      setPasswordError('');
      setPasswordFieldErrors({});
      setPasswordForm(EMPTY_PASSWORD_FORM);
      setVisiblePasswords({});
      showToast('success', 'Đổi mật khẩu thành công', result?.message || 'Mật khẩu đã được cập nhật.');
    } catch (error) {
      setPasswordError(error.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      passwordInProgress.current = false;
      setIsChangingPassword(false);
    }
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSaveError('');
    clearFieldError(setProfileFieldErrors, field);
  };

  const updatePassword = (field, value) => {
    setPasswordForm((current) => ({ ...current, [field]: value }));
    setPasswordError('');
    clearFieldError(setPasswordFieldErrors, field);
    if (field === 'matKhauMoi') clearFieldError(setPasswordFieldErrors, 'xacNhanMatKhauMoi');
  };

  const togglePasswordVisibility = (field) => {
    setVisiblePasswords((current) => ({ ...current, [field]: !current[field] }));
  };

  if (isLoading) {
    return <div className="profile-state"><RefreshCw size={18} className="spin" /> Đang tải hồ sơ...</div>;
  }
  if (loadError || !profile || !form) {
    return (
      <div className="profile-state profile-state-error" role="alert">
        <AlertCircle size={18} />
        <span>{loadError || 'Không tìm thấy hồ sơ cá nhân.'}</span>
        <button className="btn-secondary" onClick={loadProfile}>Thử tải lại</button>
      </div>
    );
  }

  const isParent = profile.vaiTro === 'PHUHUYNH';
  const isTeacher = profile.vaiTro === 'GIAOVIEN';
  const roleName = isParent ? 'Phụ huynh' : 'Giáo viên';

  return (
    <div className={`profile-page${isParent ? ' parent-profile-page' : ''}`}>
      <section className="profile-card">
        <div className="profile-hero">
          {isTeacher ? (
            <TeacherAvatar className="profile-avatar" imageUrl={profile.anhDaiDien} name={profile.hoTen} />
          ) : (
            <div className="profile-avatar"><UserRound size={29} /></div>
          )}
          <div className="profile-identity">
            <h3>{display(profile.hoTen)}</h3>
            <span>{roleName}</span>
          </div>
          <span className={`profile-status ${profile.trangThaiTaiKhoan ? 'active' : 'locked'}`}>
            <ShieldCheck size={14} />
            {profile.trangThaiTaiKhoan ? 'Đang hoạt động' : 'Đã khóa'}
          </span>
        </div>

        <form className="profile-edit-form" onSubmit={handleSave} noValidate>
          <div className="profile-section-title">
            <div><UserRound size={17} /><h3>Thông tin cá nhân</h3></div>
            <span>Mã hồ sơ: {profile.maHoSo}</span>
          </div>
          <div className="profile-fields">
            <div className="profile-field">
              <label>Họ và tên</label>
              <div className="profile-readonly"><UserRound size={15} /><span>{display(profile.hoTen)}</span></div>
            </div>
            {!isParent && (
              <div className="profile-field">
                <label>Ngày sinh</label>
                <div className="profile-readonly">
                  <CalendarDays size={15} />
                  <span>{profile.ngaySinh || 'Chưa cập nhật'}</span>
                </div>
              </div>
            )}
            <div className="profile-field">
              <label htmlFor="profile-phone">Số điện thoại *</label>
              <div className="profile-input-wrap">
                <Phone size={15} />
                <input
                  id="profile-phone"
                  name="soDienThoai"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={form.soDienThoai}
                  onChange={(event) => updateForm('soDienThoai', event.target.value)}
                  aria-invalid={Boolean(profileFieldErrors.soDienThoai)}
                  aria-describedby={profileFieldErrors.soDienThoai ? 'profile-phone-error' : undefined}
                  required
                />
              </div>
              <FormFieldError id="profile-phone-error">{profileFieldErrors.soDienThoai}</FormFieldError>
            </div>
            <div className="profile-field">
              <label htmlFor="profile-email">Email{!isParent ? ' *' : ''}</label>
              <div className="profile-input-wrap">
                <Mail size={15} />
                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  maxLength={100}
                  value={form.email}
                  onChange={(event) => updateForm('email', event.target.value)}
                  aria-invalid={Boolean(profileFieldErrors.email)}
                  aria-describedby={profileFieldErrors.email ? 'profile-email-error' : undefined}
                  required={!isParent}
                />
              </div>
              <FormFieldError id="profile-email-error">{profileFieldErrors.email}</FormFieldError>
            </div>
            <div className="profile-field profile-field-wide">
              <label htmlFor="profile-address">Địa chỉ liên hệ *</label>
              <div className="profile-input-wrap">
                <MapPin size={15} />
                <input
                  id="profile-address"
                  name="diaChiLH"
                  maxLength={255}
                  value={form.diaChiLH}
                  onChange={(event) => updateForm('diaChiLH', event.target.value)}
                  aria-invalid={Boolean(profileFieldErrors.diaChiLH)}
                  aria-describedby={profileFieldErrors.diaChiLH ? 'profile-address-error' : undefined}
                  required
                />
              </div>
              <FormFieldError id="profile-address-error">{profileFieldErrors.diaChiLH}</FormFieldError>
            </div>
            {!isParent && (
              <div className="profile-field profile-field-wide">
                <label>Trình độ chuyên môn</label>
                <div className="profile-readonly">
                  <GraduationCap size={15} /><span>{display(profile.trinhDoChuyenMon)}</span>
                </div>
              </div>
            )}
          </div>
          {saveError && <p className="profile-error" role="alert"><AlertCircle size={15} />{saveError}</p>}
          <div className="profile-form-actions">
            <button
              type="button"
              className="profile-reset-button"
              onClick={() => setForm({
                soDienThoai: profile.soDienThoai || '',
                email: profile.email || '',
                diaChiLH: profile.diaChiLH || '',
              })}
              disabled={isSaving}
            >
              Hủy thay đổi
            </button>
            <button type="submit" className="profile-save-button" disabled={isSaving}>
              {isSaving ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
              {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>

        {isParent ? (
          <div className="profile-related-section">
            <div className="profile-section-title"><div><Baby size={17} /><h3>Trẻ em đã liên kết</h3></div></div>
            {profile.treEm?.length ? (
              <div className="profile-related-list">
                {profile.treEm.map((child) => {
                  const portalChild = linkedChildren.find((item) => String(item.id) === String(child.maTre));
                  return (
                    <article className="profile-related-row profile-related-child" key={child.maTre}>
                      <div className="profile-related-child-heading">
                        <span className="profile-related-avatar"><Baby size={22} /></span>
                        <div>
                          <strong>{[child.hoTenDemTre, child.tenTre].filter(Boolean).join(' ') || 'Chưa cập nhật'}</strong>
                          <span>Mã trẻ {child.maTre}</span>
                        </div>
                        <span className="profile-related-tag">{child.quanHe || 'Quan hệ chưa cập nhật'}</span>
                      </div>
                      <div className="profile-related-child-details">
                        <div><CalendarDays size={19} /><span>Ngày sinh</span><strong>{formatChildDate(portalChild?.dateOfBirth)}</strong></div>
                        <div><GraduationCap size={19} /><span>Lớp học</span><strong>{display(portalChild?.className)}</strong></div>
                        <div><Users size={19} /><span>Giáo viên phụ trách</span><strong>{display(portalChild?.teacherName)}</strong></div>
                        <div><Heart size={19} /><span>Quan hệ</span><strong>{display(child.quanHe)}</strong></div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : <p className="profile-empty">Chưa có trẻ em được liên kết với hồ sơ này.</p>}
          </div>
        ) : (
          <div className="profile-related-section">
            <div className="profile-section-title"><div><GraduationCap size={17} /><h3>Lớp được phân công</h3></div></div>
            {profile.phanCong?.length ? (
              <div className="profile-related-list">
                {profile.phanCong.map((assignment) => (
                  <div className="profile-related-row" key={assignment.maLopHoc}>
                    <span className="profile-related-avatar"><GraduationCap size={17} /></span>
                    <div>
                      <strong>{assignment.tenLopHoc || `Lớp ${assignment.maLopHoc}`}</strong>
                      <span>{assignment.vaiTro || 'Vai trò chưa cập nhật'}</span>
                    </div>
                    <span className={`profile-related-tag ${assignment.dangPhuTrach ? 'current' : ''}`}>
                      {assignment.dangPhuTrach ? 'Đang phụ trách' : 'Đã kết thúc'}
                    </span>
                  </div>
                ))}
              </div>
            ) : <p className="profile-empty">Chưa có dữ liệu phân công lớp.</p>}
          </div>
        )}

        <div className="profile-security-section">
          <div className="profile-section-title"><div><ShieldCheck size={17} /><h3>Bảo mật tài khoản</h3></div></div>
          <div className="profile-security-row">
            {!isParent && <div><span>Tên đăng nhập</span><strong>{profile.tenDangNhap}</strong></div>}
            <div><span>Trạng thái</span><strong>{profile.trangThaiTaiKhoan ? 'Đang hoạt động' : 'Đã khóa'}</strong></div>
            <button className="profile-password-button" onClick={() => setIsPasswordOpen(true)} disabled={!profile.trangThaiTaiKhoan}>
              <KeyRound size={16} /> Đổi mật khẩu
            </button>
          </div>
          <p>Mật khẩu được bảo vệ bằng mã hóa. Không chia sẻ mật khẩu hoặc thông tin đăng nhập.</p>
        </div>
      </section>

      <Modal
        isOpen={isPasswordOpen}
        onClose={closePasswordModal}
        title="Đổi mật khẩu"
        maxWidth="520px"
        footer={(
          <div className="modal-buttons">
            <button className="btn-secondary" onClick={closePasswordModal} disabled={isChangingPassword}>Hủy</button>
            <button className="btn-primary" type="submit" form="profile-password-form" disabled={isChangingPassword}>
              <CheckCircle2 size={16} /> {isChangingPassword ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
            </button>
          </div>
        )}
      >
        <form id="profile-password-form" className="profile-password-form" onSubmit={handleChangePassword} noValidate>
          {[
            ['matKhauHienTai', 'Mật khẩu hiện tại'],
            ['matKhauMoi', 'Mật khẩu mới'],
            ['xacNhanMatKhauMoi', 'Nhập lại mật khẩu mới'],
          ].map(([field, label]) => (
            <label className="profile-password-field" key={field}>
              <span>{label}</span>
              <div>
                <input
                  name={field}
                  type={visiblePasswords[field] ? 'text' : 'password'}
                  value={passwordForm[field]}
                  onChange={(event) => updatePassword(field, event.target.value)}
                  autoComplete={field === 'matKhauHienTai' ? 'current-password' : 'new-password'}
                  minLength={field === 'matKhauHienTai' ? undefined : 8}
                  aria-invalid={Boolean(passwordFieldErrors[field])}
                  aria-describedby={passwordFieldErrors[field] ? `profile-password-${field}-error` : undefined}
                  required
                />
                <button type="button" onClick={() => togglePasswordVisibility(field)} aria-label={visiblePasswords[field] ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
                  {visiblePasswords[field] ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <FormFieldError id={`profile-password-${field}-error`}>{passwordFieldErrors[field]}</FormFieldError>
            </label>
          ))}
          <small>Mật khẩu mới cần có ít nhất 8 ký tự.</small>
          {passwordError && <p className="profile-error" role="alert"><AlertCircle size={15} />{passwordError}</p>}
        </form>
      </Modal>
    </div>
  );
}
