import { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Baby,
  MessageSquare,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  Send
} from 'lucide-react';
import { initialParents, initialChildren } from '../../data/mockData';
import Modal from '../../components/Modal';

export default function ParentsManagement({ onShowToast }) {
  const [parents, setParents] = useState(initialParents);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [messageContent, setMessageContent] = useState('');

  // Form state
  const [newParent, setNewParent] = useState({
    name: '',
    gender: 'Nam',
    phone: '',
    email: '',
    job: '',
    address: '',
    childId: 'TE001',
    relationship: 'Bố'
  });

  const filteredParents = parents.filter((parent) => {
    const matchesSearch =
      parent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.phone.includes(searchQuery) ||
      parent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.children.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newParent.name || !newParent.phone) {
      alert('Vui lòng điền đầy đủ các mục bắt buộc (*)!');
      return;
    }

    const linkedChild = initialChildren.find((c) => c.id === newParent.childId);
    const newId = `PH00${parents.length + 1}`;
    const parentToAdd = {
      id: newId,
      name: newParent.name,
      gender: newParent.gender,
      phone: newParent.phone,
      email: newParent.email || `${newParent.phone}@gmail.com`,
      job: newParent.job || 'Kinh doanh tự do',
      address: newParent.address || 'TP. Hồ Chí Minh',
      children: [
        {
          id: newParent.childId,
          name: linkedChild ? linkedChild.name : 'Bé',
          relationship: newParent.relationship,
          class: linkedChild ? linkedChild.className : 'Mầm 1'
        }
      ],
      status: 'Đã kích hoạt tài khoản'
    };

    setParents([parentToAdd, ...parents]);
    setIsAddModalOpen(false);
    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'Thành công',
        message: `Đã thêm phụ huynh ${newParent.name} vào hệ thống!`
      });
    }
  };

  const handleSendMessage = () => {
    if (!messageContent.trim()) {
      alert('Vui lòng nhập nội dung tin nhắn!');
      return;
    }
    setIsMessageModalOpen(false);
    setMessageContent('');
    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'Đã gửi tin nhắn',
        message: `Đã gửi thông báo tới phụ huynh ${selectedParent?.name} qua ứng dụng BabyShark App!`
      });
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <div className="page-badge">
            <Users size={14} /> QUẢN LÝ PHỤ HUYNH & LIÊN LẠC
          </div>
          <h2>Danh Sách Phụ Huynh Học Sinh</h2>
          <p>Kênh liên kết giữa nhà trường và gia đình, kết nối trực tiếp với ứng dụng phụ huynh</p>
        </div>

        <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} /> Thêm phụ huynh
        </button>
      </div>

      {/* Mini Stats */}
      <div className="mini-stats-row">
        <div className="mini-stat-card">
          <span className="dot-indicator bg-blue" />
          <div>
            <span className="mini-label">Tổng số phụ huynh</span>
            <strong>{parents.length} phụ huynh</strong>
          </div>
        </div>
        <div className="mini-stat-card">
          <span className="dot-indicator bg-green" />
          <div>
            <span className="mini-label">Đã kết nối App BabyShark</span>
            <strong>{parents.filter((p) => p.status.includes('kích hoạt')).length} tài khoản (90%)</strong>
          </div>
        </div>
        <div className="mini-stat-card">
          <span className="dot-indicator bg-orange" />
          <div>
            <span className="mini-label">Tin nhắn trao đổi trong tuần</span>
            <strong>148 tin nhắn mới</strong>
          </div>
        </div>
      </div>

      {/* Tìm kiếm */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên phụ huynh, số điện thoại, tên bé..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Bảng danh sách phụ huynh */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Mã PH</th>
              <th>Họ và Tên</th>
              <th>Số điện thoại</th>
              <th>Email</th>
              <th>Nghề nghiệp</th>
              <th>Bé đang học</th>
              <th>Trạng thái App</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredParents.map((parent) => (
              <tr key={parent.id}>
                <td><strong>{parent.id}</strong></td>
                <td>
                  <div className="table-user-cell">
                    <span className="table-mini-avatar">{parent.gender === 'Nam' ? '👨' : '👩'}</span>
                    <div>
                      <strong>{parent.name}</strong>
                      <div className="text-muted text-xs">{parent.address}</div>
                    </div>
                  </div>
                </td>
                <td><strong>{parent.phone}</strong></td>
                <td>{parent.email}</td>
                <td>{parent.job}</td>
                <td>
                  <div className="children-badge-list">
                    {parent.children.map((child, idx) => (
                      <span key={idx} className="badge-child-link">
                        <Baby size={12} /> {child.name} ({child.relationship}) - {child.class}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <span className={`status-pill ${parent.status.includes('Đã') ? 'pill-green' : 'pill-yellow'}`}>
                    <ShieldCheck size={12} /> {parent.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons-cell">
                    <button
                      className="btn-tbl view"
                      title="Gửi tin nhắn thông báo"
                      onClick={() => {
                        setSelectedParent(parent);
                        setIsMessageModalOpen(true);
                      }}
                    >
                      <MessageSquare size={15} />
                    </button>
                    <button
                      className="btn-tbl delete"
                      title="Xóa phụ huynh"
                      onClick={() => {
                        if (window.confirm(`Xóa phụ huynh ${parent.name}?`)) {
                          setParents(parents.filter((p) => p.id !== parent.id));
                        }
                      }}
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

      {/* Modal Thêm Phụ Huynh Mới */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm Phụ Huynh Mới"
        maxWidth="600px"
        footer={
          <div className="modal-buttons">
            <button className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Hủy
            </button>
            <button className="btn-primary" onClick={handleAddSubmit}>
              <CheckCircle2 size={16} /> Lưu thông tin
            </button>
          </div>
        }
      >
        <form onSubmit={handleAddSubmit} className="modal-form-grid">
          <div className="form-group col-2">
            <label>Họ và Tên phụ huynh *</label>
            <input
              type="text"
              placeholder="VD: Nguyễn Văn Hưng"
              value={newParent.name}
              onChange={(e) => setNewParent({ ...newParent, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Giới tính</label>
            <select
              value={newParent.gender}
              onChange={(e) => setNewParent({ ...newParent, gender: e.target.value })}
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>

          <div className="form-group">
            <label>Số điện thoại liên hệ *</label>
            <input
              type="tel"
              placeholder="0918xxxxxx"
              value={newParent.phone}
              onChange={(e) => setNewParent({ ...newParent, phone: e.target.value })}
              required
            />
          </div>

          <div className="form-group col-2">
            <label>Email</label>
            <input
              type="email"
              placeholder="phuhuynh@gmail.com"
              value={newParent.email}
              onChange={(e) => setNewParent({ ...newParent, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Nghề nghiệp</label>
            <input
              type="text"
              placeholder="VD: Kỹ sư, Bác sĩ, Kinh doanh..."
              value={newParent.job}
              onChange={(e) => setNewParent({ ...newParent, job: e.target.value })}
            />
          </div>

          <div className="form-group col-2">
            <label>Địa chỉ thường trú</label>
            <input
              type="text"
              placeholder="Số nhà, tên đường, quận/huyện..."
              value={newParent.address}
              onChange={(e) => setNewParent({ ...newParent, address: e.target.value })}
            />
          </div>

          <div className="form-divider col-full">
            <span>Liên kết với Bé đang theo học tại trường</span>
          </div>

          <div className="form-group">
            <label>Chọn Bé</label>
            <select
              value={newParent.childId}
              onChange={(e) => setNewParent({ ...newParent, childId: e.target.value })}
            >
              {initialChildren.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name} ({child.className})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Mối quan hệ với bé</label>
            <select
              value={newParent.relationship}
              onChange={(e) => setNewParent({ ...newParent, relationship: e.target.value })}
            >
              <option value="Bố">Bố</option>
              <option value="Mẹ">Mẹ</option>
              <option value="Ông">Ông</option>
              <option value="Bà">Bà</option>
              <option value="Người giám hộ">Người giám hộ</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Modal Gửi Tin Nhắn / Thông Báo Cho Phụ Huynh */}
      {selectedParent && (
        <Modal
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          title={`Gửi Tin Nhắn Tới Phụ Huynh: ${selectedParent.name}`}
          maxWidth="520px"
          footer={
            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setIsMessageModalOpen(false)}>
                Hủy
              </button>
              <button className="btn-primary" onClick={handleSendMessage}>
                <Send size={15} /> Gửi tin nhắn ngay
              </button>
            </div>
          }
        >
          <div className="message-modal-content">
            <div className="message-recipient-info">
              <Phone size={14} /> SĐT: <strong>{selectedParent.phone}</strong> | Phụ huynh bé:{' '}
              <strong>{selectedParent.children.map((c) => c.name).join(', ')}</strong>
            </div>

            <div className="form-group">
              <label>Nội dung thông báo / trao đổi tình hình học sinh:</label>
              <textarea
                rows={4}
                placeholder="Nhập nội dung tin nhắn trao đổi tình hình ăn uống, học tập hoặc nhắc nhở phụ huynh..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="custom-textarea"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
