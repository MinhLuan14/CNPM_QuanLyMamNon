import { Bell, Megaphone } from 'lucide-react'

export default function TeacherNotifications({ notifications }) {
  return (
    <div className="teacher-page">
      <div className="teacher-page-heading">
        <div>
          <span className="teacher-eyebrow">CẬP NHẬT TỪ NHÀ TRƯỜNG</span>
          <h2>Thông báo</h2>
          <p>Các lịch nhắc và tin nhắn mẫu dành cho giáo viên.</p>
        </div>
      </div>
      <section className="teacher-panel">
        <div className="teacher-panel-heading">
          <div><Bell size={19} /><h3>Thông báo gần đây</h3></div>
        </div>
        {notifications.length ? (
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
