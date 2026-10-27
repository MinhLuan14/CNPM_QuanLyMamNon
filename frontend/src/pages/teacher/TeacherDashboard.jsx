import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  School,
  Users,
} from 'lucide-react'

export default function TeacherDashboard({ data, onNavigate }) {
  const { teacher, classroom, children, tasks, notifications, menu } = data
  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const openTasks = data.availability.tasks ? tasks.filter((task) => task.status !== 'Đã hoàn thành').length : null
  const todayMenu = menu.find((item) => item.day && today.toLowerCase().includes(item.day.toLowerCase())) || menu[0]

  return (
    <div className="teacher-page">
      <section className="teacher-welcome">
        <div className="teacher-welcome-copy">
          <span className="teacher-eyebrow" style={{ color: '#d8ffff' }}>
            CÙNG CON KHÁM PHÁ & LỚN KHÔN
          </span>
          <h2>Chào cô {teacher.name}!</h2>
          <p>
            Chúc cô một ngày thật vui cùng các bé. Đây là không gian để theo dõi lớp,
            thực đơn, công việc và thông tin giảng dạy.
          </p>
          <p style={{ marginTop: 10, color: 'rgba(255,255,255,.72)' }}>
            <CalendarDays size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {today}
          </p>
        </div>
        <div className="teacher-welcome-art"><GraduationCap size={49} /></div>
      </section>

      <section className="teacher-stat-grid" aria-label="Tóm tắt công việc">
        <article className="teacher-stat-card">
          <span className="teacher-stat-icon"><School size={22} /></span>
          <div><span>Lớp phụ trách</span><strong>{data.classCount || '—'}</strong></div>
        </article>
        <article className="teacher-stat-card">
          <span className="teacher-stat-icon mint"><Users size={22} /></span>
          <div><span>Trẻ trong lớp được phân công</span><strong>{children.length}</strong></div>
        </article>
        <article className="teacher-stat-card">
          <span className="teacher-stat-icon amber"><ClipboardList size={22} /></span>
          <div><span>Việc cần hoàn thành</span><strong>{openTasks ?? 'Chưa hỗ trợ'}</strong></div>
        </article>
        <article className="teacher-stat-card">
          <span className="teacher-stat-icon purple"><Bell size={22} /></span>
          <div><span>Thông báo mới</span><strong>{data.availability.notifications ? notifications.length : 'Chưa hỗ trợ'}</strong></div>
        </article>
      </section>

      <div className="teacher-dashboard-grid">
        <section className="teacher-panel">
          <div className="teacher-panel-heading">
            <div><School size={19} /><h3>Lớp học của tôi</h3></div>
            <button className="teacher-link-button" onClick={() => onNavigate('Lớp học của tôi')}>
              Chi tiết <ArrowRight size={14} />
            </button>
          </div>
          {classroom ? (
            <>
              <div className="teacher-class-summary">
                <span className="teacher-class-icon"><School size={23} /></span>
                <div>
                  <strong>{classroom.name}</strong>
                  <span>{classroom.grade} · {classroom.ageGroup}</span>
                </div>
                <span className="teacher-class-room">Phòng {classroom.room}</span>
              </div>
              <div className="teacher-panel-heading" style={{ marginTop: 20 }}>
                <div><Users size={18} /><h3>Trẻ trong danh sách lớp</h3></div>
                <button className="teacher-link-button" onClick={() => onNavigate('Danh sách trẻ')}>
                  Xem danh sách <ArrowRight size={14} />
                </button>
              </div>
              {children.length ? (
                <div className="teacher-child-list">
                  {children.slice(0, 3).map((child) => (
                    <div className="teacher-child-row" key={child.id}>
                      <span className="teacher-child-avatar">{child.name.slice(0, 1)}</span>
                      <div>
                        <strong>{child.name}</strong>
                        <span>{child.nickname} · Phụ huynh: {child.parentName}</span>
                      </div>
                      <span className="teacher-status-pill">{child.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="teacher-empty">Lớp được phân công hiện chưa có trẻ đang theo học.</div>
              )}
            </>
          ) : (
            <div className="teacher-empty">Tài khoản demo này chưa được gắn với lớp mẫu.</div>
          )}
        </section>

        <div className="teacher-page">
          <section className="teacher-panel">
            <div className="teacher-panel-heading">
              <div><BookOpen size={19} /><h3>Thực đơn mẫu trong tuần</h3></div>
              <button className="teacher-link-button" onClick={() => onNavigate('Thực đơn')}>
                Xem thực đơn <ArrowRight size={14} />
              </button>
            </div>
            {todayMenu ? (
              <div className="teacher-meal-list">
                <div className="teacher-meal-row"><span className="teacher-meal-marker" /><div><strong>Bữa sáng</strong><span>{todayMenu.breakfast.dish}</span></div></div>
                <div className="teacher-meal-row"><span className="teacher-meal-marker" /><div><strong>Bữa trưa</strong><span>{todayMenu.lunch.main}</span></div></div>
                <div className="teacher-meal-row"><span className="teacher-meal-marker" /><div><strong>Bữa xế</strong><span>{todayMenu.afternoonSnack.dish}</span></div></div>
              </div>
            ) : <div className="teacher-empty">{data.availability.menu ? 'Chưa có thực đơn.' : 'API thực đơn hiện chỉ cho phép tài khoản quản trị truy cập.'}</div>}
          </section>

          <section className="teacher-panel">
            <div className="teacher-panel-heading">
              <div><ClipboardList size={19} /><h3>Công việc sắp tới</h3></div>
              <button className="teacher-link-button" onClick={() => onNavigate('Công việc & báo cáo')}>
                Xem việc <ArrowRight size={14} />
              </button>
            </div>
            {!data.availability.tasks ? <div className="teacher-empty">Hệ thống chưa có API công việc dành cho giáo viên.</div> : tasks.filter((task) => task.status !== 'Đã hoàn thành').slice(0, 2).length ? (
              <div className="teacher-task-list">
                {tasks.filter((task) => task.status !== 'Đã hoàn thành').slice(0, 2).map((task) => (
                  <div className="teacher-task-row" key={task.id}>
                    <span className="teacher-meal-marker" />
                    <div><strong>{task.title}</strong><span>{task.category} · Hạn {new Date(`${task.due}T00:00:00`).toLocaleDateString('vi-VN')}</span></div>
                  </div>
                ))}
              </div>
            ) : <div className="teacher-empty">Không có công việc đang chờ.</div>}
          </section>
        </div>
      </div>
    </div>
  )
}
