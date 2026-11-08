import { useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  GraduationCap,
  School,
  Users,
} from 'lucide-react'
import { API_BASE_URL } from '../../config'

function TeacherChildAvatar({ child }) {
  const [failedImageUrl, setFailedImageUrl] = useState('')
  const imageUrl = child.imageUrl
    ? child.imageUrl.startsWith('http')
      ? child.imageUrl
      : `${API_BASE_URL}${child.imageUrl}`
    : ''
  const hasImage = imageUrl && failedImageUrl !== imageUrl
  const initial = child.name?.trim().charAt(0)?.toLocaleUpperCase('vi-VN') || '?'

  return hasImage ? (
    <img
      className="teacher-child-avatar teacher-child-avatar-image"
      src={imageUrl}
      alt=""
      onError={() => setFailedImageUrl(imageUrl)}
    />
  ) : (
    <span className="teacher-child-avatar" aria-hidden="true">{initial}</span>
  )
}

export default function TeacherDashboard({ data, onNavigate }) {
  const { teacher, classroom, children } = data
  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

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
            hồ sơ trẻ và thông tin giảng dạy.
          </p>
          <p style={{ marginTop: 10, color: 'rgba(255,255,255,.72)' }}>
            <CalendarDays size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {today}
          </p>
        </div>
        <div className="teacher-welcome-art"><GraduationCap size={49} /></div>
      </section>

      <section className="teacher-stat-grid teacher-stat-grid--overview" aria-label="Tóm tắt lớp học">
        <article className="teacher-stat-card">
          <span className="teacher-stat-icon"><School size={22} /></span>
          <div><span>Lớp phụ trách</span><strong>{data.classCount || '—'}</strong></div>
        </article>
        <article className="teacher-stat-card">
          <span className="teacher-stat-icon mint"><Users size={22} /></span>
          <div><span>Trẻ trong lớp được phân công</span><strong>{children.length}</strong></div>
        </article>
      </section>

      <div className="teacher-dashboard-grid teacher-dashboard-grid--class-focus">
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
                      <TeacherChildAvatar child={child} />
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
            <div className="teacher-empty">Bạn chưa được phân công lớp hiện hành.</div>
          )}
        </section>
      </div>
    </div>
  )
}
