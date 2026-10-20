import { LogOut, Menu } from 'lucide-react'

export default function TeacherHeader({ active, user, teacher, onMenuClick, onLogout }) {
  const displayName = teacher?.name || user?.tenDangNhap || 'Giáo viên'

  return (
    <header className="teacher-header">
      <div className="teacher-header-title">
        <button
          className="teacher-menu-toggle"
          aria-label="Mở menu"
          onClick={onMenuClick}
        >
          <Menu size={21} />
        </button>
        <div>
          <span className="teacher-breadcrumb">BabyShark / Cổng giáo viên</span>
          <h1>{active}</h1>
        </div>
      </div>
      <div className="teacher-header-user">
        <span className="teacher-user-avatar">{displayName.slice(0, 1).toUpperCase()}</span>
        <div>
          <strong>{displayName}</strong>
          <span>Giáo viên</span>
        </div>
        <button className="teacher-logout" onClick={onLogout}>
          <LogOut size={17} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  )
}
