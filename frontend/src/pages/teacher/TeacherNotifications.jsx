import { Bell, Megaphone } from 'lucide-react'

export default function TeacherNotifications({ notifications, isAvailable = true }) {
  return (
    <div className="teacher-page">
      <section className="teacher-panel">
        <div className="teacher-panel-heading">
          <div><Bell size={19} /><h3>Thông báo gần đây</h3></div>
        </div>
        {!isAvailable ? (
          <div className="teacher-empty">Hệ thống chưa có API thông báo dành cho giáo viên.</div>
        ) : notifications.length ? (
          <div className="teacher-notice-list">
            {notifications.map((notice) => (
              <article className="teacher-notice-row" key={notice.id}>
                <span className="teacher-notice-icon"><Megaphone size={18} /></span>
                <div>
                  <strong>{notice.title}</strong>
                  <span>{notice.content}</span>
                  <span className="teacher-task-tag">{notice.type}</span>
                </div>
                <time>{notice.time}</time>
              </article>
            ))}
          </div>
        ) : (
          <div className="teacher-empty">Chưa có thông báo mẫu cho tài khoản này.</div>
        )}
      </section>
    </div>
  )
}
