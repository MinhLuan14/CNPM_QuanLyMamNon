import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ShieldCheck,
  Plus,
  Search,
  Key,
  Copy,
  CheckCircle2,
  UserX,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { authRequest, fetchCsrfToken, responseError } from '../../api/auth';
import Modal from '../../components/Modal';

const ROLE_LABELS = {
  ADMIN: 'QTV',
  GIAOVIEN: 'Giáo viên',
  PHUHUYNH: 'Phụ huynh',
  KETOAN: 'Kế toán & Thu ngân',
};

export default function AccountsManagement({ onShowToast, onNavigate }) {
  const [accounts, setAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'roles'
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busyAccountId, setBusyAccountId] = useState(null);
  const [temporaryCredential, setTemporaryCredential] = useState(null);

  const showToast = (type, title, message) => {
    onShowToast?.({ type, title, message });
  };

  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const response = await authRequest('/api/tai-khoan');
      if (!response.ok) {
        throw new Error(await responseError(response, 'Không thể tải danh sách tài khoản.'));
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Dữ liệu danh sách tài khoản từ máy chủ không hợp lệ.');
      }
      setAccounts(data.map((account) => ({
        id: account.maTaiKhoan,
        username: account.tenDangNhap || '',
        fullName: account.hoTenChuTaiKhoan || 'Chưa liên kết hồ sơ',
        email: account.email || '—',
        role: account.vaiTro || 'KHAC',
        roleName: ROLE_LABELS[account.vaiTro] || account.vaiTro || 'Chưa xác định',
        status: account.trangThai === true,
        lastLogin: account.lanDangNhapGanNhat
          ? new Date(account.lanDangNhapGanNhat).toLocaleString('vi-VN')
          : 'Chưa có dữ liệu',
      })));
    } catch (error) {
      setLoadError(error.message || 'Không thể kết nối tới máy chủ.');
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadAccounts, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadAccounts]);

  const filteredAccounts = useMemo(() => accounts.filter((acc) => {
    const query = searchQuery.trim().toLocaleLowerCase('vi');
    const matchesSearch = [acc.username, acc.fullName, acc.email]
      .some((value) => value.toLocaleLowerCase('vi').includes(query));
    const matchesRole = roleFilter === 'ALL' || acc.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL'
      || (statusFilter === 'ACTIVE' ? acc.status : !acc.status);
    return matchesSearch && matchesRole && matchesStatus;
  }), [accounts, roleFilter, searchQuery, statusFilter]);

  const handleToggleStatus = async (acc) => {
    const nextStatus = !acc.status;
    const statusLabel = nextStatus ? 'mở khóa' : 'khóa';
    if (!window.confirm(`Bạn có chắc chắn muốn ${statusLabel} tài khoản "${acc.username}"?`)) {
      return;
    }
    setBusyAccountId(acc.id);
    try {
      const csrfToken = await fetchCsrfToken();
      const response = await authRequest(
        `/api/accounts/${acc.id}/${nextStatus ? 'unlock' : 'lock'}`,
        { method: 'POST', headers: { 'X-XSRF-TOKEN': csrfToken } },
      );
      if (!response.ok) {
        throw new Error(await responseError(response, `Không thể ${statusLabel} tài khoản.`));
      }
      await loadAccounts();
      showToast('success', 'Đã cập nhật trạng thái', `Đã ${statusLabel} tài khoản "${acc.username}".`);
    } catch (error) {
      showToast('error', 'Không thể cập nhật tài khoản', error.message || 'Vui lòng thử lại.');
    } finally {
      setBusyAccountId(null);
    }
  };

  const handleResetPassword = async (acc) => {
    if (!window.confirm(
      `Cấp mật khẩu tạm mới cho tài khoản "${acc.username}"? Mật khẩu hiện tại sẽ mất hiệu lực.${acc.status ? '' : ' Tài khoản vẫn giữ trạng thái đã khóa.'}`,
    )) {
      return;
    }

    setBusyAccountId(acc.id);
    try {
      const csrfToken = await fetchCsrfToken();
      const response = await authRequest(
        `/api/tai-khoan/${acc.id}/cap-lai-mat-khau`,
        { method: 'POST', headers: { 'X-XSRF-TOKEN': csrfToken } },
      );
      if (!response.ok) {
        throw new Error(await responseError(response, 'Không thể cấp lại mật khẩu.'));
      }
      const credential = await response.json();
      setTemporaryCredential({
        ...credential,
        hoTen: acc.fullName,
        vaiTro: acc.roleName,
      });
      showToast('success', 'Đã cấp mật khẩu tạm', `Mật khẩu mới cho "${acc.username}" chỉ hiển thị lần này.`);
    } catch (error) {
      showToast('error', 'Không thể cấp lại mật khẩu', error.message || 'Vui lòng thử lại.');
    } finally {
      setBusyAccountId(null);
    }
  };

  const copyCredential = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      showToast('success', 'Đã sao chép', `Đã sao chép ${label}.`);
    } catch {
      showToast('error', 'Không thể sao chép', 'Trình duyệt không cho phép sao chép nội dung này.');
    }
  };

  const goToParentAccountProvisioning = () => {
    if (onNavigate) {
      onNavigate('Quản lý phụ huynh');
    } else {
      showToast('info', 'Cấp tài khoản', 'Tạo và cấp tài khoản phụ huynh trong màn hình Quản lý phụ huynh.');
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

        <button className="btn-primary" onClick={goToParentAccountProvisioning}>
          <Plus size={18} /> Cấp tài khoản phụ huynh
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
                <strong>{accounts.filter((a) => a.status).length} tài khoản</strong>
              </div>
            </div>
            <div className="mini-stat-card">
              <span className="dot-indicator bg-purple" />
              <div>
                <span className="mini-label">Bảo mật mật khẩu</span>
                <strong>Mã hóa BCrypt</strong>
              </div>
            </div>
          </div>

          {/* Lọc & Tìm Kiếm */}
          {loadError && (
            <div className="empty-state-hint" role="alert">
              <AlertCircle size={16} /> {loadError}
              <button className="btn-secondary" onClick={loadAccounts} disabled={isLoading}>
                <RefreshCw size={15} /> Tải lại
              </button>
            </div>
          )}

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
                <option value="GIAOVIEN">Giáo viên (GIAOVIEN)</option>
                <option value="PHUHUYNH">Phụ huynh (PHUHUYNH)</option>
                <option value="KETOAN">Kế toán (KETOAN)</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Lọc theo trạng thái tài khoản"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="LOCKED">Đã khóa</option>
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
                {isLoading ? (
                  <tr><td colSpan="8">Đang tải tài khoản từ máy chủ...</td></tr>
                ) : loadError ? (
                  <tr><td colSpan="8">Không thể hiển thị dữ liệu tài khoản.</td></tr>
                ) : accounts.length === 0 ? (
                  <tr><td colSpan="8">Database chưa có tài khoản nào.</td></tr>
                ) : filteredAccounts.length === 0 ? (
                  <tr><td colSpan="8">Không tìm thấy tài khoản phù hợp với bộ lọc.</td></tr>
                ) : filteredAccounts.map((acc) => (
                  <tr key={acc.id}>
                    <td><strong>{acc.id}</strong></td>
                    <td>
                      <code className="username-badge">{acc.username}</code>
                    </td>
                    <td><strong>{acc.fullName}</strong></td>
                    <td>{acc.email}</td>
                    <td>
                      <span
                        className={`role-tag ${acc.role === 'ADMIN'
                            ? 'role-admin'
                            : acc.role === 'GIAOVIEN'
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
                        className={`status-pill ${acc.status ? 'pill-green' : 'pill-red'
                          }`}
                      >
                        {acc.status ? 'Đang hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        <button
                          className="btn-tbl view"
                          title="Cấp lại mật khẩu tạm thời"
                          aria-label={`Cấp lại mật khẩu cho ${acc.username}`}
                          disabled={busyAccountId === acc.id}
                          onClick={() => handleResetPassword(acc)}
                        >
                          {busyAccountId === acc.id
                            ? <RefreshCw size={14} className="spin" />
                            : <Key size={14} />}
                        </button>
                        <button
                          className={`btn-tbl ${acc.status ? 'delete' : 'pay'}`}
                          title={acc.status ? 'Khóa tài khoản' : 'Mở khóa'}
                          aria-label={`${acc.status ? 'Khóa' : 'Mở khóa'} tài khoản ${acc.username}`}
                          disabled={busyAccountId === acc.id}
                          onClick={() => handleToggleStatus(acc)}
                        >
                          {busyAccountId === acc.id
                            ? <RefreshCw size={14} className="spin" />
                            : acc.status ? <UserX size={14} /> : <CheckCircle2 size={14} />}
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
                <th>Giáo viên (GIAOVIEN)</th>
                <th>Kế toán (KETOAN)</th>
                <th>Phụ huynh (PHUHUYNH)</th>
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

      <Modal
        isOpen={Boolean(temporaryCredential)}
        onClose={() => setTemporaryCredential(null)}
        title="Mật khẩu tạm thời — chỉ hiển thị một lần"
        maxWidth="540px"
        footer={(
          <div className="modal-buttons">
            {temporaryCredential && (
              <button
                className="btn-secondary"
                onClick={() => copyCredential(
                  `Tài khoản: ${temporaryCredential.hoTen}\nTên đăng nhập: ${temporaryCredential.tenDangNhap}\nMật khẩu tạm thời: ${temporaryCredential.matKhauTamThoi}`,
                  'thông tin bàn giao',
                )}
              >
                <Copy size={15} /> Sao chép thông tin bàn giao
              </button>
            )}
            <button className="btn-primary" onClick={() => setTemporaryCredential(null)}>Đóng</button>
          </div>
        )}
      >
        {temporaryCredential && (
          <div className="modal-form-grid">
            <p className="col-full"><strong>Tài khoản:</strong> {temporaryCredential.hoTen}</p>
            <p className="col-full"><strong>Vai trò:</strong> {temporaryCredential.vaiTro}</p>
            <div className="form-group col-full">
              <label>Tên đăng nhập</label>
              <div className="credential-copy-row">
                <input value={temporaryCredential.tenDangNhap} readOnly />
                <button
                  className="btn-secondary"
                  onClick={() => copyCredential(temporaryCredential.tenDangNhap, 'tên đăng nhập')}
                >
                  Sao chép tên đăng nhập
                </button>
              </div>
            </div>
            <div className="form-group col-full">
              <label>Mật khẩu tạm thời</label>
              <div className="credential-copy-row">
                <input value={temporaryCredential.matKhauTamThoi} readOnly />
                <button
                  className="btn-secondary"
                  onClick={() => copyCredential(temporaryCredential.matKhauTamThoi, 'mật khẩu tạm thời')}
                >
                  Sao chép mật khẩu
                </button>
              </div>
            </div>
            <p className="col-full" role="alert">
              Mật khẩu tạm thời chỉ hiển thị một lần. Hãy bàn giao an toàn; mật khẩu cũ đã mất hiệu lực.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
