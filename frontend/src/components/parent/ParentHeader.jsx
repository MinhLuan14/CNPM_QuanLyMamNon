import { Menu, LogOut } from 'lucide-react'

export default function ParentHeader({ active, user, onMenuClick, onLogout }) {
  return (
    <header className="parent-header">
      <div className="parent-header-title">
        <button
          className="parent-menu-toggle"
          aria-label="Mở menu"
          onClick={onMenuClick}
        >
          <Menu size={21} />
        </button>
        <div>
          <span className="parent-breadcrumb">BabyShark / Cổng phụ huynh</span>
          <h1>{active}</h1>
        </div>
      </div>
      <div className="parent-header-user">
        <span className="parent-user-avatar">
          {(user?.tenDangNhap || 'PH').slice(0, 2).toUpperCase()}
        </span>
        <div>
          <strong>{user?.tenDangNhap || 'Phụ huynh'}</strong>
          <span>Phụ huynh</span>
        </div>
        <button className="parent-logout" onClick={onLogout}>
          <LogOut size={17} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  )
}
