import { useState } from 'react';
import {
  School,
  Plus,
  Users,
  Baby,
  GraduationCap,
  CheckCircle2,
  Trash2,
  Eye,
  MapPin
} from 'lucide-react';
import { initialClasses, initialChildren, initialTeachers } from '../../data/mockData';
import Modal from '../../components/Modal';

export default function ClassesManagement({ onShowToast }) {
  const [classes, setClasses] = useState(initialClasses);
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isClassDetailOpen, setIsClassDetailOpen] = useState(false);
  const [selectedClassData, setSelectedClassData] = useState(null);

  // Form state
  const [newClass, setNewClass] = useState({
    name: '',
    grade: 'Mầm',
    ageGroup: '3 - 4 tuổi',
    room: 'P.203',
    capacity: 25,
    mainTeacher: 'Phạm Quỳnh Nga',
    assistantTeacher: 'Đỗ Thảo Vy',
    schoolYear: '2025-2026',
    color: '#ffc069'
  });

  const filteredClasses = classes.filter((cls) => {
    return selectedGrade === 'ALL' || cls.grade === selectedGrade;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newClass.name) {
      alert('Vui lòng nhập tên lớp!');
      return;
    }

    const newId = `LOP0${classes.length + 1}`;
    const classToAdd = {
      ...newClass,
      id: newId,
      current: 0
    };

    setClasses([...classes, classToAdd]);
    setIsAddModalOpen(false);
    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'Thành công',
        message: `Đã mở thêm lớp học: ${newClass.name}!`
      });
    }
  };

  const handleOpenClassDetail = (cls) => {
    setSelectedClassData(cls);
    setIsClassDetailOpen(true);
  };

  const childrenInClass = selectedClassData
    ? initialChildren.filter((c) => c.classId === selectedClassData.id)
    : [];

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <div className="page-badge">
            <School size={14} /> QUẢN LÝ LỚP HỌC & SĨ SỐ
          </div>
          <h2>Hệ Thống Lớp Học Mầm Non</h2>
          <p>Phân chia các khối lớp theo lứa tuổi: Nhà trẻ, Mầm, Chồi, Lá và phân công ban giáo viên phụ trách</p>
        </div>

        <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} /> Mở thêm lớp học
        </button>
      </div>

      {/* Tabs Phân Khối Lớp */}
      <div className="grade-tabs">
        <button
          className={`grade-tab-btn ${selectedGrade === 'ALL' ? 'active' : ''}`}
          onClick={() => setSelectedGrade('ALL')}
        >
          Tất cả các khối ({classes.length} lớp)
        </button>
        <button
          className={`grade-tab-btn ${selectedGrade === 'Nhà trẻ' ? 'active' : ''}`}
          onClick={() => setSelectedGrade('Nhà trẻ')}
        >
          Khối Nhà trẻ (18 - 36 tháng)
        </button>
        <button
          className={`grade-tab-btn ${selectedGrade === 'Mầm' ? 'active' : ''}`}
          onClick={() => setSelectedGrade('Mầm')}
        >
          Khối Mầm (3 - 4 tuổi)
        </button>
        <button
          className={`grade-tab-btn ${selectedGrade === 'Chồi' ? 'active' : ''}`}
          onClick={() => setSelectedGrade('Chồi')}
        >
          Khối Chồi (4 - 5 tuổi)
        </button>
        <button
          className={`grade-tab-btn ${selectedGrade === 'Lá' ? 'active' : ''}`}
          onClick={() => setSelectedGrade('Lá')}
        >
          Khối Lá (5 - 6 tuổi)
        </button>
      </div>

      {/* Lưới Thẻ Lớp Học */}
      <div className="cards-grid">
        {filteredClasses.map((cls) => {
          const fillPercentage = Math.round((cls.current / cls.capacity) * 100);
          return (
            <div key={cls.id} className="class-card card-lift">
              <div className="class-card-header" style={{ borderTop: `4px solid ${cls.color || '#1890ff'}` }}>
                <div className="class-badge-group">
                  <span className="badge-tag bg-light-blue">{cls.grade}</span>
                  <span className="badge-tag">{cls.ageGroup}</span>
                </div>
                <span className="room-badge"><MapPin size={12} /> {cls.room}</span>
              </div>

              <div className="class-card-body">
                <h3 className="class-title">{cls.name}</h3>
                <span className="class-school-year">Năm học: {cls.schoolYear} • Mã: {cls.id}</span>

                {/* Thanh tiến độ sĩ số */}
                <div className="capacity-bar-wrap">
                  <div className="capacity-text">
                    <span>Sĩ số hiện tại:</span>
                    <strong>{cls.current} / {cls.capacity} học sinh</strong>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${fillPercentage}%`,
                        backgroundColor: cls.color || '#1890ff'
                      }}
                    />
                  </div>
                  <span className="capacity-percent">Đạt {fillPercentage}% công suất phòng học</span>
                </div>

                {/* Giáo viên phụ trách */}
                <div className="teachers-assigned-box">
                  <div className="t-row">
                    <GraduationCap size={15} className="text-blue" />
                    <span>GV Chủ nhiệm: <strong>{cls.mainTeacher}</strong></span>
                  </div>
                  <div className="t-row">
                    <Users size={15} className="text-orange" />
                    <span>GV Phụ tá: <strong>{cls.assistantTeacher}</strong></span>
                  </div>
                </div>
              </div>

              <div className="class-card-footer">
                <button
                  className="btn-class-action"
                  onClick={() => handleOpenClassDetail(cls)}
                >
                  <Eye size={15} /> Xem học sinh ({cls.current})
                </button>
                <button
                  className="btn-tbl delete"
                  title="Xóa lớp"
                  onClick={() => {
                    if (window.confirm(`Bạn có chắc muốn xóa lớp ${cls.name}?`)) {
                      setClasses(classes.filter((c) => c.id !== cls.id));
                    }
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Thêm Lớp Mới */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Mở Thêm Lớp Học Mầm Non Mới"
        maxWidth="600px"
        footer={
          <div className="modal-buttons">
            <button className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Hủy
            </button>
            <button className="btn-primary" onClick={handleAddSubmit}>
              <CheckCircle2 size={16} /> Lưu lớp học
            </button>
          </div>
        }
      >
        <form onSubmit={handleAddSubmit} className="modal-form-grid">
          <div className="form-group col-2">
            <label>Tên lớp học *</label>
            <input
              type="text"
              placeholder="VD: Mầm 3 (Ánh Dương)"
              value={newClass.name}
              onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Khối lớp</label>
            <select
              value={newClass.grade}
              onChange={(e) => {
                const grade = e.target.value;
                let age = '3 - 4 tuổi';
                if (grade === 'Nhà trẻ') age = '18 - 36 tháng';
                if (grade === 'Chồi') age = '4 - 5 tuổi';
                if (grade === 'Lá') age = '5 - 6 tuổi';
                setNewClass({ ...newClass, grade, ageGroup: age });
              }}
            >
              <option value="Nhà trẻ">Khối Nhà trẻ</option>
              <option value="Mầm">Khối Mầm</option>
              <option value="Chồi">Khối Chồi</option>
              <option value="Lá">Khối Lá</option>
            </select>
          </div>

          <div className="form-group">
            <label>Phòng học</label>
            <input
              type="text"
              placeholder="VD: P.203 Lầu 2"
              value={newClass.room}
              onChange={(e) => setNewClass({ ...newClass, room: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Sĩ số tối đa</label>
            <input
              type="number"
              value={newClass.capacity}
              onChange={(e) => setNewClass({ ...newClass, capacity: Number(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label>Năm học</label>
            <input
              type="text"
              value={newClass.schoolYear}
              onChange={(e) => setNewClass({ ...newClass, schoolYear: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Giáo viên chủ nhiệm</label>
            <select
              value={newClass.mainTeacher}
              onChange={(e) => setNewClass({ ...newClass, mainTeacher: e.target.value })}
            >
              {initialTeachers.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Giáo viên phụ tá</label>
            <input
              type="text"
              placeholder="Tên giáo viên phụ tá"
              value={newClass.assistantTeacher}
              onChange={(e) => setNewClass({ ...newClass, assistantTeacher: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Modal Xem Danh Sách Học Sinh Trong Lớp */}
      {selectedClassData && (
        <Modal
          isOpen={isClassDetailOpen}
          onClose={() => setIsClassDetailOpen(false)}
          title={`Danh Sách Học Sinh: ${selectedClassData.name}`}
          maxWidth="680px"
          footer={
            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setIsClassDetailOpen(false)}>
                Đóng
              </button>
            </div>
          }
        >
          <div>
            <div className="class-detail-meta">
              <span>Khối: <strong>{selectedClassData.grade}</strong></span>
              <span>Độ tuổi: <strong>{selectedClassData.ageGroup}</strong></span>
              <span>GVCN: <strong>{selectedClassData.mainTeacher}</strong></span>
              <span>Phòng: <strong>{selectedClassData.room}</strong></span>
            </div>

            <h4 style={{ margin: '16px 0 8px', fontSize: '14px' }}>
              Danh sách học sinh trong lớp ({childrenInClass.length} học sinh mẫu):
            </h4>

            {childrenInClass.length > 0 ? (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Mã HS</th>
                      <th>Họ và Tên</th>
                      <th>Nickname</th>
                      <th>Ngày sinh</th>
                      <th>Phụ huynh</th>
                      <th>Điểm danh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {childrenInClass.map((c) => (
                      <tr key={c.id}>
                        <td><strong>{c.id}</strong></td>
                        <td>{c.name}</td>
                        <td><span className="badge-nickname">{c.nickname}</span></td>
                        <td>{c.dob}</td>
                        <td>{c.parentName} ({c.parentPhone})</td>
                        <td>
                          <span className={`status-pill ${c.attendanceToday === 'Có mặt' ? 'pill-green' : 'pill-yellow'}`}>
                            {c.attendanceToday}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state-hint">
                <Baby size={28} />
                <p>Hiện lớp học này chưa có học sinh nào được phân vào.</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
