import { BookOpen, CalendarDays, GraduationCap, School, Users } from 'lucide-react'

export default function TeacherClass({ data }) {
  const { classroom, teacher, children } = data

  return (
    <div className="teacher-page">
      <div className="teacher-page-heading">
        <div>
          <span className="teacher-eyebrow">KHÔNG GIAN LỚP HỌC</span>
          <h2>Lớp học của tôi</h2>
          <p>Thông tin lớp và những nội dung cần thiết cho công việc giảng dạy.</p>
        </div>
      </div>
      {classroom ? (
        <>
          <section className="teacher-panel">
            <div className="teacher-panel-heading">
              <div><School size={20} /><h3>{classroom.name}</h3></div>
              <span className="teacher-status-pill">Đang hoạt động</span>
            </div>
            <div className="teacher-class-details">
              <div className="teacher-detail-item"><span>Khối lớp</span><strong>{classroom.grade}</strong></div>
              <div className="teacher-detail-item"><span>Độ tuổi</span><strong>{classroom.ageGroup}</strong></div>
              <div className="teacher-detail-item"><span>Phòng học</span><strong>{classroom.room}</strong></div>
              <div className="teacher-detail-item"><span>Năm học</span><strong>{classroom.schoolYear}</strong></div>
              <div className="teacher-detail-item"><span>Giáo viên chủ nhiệm</span><strong>{teacher.name}</strong></div>
              <div className="teacher-detail-item"><span>Giáo viên phối hợp</span><strong>{classroom.assistantTeacher}</strong></div>
              <div className="teacher-detail-item"><span>Sĩ số theo hồ sơ lớp</span><strong>{classroom.current}/{classroom.capacity ?? '—'} trẻ</strong></div>
              <div className="teacher-detail-item"><span>Trẻ trong lớp</span><strong>{children.length} trẻ</strong></div>
            </div>
          </section>
          <section className="teacher-panel">
            <div className="teacher-panel-heading">
              <div><CalendarDays size={19} /><h3>Nội dung lớp</h3></div>
            </div>
            <div className="teacher-class-details">
              <div className="teacher-detail-item"><span><BookOpen size={14} /> Hoạt động học</span><strong>Khám phá, tạo hình và phát triển ngôn ngữ</strong></div>
              <div className="teacher-detail-item"><span><GraduationCap size={14} /> Phối hợp</span><strong>Trao đổi kế hoạch với giáo viên cùng lớp</strong></div>
              <div className="teacher-detail-item"><span><Users size={14} /> Danh sách trẻ</span><strong>{children.length} hồ sơ mẫu đã được hiển thị</strong></div>
            </div>
          </section>
        </>
      ) : (
        <section className="teacher-panel teacher-empty">Tài khoản hiện chưa có lớp đang được phân công.</section>
      )}
    </div>
  )
}
