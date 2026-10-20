import { Baby, CalendarDays, GraduationCap, Heart, Phone, Users } from 'lucide-react'

const dateLabel = (value) => {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Chưa cập nhật' : date.toLocaleDateString('vi-VN')
}

export default function ParentChildProfile({ portal }) {
  if (!portal.children.length) {
    return <section className="parent-panel parent-no-data">Tài khoản chưa có hồ sơ trẻ được liên kết.</section>
  }

  return (
    <div className="parent-page">
      <div className="parent-page-intro">
        <span className="parent-eyebrow">HỒ SƠ HỌC SINH</span>
        <h2>Hồ sơ của bé</h2>
        <p>Thông tin được hiển thị theo hồ sơ nhà trường đã liên kết với tài khoản của bạn.</p>
      </div>
      <div className="parent-profile-grid">
        {portal.children.map((child) => (
          <article className="parent-panel parent-profile-card" key={child.id}>
            <div className="parent-profile-hero">
              <span className="parent-profile-avatar">{child.fullName.slice(0, 1)}</span>
              <div><h3>{child.fullName}</h3><span>{child.className || 'Chưa xếp lớp'}</span></div>
            </div>
            <div className="parent-profile-details">
              <div><CalendarDays size={17} /><span>Ngày sinh</span><strong>{dateLabel(child.dateOfBirth)}</strong></div>
              <div><GraduationCap size={17} /><span>Lớp học</span><strong>{child.className || 'Chưa cập nhật'}</strong></div>
              <div><Users size={17} /><span>Giáo viên phụ trách</span><strong>{child.teacherName || 'Chưa cập nhật'}</strong></div>
              <div><Heart size={17} /><span>Quan hệ với bé</span><strong>{child.relationship || 'Chưa cập nhật'}</strong></div>
              <div><Baby size={17} /><span>Giới tính</span><strong>Chưa có dữ liệu</strong></div>
            </div>
            <div className="parent-contact-card">
              <div><Phone size={17} /><strong>Thông tin liên hệ phụ huynh</strong></div>
              <span>{portal.parent.fullName || 'Chưa cập nhật'} · {child.relationship || 'Phụ huynh'}</span>
              <span>{portal.parent.phone || 'Chưa cập nhật'}{portal.parent.email ? ` · ${portal.parent.email}` : ''}</span>
              <small>{portal.parent.address || 'Chưa cập nhật địa chỉ'}</small>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
