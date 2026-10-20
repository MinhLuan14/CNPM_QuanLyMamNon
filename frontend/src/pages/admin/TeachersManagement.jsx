import { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Phone,
  Mail,
  Award,
  Calendar,
  School,
  CheckCircle2,
  Trash2,
  Edit,
  UserCheck,
} from 'lucide-react';
import { initialTeachers, initialClasses } from '../../data/mockData';
import Modal from '../../components/Modal';

export default function TeachersManagement({ onShowToast }) {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // Form State
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    dob: '1995-01-01',
    phone: '',
    email: '',
    qualification: 'Cử nhân Sư phạm Mầm non',
    experience: '3 năm kinh nghiệm',
    assignedClass: 'Chồi 1 (Thỏ Trắng)',
    role: 'Giáo viên chủ nhiệm',
    salary: '10,500,000 đ'
  });

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.phone.includes(searchQuery) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'ALL' || teacher.assignedClass.includes(selectedClass);
    return matchesSearch && matchesClass;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newTeacher.name || !newTeacher.phone || !newTeacher.email) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc (*)!');
      return;
    }

    const newId = `GV00${teachers.length + 1}`;
    const teacherToAdd = {
      ...newTeacher,
      id: newId,
      status: 'Đang giảng dạy',
      avatarBg: '#ff85c0'
    };

    setTeachers([teacherToAdd, ...teachers]);
    setIsAddModalOpen(false);
    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'Thành công',
        message: `Đã thêm giáo viên ${newTeacher.name} vào hệ thống!`
      });
    }
  };

  const handleDeleteTeacher = (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa giáo viên "${name}"?`)) {
      setTeachers(teachers.filter((t) => t.id !== id));
      if (onShowToast) {
        onShowToast({
          type: 'info',
          title: 'Đã xóa',
          message: `Đã xóa thông tin giáo viên ${name}.`
        });
      }
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <div className="page-badge">
            <GraduationCap size={14} /> QUẢN LÝ ĐỘI NGŨ GIÁO VIÊN
          </div>
          <h2>Danh Sách Cán Bộ & Giáo Viên</h2>
          <p>Quản lý hồ sơ sư phạm, phân công đứng lớp, trình độ và bằng cấp của giáo viên</p>
        </div>

        <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} /> Thêm giáo viên mới
        </button>
      </div>

      {/* Thống kê nhanh */}
      <div className="mini-stats-row">
        <div className="mini-stat-card">
          <span className="dot-indicator bg-purple" />
          <div>
            <span className="mini-label">Tổng đội ngũ giáo viên</span>
            <strong>{teachers.length} cô giáo</strong>
          </div>
        </div>
        <div className="mini-stat-card">
          <span className="dot-indicator bg-blue" />
          <div>
            <span className="mini-label">Trình độ chuyên môn</span>
            <strong>100% Đạt chuẩn ĐH/CĐ</strong>
          </div>
        </div>
        <div className="mini-stat-card">
          <span className="dot-indicator bg-green" />
          <div>
            <span className="mini-label">Trạng thái công tác</span>
            <strong>100% Đang giảng dạy</strong>
          </div>
        </div>
      </div>

      {/* Bộ lọc & Tìm kiếm */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên giáo viên, số điện thoại, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-selects">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="ALL">Tất cả lớp phụ trách</option>
            {initialClasses.map((cls) => (
              <option key={cls.id} value={cls.name.split(' ')[0]}>
                Lớp {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lưới thẻ giáo viên */}
      <div className="cards-grid">
        {filteredTeachers.map((teacher) => (
          <div key={teacher.id} className="teacher-card card-lift">
            <div className="teacher-card-top">
              <div
                className="teacher-avatar"
                style={{ backgroundColor: teacher.avatarBg || '#5cdbd3' }}
              >
                👩‍🏫
              </div>
              <div className="teacher-header-info">
                <h4>{teacher.name}</h4>
                <span className="teacher-id-tag">{teacher.id}</span>
                <p className="teacher-role-badge">{teacher.role}</p>
              </div>
            </div>

            <div className="teacher-details">
              <div className="teacher-info-item">
                <School size={15} className="text-blue" />
                <span>Phụ trách: <strong>{teacher.assignedClass}</strong></span>
              </div>
              <div className="teacher-info-item">
                <Award size={15} className="text-orange" />
                <span>{teacher.qualification}</span>
              </div>
              <div className="teacher-info-item">
                <Calendar size={15} className="text-green" />
                <span>Kinh nghiệm: <strong>{teacher.experience}</strong></span>
              </div>
              <div className="teacher-info-item">
                <Phone size={15} className="text-purple" />
                <span>{teacher.phone}</span>
              </div>
              <div className="teacher-info-item">
                <Mail size={15} className="text-blue" />
                <span>{teacher.email}</span>
              </div>
            </div>

            <div className="teacher-card-footer">
              <span className="status-pill pill-green">
                <UserCheck size={12} /> {teacher.status}
              </span>
              <div className="actions-cluster">
                <button
                  className="btn-action-icon edit"
                  title="Sửa thông tin"
                  onClick={() => {
                    alert(`Xem / chỉnh sửa thông tin giáo viên: ${teacher.name}`);
                  }}
                >
                  <Edit size={16} />
                </button>
                <button
                  className="btn-action-icon delete"
                  title="Xóa giáo viên"
                  onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Thêm Giáo Viên Mới */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm Giáo Viên Mới"
        maxWidth="600px"
        footer={
          <div className="modal-buttons">
            <button className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Hủy
            </button>
            <button className="btn-primary" onClick={handleAddSubmit}>
              <CheckCircle2 size={16} /> Lưu giáo viên
            </button>
          </div>
        }
      >
        <form onSubmit={handleAddSubmit} className="modal-form-grid">
          <div className="form-group col-2">
            <label>Họ và Tên giáo viên *</label>
            <input
              type="text"
              placeholder="VD: Cô Nguyễn Ngọc Lan"
              value={newTeacher.name}
              onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Ngày sinh</label>
            <input
              type="date"
              value={newTeacher.dob}
              onChange={(e) => setNewTeacher({ ...newTeacher, dob: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Số điện thoại *</label>
            <input
              type="tel"
              placeholder="0909xxxxxx"
              value={newTeacher.phone}
              onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
              required
            />
          </div>

          <div className="form-group col-2">
            <label>Email liên hệ *</label>
            <input
              type="email"
              placeholder="lan.nguyen@babyshark.edu.vn"
              value={newTeacher.email}
              onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group col-2">
            <label>Trình độ & Bằng cấp chuyên môn</label>
            <input
              type="text"
              placeholder="VD: Cử nhân Sư phạm Mầm non ĐH Sư Phạm"
              value={newTeacher.qualification}
              onChange={(e) => setNewTeacher({ ...newTeacher, qualification: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Lớp học phân công phụ trách</label>
            <select
              value={newTeacher.assignedClass}
              onChange={(e) => setNewTeacher({ ...newTeacher, assignedClass: e.target.value })}
            >
              {initialClasses.map((cls) => (
                <option key={cls.id} value={cls.name}>
                  {cls.name} ({cls.grade})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Vai trò đảm nhiệm</label>
            <select
              value={newTeacher.role}
              onChange={(e) => setNewTeacher({ ...newTeacher, role: e.target.value })}
            >
              <option value="Giáo viên chủ nhiệm">Giáo viên chủ nhiệm</option>
              <option value="Giáo viên phó / phụ trách">Giáo viên phó / phụ trách</option>
              <option value="Giáo viên năng khiếu">Giáo viên năng khiếu</option>
              <option value="Tổ trưởng chuyên môn">Tổ trưởng chuyên môn</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
