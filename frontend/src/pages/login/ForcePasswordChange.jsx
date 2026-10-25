import { useState } from 'react'
import { authRequest, fetchCsrfToken, responseError } from '../../api/auth'
import './ForcePasswordChange.css'

export default function ForcePasswordChange({ user, onPasswordChanged, onLogout }) {
  const [form, setForm] = useState({
    matKhauHienTai: '',
    matKhauMoi: '',
    xacNhanMatKhauMoi: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (form.matKhauMoi !== form.xacNhanMatKhauMoi) {
      setError('Hai mật khẩu mới không trùng nhau.')
      return
    }
    setIsSubmitting(true)
    setError('')
    try {
      const csrfToken = await fetchCsrfToken()
      const response = await authRequest('/api/auth/change-password', {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': csrfToken },
        body: JSON.stringify(form),
      })
      if (!response.ok) {
        throw new Error(await responseError(response, 'Không thể đổi mật khẩu. Vui lòng thử lại.'))
      }
      onPasswordChanged()
    } catch (requestError) {
      setError(requestError.message || 'Không thể kết nối đến máy chủ.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setError('')
    try {
      const csrfToken = await fetchCsrfToken()
      const response = await authRequest('/api/auth/logout', {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': csrfToken },
      })
      if (!response.ok) {
        throw new Error(await responseError(response, 'Không thể đăng xuất. Vui lòng thử lại.'))
      }
      onLogout()
    } catch (requestError) {
      setError(requestError.message || 'Không thể kết nối đến máy chủ.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <main className="force-password-page">
      <section className="force-password-card" aria-labelledby="force-password-title">
        <div className="force-password-mark" aria-hidden="true">!</div>
        <h1 id="force-password-title">Cần đổi mật khẩu</h1>
        <p>
          Xin chào <strong>{user.tenDangNhap}</strong>. Vì bạn đang đăng nhập bằng mật khẩu tạm thời,
          hãy tạo mật khẩu mới để tiếp tục sử dụng hệ thống.
        </p>
        <form onSubmit={handleSubmit}>
          <label>
            Mật khẩu tạm thời
            <input
              type="password"
              autoComplete="current-password"
              value={form.matKhauHienTai}
              onChange={(event) => updateField('matKhauHienTai', event.target.value)}
              required
            />
          </label>
          <label>
            Mật khẩu mới
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              value={form.matKhauMoi}
              onChange={(event) => updateField('matKhauMoi', event.target.value)}
              required
            />
          </label>
          <label>
            Xác nhận mật khẩu mới
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              value={form.xacNhanMatKhauMoi}
              onChange={(event) => updateField('xacNhanMatKhauMoi', event.target.value)}
              required
            />
          </label>
          <p className="force-password-hint">
            Mật khẩu mới cần có ít nhất 8 ký tự. Mật khẩu tạm thời sẽ không còn sử dụng được sau khi đổi.
          </p>
          {error && <p className="force-password-error" role="alert">{error}</p>}
          <div className="force-password-actions">
            <button
              type="button"
              className="force-password-logout"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
