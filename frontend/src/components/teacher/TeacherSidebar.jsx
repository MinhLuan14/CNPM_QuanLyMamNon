import {
  Bell,
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  School,
  Users,
} from 'lucide-react'
import Sidebar from '../Sidebar'

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
  return <Sidebar
    active={active}
    setActive={setActive}
    sidebarOpen={isOpen}
    setSidebarOpen={setIsOpen}
    items={menuItems}
    subtitle="Giáo viên"
    menuLabel="KHÔNG GIAN GIẢNG DẠY"
    footerText="BabyShark Preschool"
  />
}
