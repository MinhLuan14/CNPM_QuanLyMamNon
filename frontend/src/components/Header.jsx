
import {
    Menu,
    Bell,
    Search,
    ChevronDown,
} from 'lucide-react'
import { authRequest, fetchCsrfToken } from '../api/auth'
import '../assets/CSS/Header.css'
function Header({ active, setSidebarOpen, user, onLogout }) {
    const handleLogout = async () => {
        const csrfToken = await fetchCsrfToken()
        const response = await authRequest('/api/auth/logout', {
            method: 'POST',
            headers: { 'X-XSRF-TOKEN': csrfToken },
        })
        if (!response.ok) {
            throw new Error('Không thể đăng xuất. Vui lòng thử lại.')
        }
        onLogout()
    }

    return (
        <header className="topbar">
            <div className="topbar-left">
                <button
                    className="mobile-menu"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Mở menu"
                >
                    <Menu size={23} />
                </button>

                <div>
                    <div className="breadcrumb">
                        Trang chủ / Quản trị
                    </div>
                    <h1>{active}</h1>
                </div>
            </div>

            <div className="topbar-actions">
                <label className="search-box">
                    <Search size={18} />
                    <input placeholder="Tìm kiếm..." />
                </label>

                <button
                    className="icon-button notification"
                    aria-label="Thông báo"
                >
                    <Bell size={20} />
                    <span />
                </button>

                <button className="profile" type="button" onClick={handleLogout} title="Đăng xuất">
                    <div className="avatar">{user.tenDangNhap.slice(0, 2).toUpperCase()}</div>

                    <div className="profile-info">
                        <strong>{user.tenDangNhap}</strong>
                        <span>{user.vaiTro}</span>
                    </div>

                    <ChevronDown size={16} />
                </button>
            </div>
        </header>
    )
}

export default Header