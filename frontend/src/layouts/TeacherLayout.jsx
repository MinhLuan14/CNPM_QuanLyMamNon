import { useState } from 'react'
import TeacherHeader from '../components/teacher/TeacherHeader'
import TeacherSidebar from '../components/teacher/TeacherSidebar'
import './TeacherLayout.css'

export default function TeacherLayout({ active, setActive, user, teacher, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="teacher-app-shell">
      <TeacherSidebar
        active={active}
        setActive={setActive}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <main className="teacher-main">
        <TeacherHeader
          active={active}
          user={user}
          teacher={teacher}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={onLogout}
        />
        <div className="teacher-content">
          {active !== 'Thông tin cá nhân' && (
            <div className="teacher-demo-notice">Dữ liệu giao diện minh họa · Chưa kết nối nghiệp vụ backend</div>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}
