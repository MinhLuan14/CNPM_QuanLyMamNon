import {
  Bell,
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  School,
  Users,
  X,
} from 'lucide-react'
import logoImg from '../../assets/Logo.png'

const menuItems = [
  { title: 'Tổng quan', icon: LayoutDashboard },
  { title: 'Lớp học của tôi', icon: School },
  { title: 'Danh sách trẻ', icon: Users },
  { title: 'Thực đơn', icon: BookOpen },
  { title: 'Công việc & báo cáo', icon: ClipboardList },
  { title: 'Thông báo', icon: Bell },
  { title: 'Thông tin cá nhân', icon: GraduationCap },
]

export default function TeacherSidebar({ active, setActive, isOpen, setIsOpen }) {
  return (
    <>
      {isOpen && (
        <button
          className="teacher-overlay"
          aria-label="Đóng menu"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside className={`teacher-sidebar ${isOpen ? 'teacher-sidebar-open' : ''}`}>
        <div className="teacher-brand">
          <img src={logoImg} alt="BabyShark" />
          <div>
            <strong>BabyShark</strong>
            <span>Cổng giáo viên</span>
          </div>
          <button
            className="teacher-close-menu"
            aria-label="Đóng menu"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <p className="teacher-menu-label">KHÔNG GIAN GIẢNG DẠY</p>
        <nav className="teacher-menu">
          {menuItems.map(({ title, icon: Icon }) => (
            <button
              key={title}
              className={`teacher-menu-item ${active === title ? 'active' : ''}`}
              onClick={() => {
                setActive(title)
                setIsOpen(false)
              }}
            >
              <Icon size={19} />
              <span>{title}</span>
            </button>
          ))}
        </nav>

        <div className="teacher-sidebar-footer">
          <span className="teacher-status-dot" />
          BabyShark Preschool
        </div>
      </aside>
    </>
  )
}
