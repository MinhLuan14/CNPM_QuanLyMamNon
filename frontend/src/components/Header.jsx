
import {
    Menu,
    Bell,
    Search,
    ChevronDown,
} from 'lucide-react'

function Header({ active, setSidebarOpen }) {
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

                <div className="profile">
                    <div className="avatar">AD</div>

                    <div className="profile-info">
                        <strong>Admin</strong>
                        <span>Quản trị viên</span>
                    </div>

                    <ChevronDown size={16} />
                </div>
            </div>
        </header>
    )
}

export default Header