import { LogOut, Menu } from 'lucide-react'
import TeacherAvatar from './TeacherAvatar'

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
        <TeacherAvatar
          className="teacher-user-avatar"
          imageUrl={teacher?.imageUrl}
          name={displayName}
        />
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
