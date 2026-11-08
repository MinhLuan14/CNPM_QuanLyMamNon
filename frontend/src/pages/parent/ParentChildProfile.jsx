import { useState } from 'react'
import { CalendarDays, GraduationCap, Heart, Mail, MapPin, Phone, UserRound, Users } from 'lucide-react'
import { API_BASE_URL } from '../../config'

const dateLabel = (value) => {
  if (!value) return 'Chưa cập nhật'
  const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  return dateParts ? `${dateParts[3]}/${dateParts[2]}/${dateParts[1]}` : 'Chưa cập nhật'
}

export default function ParentChildProfile({ portal }) {
  const [unavailableAvatars, setUnavailableAvatars] = useState(() => new Set())

  if (!portal.children.length) {
    return (
      <div className="parent-page">
        <h2 className="parent-profile-page-title">Hồ sơ học sinh</h2>
        <section className="parent-panel parent-no-data" role="status">
          Tài khoản chưa có hồ sơ trẻ được liên kết.
        </section>
      </div>
    )
  }

  return (
    <div className="parent-page">
      <div className="parent-profile-grid">
        {portal.children.map((child) => (
          <article className="parent-panel parent-profile-card" key={child.id}>
            <div className="parent-profile-hero">
              <span className="parent-profile-avatar">
                {child.avatarUrl && !unavailableAvatars.has(child.id) ? (
                  <img
                    src={child.avatarUrl.startsWith('http')
                      ? child.avatarUrl
                      : `${API_BASE_URL}${child.avatarUrl}`}
                    alt={`Ảnh đại diện của ${child.fullName}`}
                    onError={() => setUnavailableAvatars((current) => new Set(current).add(child.id))}
                  />
                ) : (
                  <span aria-hidden="true">
                    {child.firstName?.trim().slice(0, 1) || child.fullName?.trim().slice(0, 1) || '—'}
                  </span>
                )}
              </span>
              <div className="parent-profile-identity">
                <h3>{child.fullName}</h3>
                <span className="parent-profile-class">{child.className || 'Chưa phân lớp'}</span>
              </div>
            </div>
            <div className="parent-profile-details">
              <div className="parent-profile-detail">
                <CalendarDays size={24} aria-hidden="true" />
                <span>Ngày sinh</span>
                <strong>{dateLabel(child.dateOfBirth)}</strong>
              </div>
              <div className="parent-profile-detail">
                <GraduationCap size={24} aria-hidden="true" />
                <span>Lớp học</span>
                <strong>{child.className || 'Chưa phân lớp'}</strong>
              </div>
              <div className="parent-profile-detail">
                <Users size={24} aria-hidden="true" />
                <span>Giáo viên phụ trách</span>
                <strong>{child.teacherName || 'Chưa cập nhật'}</strong>
              </div>
              <div className="parent-profile-detail">
                <Heart size={24} aria-hidden="true" />
                <span>Quan hệ với bé</span>
                <strong>{child.relationship || 'Chưa cập nhật'}</strong>
              </div>
            </div>
            <section className="parent-contact-card" aria-label="Thông tin liên hệ phụ huynh">
              <h4>THÔNG TIN LIÊN HỆ PHỤ HUYNH</h4>
              <div className="parent-contact-row">
                <UserRound size={22} aria-hidden="true" />
                <strong>
                  {portal.parent.fullName || 'Chưa cập nhật'}
                  <span> ({child.relationship || 'Chưa cập nhật'})</span>
                </strong>
              </div>
              <div className="parent-contact-row">
                <Phone size={22} aria-hidden="true" />
                {portal.parent.phone
                  ? <a href={`tel:${portal.parent.phone}`}>{portal.parent.phone}</a>
                  : <span>Chưa cập nhật</span>}
              </div>
              <div className="parent-contact-row">
                <Mail size={22} aria-hidden="true" />
                {portal.parent.email
                  ? <a href={`mailto:${portal.parent.email}`}>{portal.parent.email}</a>
                  : <span>Chưa cập nhật</span>}
              </div>
              <div className="parent-contact-row">
                <MapPin size={22} aria-hidden="true" />
                <span>{portal.parent.address || 'Chưa cập nhật'}</span>
              </div>
            </section>
          </article>
        ))}
      </div>
    </div>
  )
}
