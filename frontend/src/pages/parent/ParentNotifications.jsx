import { Bell } from 'lucide-react'

export default function ParentNotifications({ notifications, isAvailable = true }) {
  return (
    <div className="parent-page">
      <section className="parent-panel parent-history-panel">
        {!isAvailable ? (
          <div className="parent-empty-large"><Bell size={28} /><h3>Chưa có nguồn thông báo</h3><p>Hệ thống hiện chưa cung cấp API thông báo cho phụ huynh.</p></div>
        ) : notifications.length ? (
          <div className="parent-notice-list">
            {notifications.map((notice) => (
              <article className="parent-notice-item" key={notice.id}>
                <span className="parent-notice-icon"><Bell size={18} /></span>
                <div>
                  <strong>{notice.title}</strong>
                  <p>{notice.content}</p>
                  <small>{notice.type} · {notice.time}</small>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="parent-empty-large">
            <Bell size={28} />
            <h3>Chưa có thông báo mẫu</h3>
            <p>Tài khoản demo này chưa có thông báo minh họa.</p>
          </div>
        )}
      </section>
    </div>
  )
}
