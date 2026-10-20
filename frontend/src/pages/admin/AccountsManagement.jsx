import { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Key,
  CheckCircle2,
  UserX,
  Sparkles
} from 'lucide-react';
import { initialAccounts } from '../../data/mockData';
import Modal from '../../components/Modal';

export default function AccountsManagement({ onShowToast }) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'roles'

  // New account form
  const [newAcc, setNewAcc] = useState({
    username: '',
    fullName: '',
    email: '',
    role: 'GIAO_VIEN',
    password: ''
  });

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || acc.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newAcc.username || !newAcc.fullName || !newAcc.password) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc (*)!');
      return;
    }

    const roleMap = {
      ADMIN: 'Quản trị viên cấp cao',
      GIAO_VIEN: 'Giáo viên',
      PHU_HUYNH: 'Phụ huynh',
      KETOAN: 'Kế toán & Thu ngân'
    };

    const newId = `TK00${accounts.length + 1}`;
    const accountToAdd = {
      id: newId,
      username: newAcc.username,
      fullName: newAcc.fullName,
      email: newAcc.email || `${newAcc.username}@babyshark.edu.vn`,
      role: newAcc.role,
      roleName: roleMap[newAcc.role],
      status: 'Hoạt động',
      lastLogin: 'Chưa đăng nhập'
    };

    setAccounts([accountToAdd, ...accounts]);
    setIsAddModalOpen(false);
    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'Thành công',
        message: `Đã cấp tài khoản "${newAcc.username}" (${roleMap[newAcc.role]}) thành công!`
      });
    }
  };

  const handleToggleStatus = (acc) => {
    const newStatus = acc.status === 'Hoạt động' ? 'Đã khóa' : 'Hoạt động';
    setAccounts(
      accounts.map((item) => (item.id === acc.id ? { ...item, status: newStatus } : item))
    );
    if (onShowToast) {
      onShowToast({
        type: newStatus === 'Hoạt động' ? 'success' : 'info',
        title: 'Cập nhật trạng thái',
        message: `Đã chuyển tài khoản "${acc.username}" sang trạng thái: ${newStatus}.`
      });
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <div className="page-badge">
            <ShieldCheck size={14} /> BẢO MẬT & PHÂN QUYỀN
          </div>
          <h2>Quản Lý Tài Khoản & Vai Trò</h2>
          <p>Cấp phát tài khoản, kiểm soát quyền truy cập của Quản trị viên, Giáo viên, Phụ huynh và Kế toán</p>
        </div>

        <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} /> Cấp tài khoản mới
        </button>
      </div>

      {/* Tabs Chuyển Giữa Danh Sách User & Ma Trận Phân Quyền */}
      <div className="view-toggle" style={{ marginBottom: '20px' }}>
        <button
          className={`toggle-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Danh Sách Tài Khoản ({accounts.length})
        </button>
        <button
          className={`toggle-btn ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          Ma Trận Phân Quyền Vai Trò
        </button>
      </div>

      {activeTab === 'users' && (
        <>
          {/* Mini Stats */}
          <div className="mini-stats-row">
            <div className="mini-stat-card">
              <span className="dot-indicator bg-blue" />
              <div>
                <span className="mini-label">Tổng tài khoản hệ thống</span>
                <strong>{accounts.length} người dùng</strong>
              </div>
            </div>
            <div className="mini-stat-card">
              <span className="dot-indicator bg-green" />
              <div>
                <span className="mini-label">Đang hoạt động bình thường</span>
                <strong>{accounts.filter((a) => a.status === 'Hoạt động').length} tài khoản</strong>
              </div>
            </div>
            <div className="mini-stat-card">
              <span className="dot-indicator bg-purple" />
              <div>
                <span className="mini-label">Bảo mật mật khẩu</span>
                <strong>Mã hóa chuẩn BCrypt SHA-256</strong>
              </div>
            </div>
          </div>

          {/* Lọc & Tìm Kiếm */}
          <div className="filter-bar">
            <div className="search-input-wrap">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Tìm theo username, họ tên, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-selects">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="ADMIN">Quản trị viên (ADMIN)</option>
                <option value="GIAO_VIEN">Giáo viên (GIAO_VIEN)</option>
                <option value="PHU_HUYNH">Phụ huynh (PHU_HUYNH)</option>
                <option value="KETOAN">Kế toán (KETOAN)</option>
              </select>
            </div>
          </div>

          {/* Bảng Danh Sách Tài Khoản */}
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Mã TK</th>
                  <th>Tên Đăng Nhập</th>
                  <th>Họ và Tên Chủ Tài Khoản</th>
                  <th>Email</th>
                  <th>Vai Trò Phân Quyền</th>
                  <th>Đăng nhập gần nhất</th>
                  <th>Trạng Thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((acc) => (
                  <tr key={acc.id}>
                    <td><strong>{acc.id}</strong></td>
                    <td>
                      <code className="username-badge">{acc.username}</code>
                    </td>
                    <td><strong>{acc.fullName}</strong></td>
                    <td>{acc.email}</td>
                    <td>
                      <span
                        className={`role-tag ${
                          acc.role === 'ADMIN'
                            ? 'role-admin'
                            : acc.role === 'GIAO_VIEN'
                            ? 'role-teacher'
                            : acc.role === 'KETOAN'
                            ? 'role-accountant'
                            : 'role-parent'
                        }`}
                      >
                        {acc.roleName}
                      </span>
                    </td>
                    <td>{acc.lastLogin}</td>
                    <td>
                      <span
                        className={`status-pill ${
                          acc.status === 'Hoạt động' ? 'pill-green' : 'pill-red'
                        }`}
                      >
                        {acc.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        <button
                          className="btn-tbl view"
                          title="Đổi mật khẩu"
                          onClick={() =>
                            alert(`Đặt lại mật khẩu cho tài khoản "${acc.username}"`)
                          }
                        >
                          <Key size={14} />
                        </button>
                        <button
                          className={`btn-tbl ${acc.status === 'Hoạt động' ? 'delete' : 'pay'}`}
                          title={acc.status === 'Hoạt động' ? 'Khóa tài khoản' : 'Mở khóa'}
                          onClick={() => handleToggleStatus(acc)}
                        >
                          {acc.status === 'Hoạt động' ? <UserX size={14} /> : <CheckCircle2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Tab Ma Trận Phân Quyền */}
      {activeTab === 'roles' && (
        <div className="table-responsive fade-in">
          <div className="panel-hint" style={{ marginBottom: '16px' }}>
            <Sparkles size={16} className="text-blue" />
            <span>
              Ma trận phân quyền quy định phạm vi truy cập dữ liệu của từng vai trò để bảo vệ thông tin học sinh & tài chính nhà trường.
            </span>
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>Phân hệ chức năng</th>
                <th>Quản trị viên (ADMIN)</th>
                <th>Giáo viên (GIAO_VIEN)</th>
                <th>Kế toán (KETOAN)</th>
                <th>Phụ huynh (PHU_HUYNH)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Hồ sơ trẻ em</strong></td>
                <td><span className="badge-perm full">Toàn quyền (CRUD)</span></td>
                <td><span className="badge-perm write">Xem & Cập nhật nhật ký</span></td>
                <td><span className="badge-perm read">Chỉ xem</span></td>
                <td><span className="badge-perm read">Chỉ xem con mình</span></td>
              </tr>
              <tr>
                <td><strong>Giáo viên & Lớp học</strong></td>
                <td><span className="badge-perm full">Toàn quyền (CRUD)</span></td>
                <td><span className="badge-perm read">Xem lớp phụ trách</span></td>
                <td><span className="badge-perm read">Chỉ xem danh sách</span></td>
                <td><span className="badge-perm read">Xem giáo viên của con</span></td>
              </tr>
              <tr>
                <td><strong>Thực đơn & Món ăn</strong></td>
                <td><span className="badge-perm full">Toàn quyền (CRUD)</span></td>
                <td><span className="badge-perm read">Xem thực đơn</span></td>
                <td><span className="badge-perm read">Xem định lượng</span></td>
                <td><span className="badge-perm read">Xem thực đơn tuần</span></td>
              </tr>
              <tr>
                <td><strong>Học phí & Tiền ăn</strong></td>
                <td><span className="badge-perm full">Toàn quyền (CRUD)</span></td>
                <td><span className="badge-perm none">Không truy cập</span></td>
                <td><span className="badge-perm full">Lập phiếu & Thu tiền</span></td>
                <td><span className="badge-perm write">Xem hóa đơn & Nộp tiền</span></td>
              </tr>
              <tr>
                <td><strong>Tài khoản & Phân quyền</strong></td>
                <td><span className="badge-perm full">Toàn quyền quản trị</span></td>
                <td><span className="badge-perm none">Không truy cập</span></td>
                <td><span className="badge-perm none">Không truy cập</span></td>
                <td><span className="badge-perm none">Không truy cập</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Cấp Tài Khoản Mới */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Cấp Phát Tài Khoản Người Dùng Mới"
        maxWidth="550px"
        footer={
          <div className="modal-buttons">
            <button className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Hủy
            </button>
            <button className="btn-primary" onClick={handleAddSubmit}>
              <CheckCircle2 size={16} /> Cấp tài khoản
            </button>
          </div>
        }
      >
        <form onSubmit={handleAddSubmit} className="modal-form-grid">
          <div className="form-group col-2">
            <label>Tên đăng nhập (Username) *</label>
            <input
              type="text"
              placeholder="VD: gv_thuytrang"
              value={newAcc.username}
              onChange={(e) => setNewAcc({ ...newAcc, username: e.target.value })}
              required
            />
          </div>

          <div className="form-group col-2">
            <label>Họ và Tên người dùng *</label>
            <input
              type="text"
              placeholder="VD: Đặng Thùy Trang"
              value={newAcc.fullName}
              onChange={(e) => setNewAcc({ ...newAcc, fullName: e.target.value })}
              required
            />
          </div>

          <div className="form-group col-2">
            <label>Email liên hệ</label>
            <input
              type="email"
              placeholder="thuytrang@babyshark.edu.vn"
              value={newAcc.email}
              onChange={(e) => setNewAcc({ ...newAcc, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Vai trò hệ thống *</label>
            <select
              value={newAcc.role}
              onChange={(e) => setNewAcc({ ...newAcc, role: e.target.value })}
            >
              <option value="GIAO_VIEN">Giáo viên</option>
              <option value="PHU_HUYNH">Phụ huynh</option>
              <option value="KETOAN">Kế toán & Thu ngân</option>
              <option value="ADMIN">Quản trị viên (ADMIN)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Mật khẩu khởi tạo *</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu..."
              value={newAcc.password}
              onChange={(e) => setNewAcc({ ...newAcc, password: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
