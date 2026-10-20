import { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2,
  Baby,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone
} from 'lucide-react';
import { initialChildren, initialClasses } from '../../data/mockData';
import Modal from '../../components/Modal';

export default function ChildrenManagement({ onShowToast }) {
  const [childrenList, setChildrenList] = useState(initialChildren);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'health_log'

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);

  // Form State for Adding Child
  const [newChild, setNewChild] = useState({
    name: '',
    nickname: '',
    dob: '',
    gender: 'Nam',
    classId: 'LOP03',
    className: 'Mầm 1 (Mặt Trời Nhỏ)',
    parentName: '',
    parentPhone: '',
    parentRelationship: 'Bố',
    address: '',
    allergy: 'Không có',
    height: '95 cm',
    weight: '14 kg',
    healthStatus: 'Bình thường'
  });

  // Filter logic
  const filteredChildren = childrenList.filter((child) => {
    const matchesSearch =
      child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'ALL' || child.classId === selectedClass;
    const matchesGender = selectedGender === 'ALL' || child.gender === selectedGender;
    return matchesSearch && matchesClass && matchesGender;
  });

  const handleOpenAddModal = () => {
    setNewChild({
      name: '',
      nickname: '',
      dob: '2022-05-10',
      gender: 'Nam',
      classId: 'LOP03',
      className: 'Mầm 1 (Mặt Trời Nhỏ)',
      parentName: '',
      parentPhone: '',
      parentRelationship: 'Bố',
      address: '',
      allergy: 'Không có',
      height: '96 cm',
      weight: '14.5 kg',
      healthStatus: 'Bình thường'
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newChild.name || !newChild.parentName || !newChild.parentPhone) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*)!');
      return;
    }

    const targetClass = initialClasses.find((c) => c.id === newChild.classId);
    const newId = `TE00${childrenList.length + 1}`;
    const childToAdd = {
      ...newChild,
      id: newId,
      className: targetClass ? targetClass.name : newChild.className,
      enrollDate: new Date().toISOString().split('T')[0],
      status: 'Đang học',
      avatarBg: newChild.gender === 'Nam' ? '#69c0ff' : '#ff85c0',
      attendanceToday: 'Có mặt',
      tempToday: '36.6°C',
      eatingToday: 'Bình thường',
      sleepingToday: 'Ngủ trưa 2h'
    };

    setChildrenList([childToAdd, ...childrenList]);
    setIsAddModalOpen(false);
    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'Thành công',
        message: `Đã thêm hồ sơ bé ${newChild.name} vào hệ thống!`
      });
    }
  };

  const handleDeleteChild = (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ bé "${name}"?`)) {
      setChildrenList(childrenList.filter((c) => c.id !== id));
      if (onShowToast) {
        onShowToast({
          type: 'info',
          title: 'Đã xóa',
          message: `Đã xóa hồ sơ bé ${name}.`
        });
      }
    }
  };

  const handleViewDetail = (child) => {
    setSelectedChild(child);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="page-container fade-in">
      {/* Tiêu đề & Nút Thao Tác Đầu Trang */}
      <div className="page-header">
        <div>
          <div className="page-badge">
            <Baby size={14} /> QUẢN LÝ THÔNG TIN TRẺ EM
          </div>
          <h2>Hồ Sơ & Sức Khỏe Học Sinh</h2>
          <p>Quản lý toàn diện hồ sơ cá nhân, lớp học, phụ huynh và sức khỏe của trẻ</p>
        </div>

        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              Hồ sơ trẻ
            </button>
            <button
              className={`toggle-btn ${activeTab === 'health_log' ? 'active' : ''}`}
              onClick={() => setActiveTab('health_log')}
            >
              Nhật ký hôm nay
            </button>
          </div>

          <button className="btn-primary" onClick={handleOpenAddModal}>
            <Plus size={18} /> Thêm bé mới
          </button>
        </div>
      </div>

      {/* Thống kê tóm tắt nhanh */}
      <div className="mini-stats-row">
        <div className="mini-stat-card">
          <span className="dot-indicator bg-blue" />
          <div>
            <span className="mini-label">Tổng số bé</span>
            <strong>{childrenList.length} học sinh</strong>
          </div>
        </div>
        <div className="mini-stat-card">
          <span className="dot-indicator bg-green" />
          <div>
            <span className="mini-label">Đi học hôm nay</span>
            <strong>{childrenList.filter((c) => c.attendanceToday === 'Có mặt').length} bé (95%)</strong>
          </div>
        </div>
        <div className="mini-stat-card">
          <span className="dot-indicator bg-pink" />
          <div>
            <span className="mini-label">Bé gái / Bé trai</span>
            <strong>
              {childrenList.filter((c) => c.gender === 'Nữ').length} Nữ • {childrenList.filter((c) => c.gender === 'Nam').length} Nam
            </strong>
          </div>
        </div>
        <div className="mini-stat-card">
          <span className="dot-indicator bg-orange" />
          <div>
            <span className="mini-label">Bé cần lưu ý dị ứng</span>
            <strong>{childrenList.filter((c) => c.allergy && c.allergy !== 'Không có').length} bé</strong>
          </div>
        </div>
      </div>

      {/* Thanh Tìm Kiếm & Lọc */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên bé, tên ở nhà, mã học sinh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-selects">
          <div className="select-group">
            <Filter size={15} />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="ALL">Tất cả các lớp</option>
              {initialClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.grade})
                </option>
              ))}
            </select>
          </div>

          <div className="select-group">
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
            >
              <option value="ALL">Tất cả giới tính</option>
              <option value="Nam">Bé Trai</option>
              <option value="Nữ">Bé Gái</option>
            </select>
          </div>

          <div className="layout-switch">
            <button
              className={`icon-toggle ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Xem dạng thẻ lưới"
            >
              ▦
            </button>
            <button
              className={`icon-toggle ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Xem dạng bảng"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Nội dung TAB 1: Danh sách hồ sơ trẻ */}
      {activeTab === 'list' && (
        <>
          {viewMode === 'grid' ? (
            <div className="cards-grid">
              {filteredChildren.map((child) => (
                <div key={child.id} className="child-card card-lift">
                  <div className="child-card-header">
                    <div
                      className="child-avatar"
                      style={{ backgroundColor: child.avatarBg || '#69c0ff' }}
                    >
                      {child.gender === 'Nam' ? '👦' : '👧'}
                    </div>

                    <div className="child-basic">
                      <div className="child-name-row">
                        <h4>{child.name}</h4>
                        <span className="badge-tag">{child.nickname}</span>
                      </div>
                      <span className="child-code">{child.id} • {child.gender}</span>
                    </div>

                    <span className={`status-pill ${child.attendanceToday === 'Có mặt' ? 'pill-green' : 'pill-yellow'}`}>
                      {child.attendanceToday}
                    </span>
                  </div>

                  <div className="child-card-body">
                    <div className="info-line">
                      <span className="label">Lớp học:</span>
                      <strong className="text-blue">{child.className}</strong>
                    </div>

                    <div className="info-line">
                      <span className="label">Ngày sinh:</span>
                      <span>{child.dob} ({child.gender})</span>
                    </div>

                    <div className="info-line">
                      <span className="label">Phụ huynh:</span>
                      <span>{child.parentName} ({child.parentRelationship}) - {child.parentPhone}</span>
                    </div>

                    {child.allergy && child.allergy !== 'Không có' && (
                      <div className="allergy-warning">
                        <AlertTriangle size={13} /> Lưu ý dị ứng: {child.allergy}
                      </div>
                    )}
                  </div>

                  <div className="child-card-footer">
                    <button
                      className="btn-action-icon view"
                      title="Xem chi tiết"
                      onClick={() => handleViewDetail(child)}
                    >
                      <Eye size={16} /> Chi tiết
                    </button>
                    <button
                      className="btn-action-icon edit"
                      title="Chỉnh sửa"
                      onClick={() => handleViewDetail(child)}
                    >
                      <Edit size={16} /> Sửa
                    </button>
                    <button
                      className="btn-action-icon delete"
                      title="Xóa bé"
                      onClick={() => handleDeleteChild(child.id, child.name)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Mã số</th>
                    <th>Họ và Tên</th>
                    <th>Tên ở nhà</th>
                    <th>Ngày sinh</th>
                    <th>Giới tính</th>
                    <th>Lớp học</th>
                    <th>Phụ huynh</th>
                    <th>Số điện thoại</th>
                    <th>Dị ứng / Lưu ý</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChildren.map((child) => (
                    <tr key={child.id}>
                      <td><strong>{child.id}</strong></td>
                      <td>
                        <div className="table-user-cell">
                          <span className="table-mini-avatar">{child.gender === 'Nam' ? '👦' : '👧'}</span>
                          <span>{child.name}</span>
                        </div>
                      </td>
                      <td><span className="badge-nickname">{child.nickname}</span></td>
                      <td>{child.dob}</td>
                      <td>{child.gender}</td>
                      <td><span className="badge-class">{child.className}</span></td>
                      <td>{child.parentName}</td>
                      <td>{child.parentPhone}</td>
                      <td>
                        {child.allergy && child.allergy !== 'Không có' ? (
                          <span className="text-danger font-medium"><AlertTriangle size={12} /> {child.allergy}</span>
                        ) : (
                          <span className="text-muted">Bình thường</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons-cell">
                          <button
                            className="btn-tbl view"
                            onClick={() => handleViewDetail(child)}
                            title="Xem chi tiết"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            className="btn-tbl delete"
                            onClick={() => handleDeleteChild(child.id, child.name)}
                            title="Xóa"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Nội dung TAB 2: Nhật ký điểm danh & Sức khỏe hôm nay */}
      {activeTab === 'health_log' && (
        <div className="table-responsive fade-in">
          <div className="panel-hint">
            <Sparkles size={16} className="text-blue" />
            <span>
              Nhật ký được đồng bộ trực tiếp với giáo viên đứng lớp và cập nhật tới ứng dụng của phụ huynh trong ngày.
            </span>
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>Học sinh</th>
                <th>Lớp học</th>
                <th>Điểm danh</th>
                <th>Thân nhiệt sáng</th>
                <th>Tình trạng bữa ăn</th>
                <th>Tình trạng giấc ngủ</th>
                <th>Ghi chú giáo viên</th>
              </tr>
            </thead>
            <tbody>
              {filteredChildren.map((child) => (
                <tr key={child.id}>
                  <td>
                    <strong>{child.name}</strong> ({child.nickname})
                  </td>
                  <td>{child.className}</td>
                  <td>
                    <span className={`status-pill ${child.attendanceToday === 'Có mặt' ? 'pill-green' : 'pill-yellow'}`}>
                      {child.attendanceToday}
                    </span>
                  </td>
                  <td>
                    <strong className="text-blue">{child.tempToday}</strong>
                  </td>
                  <td>{child.eatingToday}</td>
                  <td>{child.sleepingToday}</td>
                  <td>
                    <span className="text-note">
                      {child.allergy !== 'Không có' ? `Dị ứng: ${child.allergy}` : 'Bé hoạt bát, vui vẻ'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL THÊM BÉ MỚI */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm Học Sinh Mầm Non Mới"
        maxWidth="680px"
        footer={
          <div className="modal-buttons">
            <button className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Hủy bỏ
            </button>
            <button className="btn-primary" onClick={handleAddSubmit}>
              <CheckCircle2 size={16} /> Lưu hồ sơ bé
            </button>
          </div>
        }
      >
        <form onSubmit={handleAddSubmit} className="modal-form-grid">
          <div className="form-group col-2">
            <label>Họ và Tên bé *</label>
            <input
              type="text"
              placeholder="VD: Nguyễn Gia Hân"
              value={newChild.name}
              onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Tên gọi ở nhà (Nickname)</label>
            <input
              type="text"
              placeholder="VD: Kem, Bông, Bắp..."
              value={newChild.nickname}
              onChange={(e) => setNewChild({ ...newChild, nickname: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Ngày sinh *</label>
            <input
              type="date"
              value={newChild.dob}
              onChange={(e) => setNewChild({ ...newChild, dob: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Giới tính *</label>
            <select
              value={newChild.gender}
              onChange={(e) => setNewChild({ ...newChild, gender: e.target.value })}
            >
              <option value="Nam">Bé Trai</option>
              <option value="Nữ">Bé Gái</option>
            </select>
          </div>

          <div className="form-group">
            <label>Phân vào Lớp học *</label>
            <select
              value={newChild.classId}
              onChange={(e) => {
                const target = initialClasses.find((c) => c.id === e.target.value);
                setNewChild({
                  ...newChild,
                  classId: e.target.value,
                  className: target ? target.name : ''
                });
              }}
            >
              {initialClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.grade})
                </option>
              ))}
            </select>
          </div>

          <div className="form-divider col-full">
            <span>Thông tin Phụ huynh / Người giám hộ</span>
          </div>

          <div className="form-group">
            <label>Họ tên phụ huynh *</label>
            <input
              type="text"
              placeholder="VD: Nguyễn Văn Nam"
              value={newChild.parentName}
              onChange={(e) => setNewChild({ ...newChild, parentName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Mối quan hệ</label>
            <select
              value={newChild.parentRelationship}
              onChange={(e) => setNewChild({ ...newChild, parentRelationship: e.target.value })}
            >
              <option value="Bố">Bố</option>
              <option value="Mẹ">Mẹ</option>
              <option value="Ông bà">Ông bà</option>
              <option value="Người giám hộ">Người giám hộ</option>
            </select>
          </div>

          <div className="form-group">
            <label>Số điện thoại liên hệ *</label>
            <input
              type="tel"
              placeholder="0912xxxxxx"
              value={newChild.parentPhone}
              onChange={(e) => setNewChild({ ...newChild, parentPhone: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Địa chỉ gia đình</label>
            <input
              type="text"
              placeholder="Địa chỉ cư trú..."
              value={newChild.address}
              onChange={(e) => setNewChild({ ...newChild, address: e.target.value })}
            />
          </div>

          <div className="form-divider col-full">
            <span>Sức khỏe & Dị ứng cần lưu ý</span>
          </div>

          <div className="form-group">
            <label>Dị ứng thực phẩm / Thuốc</label>
            <input
              type="text"
              placeholder="VD: Dị ứng tôm cua, lactose... hoặc Không có"
              value={newChild.allergy}
              onChange={(e) => setNewChild({ ...newChild, allergy: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Tình trạng thể lực hiện tại</label>
            <input
              type="text"
              placeholder="VD: Khỏe mạnh, chiều cao 96cm, cân nặng 14kg"
              value={newChild.healthStatus}
              onChange={(e) => setNewChild({ ...newChild, healthStatus: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* MODAL XEM CHI TIẾT HỒ SƠ BÉ */}
      {selectedChild && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Hồ Sơ Học Sinh: ${selectedChild.name}`}
          maxWidth="600px"
          footer={
            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setIsDetailModalOpen(false)}>
                Đóng
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  alert('Chức năng chỉnh sửa đã cập nhật dữ liệu!');
                  setIsDetailModalOpen(false);
                }}
              >
                Cập nhật hồ sơ
              </button>
            </div>
          }
        >
          <div className="child-detail-view">
            <div className="detail-hero">
              <div
                className="detail-avatar"
                style={{ backgroundColor: selectedChild.avatarBg || '#69c0ff' }}
              >
                {selectedChild.gender === 'Nam' ? '👦' : '👧'}
              </div>
              <div className="detail-hero-info">
                <h3>{selectedChild.name}</h3>
                <p>Tên ở nhà: <strong>{selectedChild.nickname}</strong> • Mã HS: <strong>{selectedChild.id}</strong></p>
                <div className="hero-tags">
                  <span className="badge-tag">{selectedChild.className}</span>
                  <span className="badge-tag">{selectedChild.gender}</span>
                  <span className="badge-tag">Nhập học: {selectedChild.enrollDate}</span>
                </div>
              </div>
            </div>

            <div className="detail-sections">
              <div className="detail-card">
                <h4><Baby size={16} /> Thông Tin Phát Triển & Sức Khỏe</h4>
                <div className="detail-grid">
                  <div><span>Ngày sinh:</span> <strong>{selectedChild.dob}</strong></div>
                  <div><span>Chiều cao:</span> <strong>{selectedChild.height || '102 cm'}</strong></div>
                  <div><span>Cân nặng:</span> <strong>{selectedChild.weight || '16 kg'}</strong></div>
                  <div><span>Tình trạng:</span> <strong>{selectedChild.healthStatus}</strong></div>
                  <div className="col-full">
                    <span>Lưu ý dị ứng:</span> 
                    <strong className={selectedChild.allergy !== 'Không có' ? 'text-danger' : ''}>
                      {selectedChild.allergy}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="detail-card">
                <h4><Phone size={16} /> Thông Tin Phụ Huynh & Gia Đình</h4>
                <div className="detail-grid">
                  <div><span>Họ tên:</span> <strong>{selectedChild.parentName}</strong></div>
                  <div><span>Mối quan hệ:</span> <strong>{selectedChild.parentRelationship}</strong></div>
                  <div><span>Số điện thoại:</span> <strong>{selectedChild.parentPhone}</strong></div>
                  <div className="col-full"><span>Địa chỉ:</span> <strong>{selectedChild.address}</strong></div>
                </div>
              </div>

              <div className="detail-card">
                <h4><Clock size={16} /> Tình Hình Sinh Hoạt Hôm Nay</h4>
                <div className="detail-grid">
                  <div><span>Điểm danh:</span> <strong className="text-green">{selectedChild.attendanceToday}</strong></div>
                  <div><span>Thân nhiệt:</span> <strong>{selectedChild.tempToday}</strong></div>
                  <div><span>Bữa ăn:</span> <strong>{selectedChild.eatingToday}</strong></div>
                  <div><span>Giấc ngủ trưa:</span> <strong>{selectedChild.sleepingToday}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
