import { Menu, LogOut } from 'lucide-react'

export default function ParentHeader({ active, user, parentName, onMenuClick, onLogout }) {
  const displayName = parentName || user?.hoTen || 'Phụ huynh'
  const avatarText = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'PH'

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
          {avatarText}
        </span>
        <div>
          <strong>{displayName}</strong>
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
