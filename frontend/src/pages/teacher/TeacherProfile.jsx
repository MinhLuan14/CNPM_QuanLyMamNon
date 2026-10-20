import { Award, GraduationCap, Mail, Phone, School, UserRound } from 'lucide-react'

export default function TeacherProfile({ data }) {
  const { teacher, classroom } = data

  return (
    <div className="teacher-page">
      <div className="teacher-page-heading">
        <div>
          <span className="teacher-eyebrow">HỒ SƠ GIẢNG DẠY</span>
          <h2>Thông tin cá nhân</h2>
          <p>Thông tin giáo viên mẫu được dùng để xem trước giao diện.</p>
        </div>
      </div>
      <section className="teacher-panel">
        <div className="teacher-panel-heading">
          <div><UserRound size={19} /><h3>{teacher.name}</h3></div>
          <span className="teacher-status-pill">{teacher.role}</span>
        </div>
        <div className="teacher-profile-grid">
          <div className="teacher-detail-item"><span><Mail size={14} /> Email</span><strong>{teacher.email || 'Chưa có dữ liệu mẫu'}</strong></div>
          <div className="teacher-detail-item"><span><Phone size={14} /> Điện thoại</span><strong>{teacher.phone || 'Chưa có dữ liệu mẫu'}</strong></div>
          <div className="teacher-detail-item"><span><GraduationCap size={14} /> Trình độ</span><strong>{teacher.qualification || 'Chưa có dữ liệu mẫu'}</strong></div>
          <div className="teacher-detail-item"><span><Award size={14} /> Kinh nghiệm</span><strong>{teacher.experience || 'Chưa có dữ liệu mẫu'}</strong></div>
          <div className="teacher-detail-item"><span><School size={14} /> Lớp đang phụ trách</span><strong>{classroom?.name || 'Chưa có dữ liệu mẫu'}</strong></div>
          <div className="teacher-detail-item"><span>Vai trò</span><strong>{teacher.role}</strong></div>
        </div>
      </section>
    </div>
  )
}
