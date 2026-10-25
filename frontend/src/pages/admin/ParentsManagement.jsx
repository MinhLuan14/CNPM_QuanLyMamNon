import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Baby,
  CheckCircle2,
  Eye,
  LockKeyhole,
  Pencil,
  Plus,
  Search,
  Copy,
  ShieldCheck,
  UnlockKeyhole,
  Users,
} from 'lucide-react';
import { authRequest, fetchCsrfToken, responseError } from '../../api/auth';
import Modal from '../../components/Modal';

const EMPTY_FORM = {
  hoTenDemPH: '',
  tenPH: '',
  diaChiLH: '',
  soDienThoai: '',
  email: '',
  capTaiKhoan: true,
  maTre: '',
  quanHe: 'Bố',
};

async function readResponse(response, fallback) {
  if (!response.ok) {
    throw new Error(await responseError(response, fallback));
  }
  return response.status === 204 ? null : response.json();
}

function getParentName(parent) {
  return [parent.hoTenDemPH, parent.tenPH].filter(Boolean).join(' ');
}

function getChildName(child) {
  return [child.hoTenDemTre, child.tenTre].filter(Boolean).join(' ');
}

function getAccountStatus(account) {
  if (!account?.coTaiKhoan) return 'Chưa có tài khoản';
  return account.trangThai ? 'Đang hoạt động' : 'Đã khóa';
}

export default function ParentsManagement({ onShowToast, canManageLinks = false }) {
  const [parents, setParents] = useState([]);
  const [children, setChildren] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [parentDetails, setParentDetails] = useState(null);
  const [editingParent, setEditingParent] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editError, setEditError] = useState('');
  const [linkForm, setLinkForm] = useState({ maTre: '', quanHe: 'Bố' });
  const [replacementByChild, setReplacementByChild] = useState({});
  const [linkError, setLinkError] = useState('');
  const [isLinkSaving, setIsLinkSaving] = useState(false);
  const [oneTimeCredentials, setOneTimeCredentials] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyParentId, setBusyParentId] = useState(null);
  const [loadError, setLoadError] = useState('');

  const showToast = (type, title, message) => {
    onShowToast?.({ type, title, message });
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [parentsResponse, childrenResponse] = await Promise.all([
        authRequest('/api/phu-huynh'),
        authRequest('/api/tre-em'),
      ]);
      const [parentData, childData] = await Promise.all([
        readResponse(parentsResponse, 'Không thể tải danh sách phụ huynh.'),
        readResponse(childrenResponse, 'Không thể tải danh sách trẻ.'),
      ]);
      setParents(parentData);
      setChildren(childData);
    } catch (error) {
      setLoadError(error.message || 'Không thể tải dữ liệu phụ huynh.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => loadData(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  const filteredParents = useMemo(() => {
    const keyword = searchQuery.trim().toLocaleLowerCase('vi');
    if (!keyword) return parents;

    return parents.filter(({ phuHuynh, taiKhoan, treEm }) => {
      const childrenNames = (treEm || [])
        .map((child) => getChildName(child))
        .join(' ');
      return [
        getParentName(phuHuynh || {}),
        phuHuynh?.soDienThoai,
        phuHuynh?.email,
        taiKhoan?.tenDangNhap,
        childrenNames,
      ].some((value) => String(value || '').toLocaleLowerCase('vi').includes(keyword));
    });
  }, [parents, searchQuery]);

  const activeAccountCount = parents.filter(
    (parent) => parent.taiKhoan?.coTaiKhoan && parent.taiKhoan.trangThai,
  ).length;

  const openAddModal = () => {
    setForm(EMPTY_FORM);
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const csrfToken = await fetchCsrfToken();
      const endpoint = form.capTaiKhoan ? '/api/tai-khoan/phu-huynh' : '/api/phu-huynh';
      const createResponse = await authRequest(endpoint, {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': csrfToken },
        body: JSON.stringify({
          hoTenDemPH: form.hoTenDemPH.trim(),
          tenPH: form.tenPH.trim(),
          diaChiLH: form.diaChiLH.trim(),
          soDienThoai: form.soDienThoai.trim(),
          email: form.email.trim() || null,
          capTaiKhoan: form.capTaiKhoan,
          maTre: form.maTre ? Number(form.maTre) : null,
          quanHe: form.maTre ? form.quanHe : null,
        }),
      });
      const createdParent = await readResponse(createResponse, 'Không thể tạo hồ sơ phụ huynh.');

      setIsAddModalOpen(false);
      await loadData();
      if (createdParent.matKhauTamThoi) {
        setOneTimeCredentials({
          parentName: getParentName(form),
          username: createdParent.tenDangNhap,
          password: createdParent.matKhauTamThoi,
        });
      } else {
        showToast('success', 'Thành công', `Đã tạo hồ sơ phụ huynh ${getParentName(form)}.`);
      }
    } catch (error) {
      showToast('error', 'Không thể tạo phụ huynh', error.message || 'Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleIssueAccount = async (parentItem) => {
    const parentName = getParentName(parentItem.phuHuynh);
    setBusyParentId(parentItem.phuHuynh.maPhuHuynh);
    try {
      const csrfToken = await fetchCsrfToken();
      const response = await authRequest(
        `/api/tai-khoan/phu-huynh/${parentItem.phuHuynh.maPhuHuynh}/cap-tai-khoan`,
        { method: 'POST', headers: { 'X-XSRF-TOKEN': csrfToken } },
      );
      const account = await readResponse(response, 'Không thể cấp tài khoản.');
      await loadData();
      setOneTimeCredentials({
        parentName,
        username: account.tenDangNhap,
        password: account.matKhauTamThoi,
      });
    } catch (error) {
      showToast('error', 'Không thể cấp tài khoản', error.message || 'Vui lòng thử lại.');
    } finally {
      setBusyParentId(null);
    }
  };

  const handleToggleAccount = async (parentItem) => {
    const { phuHuynh, taiKhoan } = parentItem;
    if (!taiKhoan?.coTaiKhoan || !taiKhoan.maTaiKhoan) return;

    const newStatus = !taiKhoan.trangThai;
    const parentName = getParentName(phuHuynh);
    const action = newStatus ? 'mở khóa' : 'khóa';
    if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản của ${parentName}? Hồ sơ và liên kết với trẻ sẽ được giữ nguyên.`)) {
      return;
    }
    setBusyParentId(phuHuynh.maPhuHuynh);
    try {
      const csrfToken = await fetchCsrfToken();
      const response = await authRequest(`/api/tai-khoan/${taiKhoan.maTaiKhoan}/trang-thai`, {
        method: 'PATCH',
        headers: { 'X-XSRF-TOKEN': csrfToken },
        body: JSON.stringify({ trangThai: newStatus }),
      });
      await readResponse(response, 'Không thể cập nhật trạng thái tài khoản.');
      await loadData();
      showToast(
        'success',
        'Đã cập nhật tài khoản',
        `${newStatus ? 'Đã mở khóa' : 'Đã khóa'} tài khoản của ${parentName}.`,
      );
    } catch (error) {
      showToast('error', 'Không thể cập nhật tài khoản', error.message || 'Vui lòng thử lại.');
    } finally {
      setBusyParentId(null);
    }
  };

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const loadParentDetails = async (maPhuHuynh) => {
    const response = await authRequest(`/api/phu-huynh/${maPhuHuynh}/thong-tin-lien-ket`);
    return readResponse(response, 'Không thể tải chi tiết phụ huynh.');
  };

  const handleViewParent = async (maPhuHuynh) => {
    try {
      const details = await loadParentDetails(maPhuHuynh);
      setParentDetails(details);
      setLinkForm({ maTre: '', quanHe: 'Bố' });
      setReplacementByChild({});
      setLinkError('');
    } catch (error) {
      showToast('error', 'Không thể tải hồ sơ', error.message || 'Vui lòng thử lại.');
    }
  };

  const handleOpenEdit = async (maPhuHuynh) => {
    setBusyParentId(maPhuHuynh);
    setEditError('');
    try {
      const details = await loadParentDetails(maPhuHuynh);
      setEditingParent(details);
      setEditForm({
        hoTenDemPH: details.phuHuynh.hoTenDemPH || '',
        tenPH: details.phuHuynh.tenPH || '',
        soDienThoai: details.phuHuynh.soDienThoai || '',
        email: details.phuHuynh.email || '',
        diaChiLH: details.phuHuynh.diaChiLH || '',
      });
    } catch (error) {
      showToast('error', 'Không thể mở chỉnh sửa', error.message || 'Vui lòng thử lại.');
    } finally {
      setBusyParentId(null);
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editingParent || !editForm) return;
    setEditError('');
    setIsSaving(true);
    try {
      const csrfToken = await fetchCsrfToken();
      const response = await authRequest(`/api/phu-huynh/${editingParent.phuHuynh.maPhuHuynh}`, {
        method: 'PUT',
        headers: { 'X-XSRF-TOKEN': csrfToken },
        body: JSON.stringify({
          hoTenDemPH: editForm.hoTenDemPH.trim(),
          tenPH: editForm.tenPH.trim(),
          soDienThoai: editForm.soDienThoai.trim(),
          email: editForm.email.trim() || null,
          diaChiLH: editForm.diaChiLH.trim(),
        }),
      });
      const updatedDetails = await readResponse(response, 'Không thể cập nhật hồ sơ phụ huynh.');
      setParentDetails((current) => (
        current?.phuHuynh.maPhuHuynh === updatedDetails.phuHuynh.maPhuHuynh
          ? updatedDetails
          : current
      ));
      setEditingParent(null);
      setEditForm(null);
      await loadData();
      showToast('success', 'Đã lưu thay đổi', 'Thông tin hồ sơ phụ huynh đã được cập nhật.');
    } catch (error) {
      setEditError(error.message || 'Không thể cập nhật hồ sơ. Vui lòng kiểm tra lại dữ liệu.');
    } finally {
      setIsSaving(false);
    }
  };

  const closeEditModal = () => {
    if (isSaving) return;
    setEditingParent(null);
    setEditForm(null);
    setEditError('');
  };

  const updateEditForm = (field, value) => {
    setEditForm((current) => ({ ...current, [field]: value }));
    setEditError('');
  };

  const refreshParentDetails = async (maPhuHuynh) => {
    const details = await loadParentDetails(maPhuHuynh);
    setParentDetails(details);
    await loadData();
  };

  const createParentChildLink = async (event) => {
    event.preventDefault();
    if (!parentDetails || !linkForm.maTre) return;
    setIsLinkSaving(true);
    setLinkError('');
    try {
      const csrfToken = await fetchCsrfToken();
      const response = await authRequest('/api/phu-huynh-tre', {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': csrfToken },
        body: JSON.stringify({
          maPhuHuynh: parentDetails.phuHuynh.maPhuHuynh,
          maTre: Number(linkForm.maTre),
          quanHe: linkForm.quanHe,
        }),
      });
      await readResponse(response, 'Không thể liên kết trẻ với phụ huynh.');
      await refreshParentDetails(parentDetails.phuHuynh.maPhuHuynh);
      setLinkForm({ maTre: '', quanHe: 'Bố' });
      showToast('success', 'Đã liên kết trẻ', 'Liên kết phụ huynh và trẻ đã được tạo.');
    } catch (error) {
      setLinkError(error.message || 'Không thể liên kết trẻ. Vui lòng thử lại.');
    } finally {
      setIsLinkSaving(false);
    }
  };

  const replaceLinkedChild = async (child) => {
    if (!parentDetails) return;
    const replacementId = replacementByChild[child.maTre];
    if (!replacementId) {
      setLinkError('Hãy chọn trẻ mới cần liên kết.');
      return;
    }
    const parentId = parentDetails.phuHuynh.maPhuHuynh;
    setIsLinkSaving(true);
    setLinkError('');
    try {
      const csrfToken = await fetchCsrfToken();
      const response = await authRequest(
        `/api/phu-huynh-tre/${parentId}/${child.maTre}/doi-tre`,
        {
          method: 'PUT',
          headers: { 'X-XSRF-TOKEN': csrfToken },
          body: JSON.stringify({
            maTre: Number(replacementId),
            quanHe: child.quanHe || null,
          }),
        },
      );
      await readResponse(response, 'Không thể đổi trẻ được liên kết.');
      await refreshParentDetails(parentId);
      setReplacementByChild((current) => {
        const next = { ...current };
        delete next[child.maTre];
        return next;
      });
      showToast('success', 'Đã cập nhật liên kết', 'Trẻ được liên kết đã được thay đổi.');
    } catch (error) {
      setLinkError(error.message || 'Không thể đổi trẻ liên kết. Dữ liệu cũ vẫn được giữ.');
    } finally {
      setIsLinkSaving(false);
    }
  };

  const removeParentChildLink = async (child) => {
    if (!parentDetails) return;
    const parentId = parentDetails.phuHuynh.maPhuHuynh;
    if (!window.confirm(`Hủy liên kết ${getChildName(child)} với phụ huynh này? Hồ sơ trẻ vẫn được giữ nguyên.`)) {
      return;
    }
    setIsLinkSaving(true);
    setLinkError('');
    try {
      const csrfToken = await fetchCsrfToken();
      const response = await authRequest(
        `/api/phu-huynh-tre/${parentId}/${child.maTre}`,
        { method: 'DELETE', headers: { 'X-XSRF-TOKEN': csrfToken } },
      );
      await readResponse(response, 'Không thể hủy liên kết.');
      await refreshParentDetails(parentId);
      showToast('success', 'Đã hủy liên kết', 'Hồ sơ phụ huynh và trẻ vẫn được giữ nguyên.');
    } catch (error) {
      setLinkError(error.message || 'Không thể hủy liên kết. Vui lòng thử lại.');
    } finally {
      setIsLinkSaving(false);
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

  const closeCredentials = () => setOneTimeCredentials(null);

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <div className="page-badge"><Users size={14} /> QUẢN LÝ PHỤ HUYNH & LIÊN LẠC</div>
          <h2>Danh Sách Phụ Huynh Học Sinh</h2>
          <p>Quản lý hồ sơ, tài khoản và liên kết giữa phụ huynh với trẻ.</p>
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Thêm phụ huynh
        </button>
      </div>

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
            <span className="mini-label">Tài khoản đang hoạt động</span>
            <strong>{activeAccountCount} / {parents.length} tài khoản</strong>
          </div>
        </div>
        <div className="mini-stat-card">
          <span className="dot-indicator bg-orange" />
          <div>
            <span className="mini-label">Chưa cấp tài khoản</span>
            <strong>{parents.length - parents.filter((parent) => parent.taiKhoan?.coTaiKhoan).length} phụ huynh</strong>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên phụ huynh, số điện thoại, tên bé..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      {loadError && (
        <div className="empty-state-hint" role="alert">
          <AlertCircle size={16} /> {loadError}
          <button className="btn-secondary" onClick={loadData}>Thử tải lại</button>
        </div>
      )}

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Mã PH</th>
              <th>Họ và Tên</th>
              <th>Số điện thoại</th>
              <th>Email</th>
              <th>Bé đang học</th>
              <th>Trạng thái tài khoản</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="7">Đang tải danh sách phụ huynh...</td></tr>
            ) : filteredParents.length === 0 ? (
              <tr>
                <td colSpan="7">
                  {loadError ? 'Không thể hiển thị dữ liệu.' : 'Không tìm thấy phụ huynh phù hợp.'}
                </td>
              </tr>
            ) : filteredParents.map((parentItem) => {
              const { phuHuynh, taiKhoan, treEm = [] } = parentItem;
              const parentName = getParentName(phuHuynh);
              const status = getAccountStatus(taiKhoan);
              const active = taiKhoan?.coTaiKhoan && taiKhoan.trangThai;
              const busy = busyParentId === phuHuynh.maPhuHuynh;

              return (
                <tr key={phuHuynh.maPhuHuynh}>
                  <td><strong>PH{String(phuHuynh.maPhuHuynh).padStart(3, '0')}</strong></td>
                  <td>
                    <div className="table-user-cell">
                      <span className="table-mini-avatar">👪</span>
                      <div>
                        <strong>{parentName}</strong>
                        <div className="text-muted text-xs">{phuHuynh.diaChiLH || 'Chưa có địa chỉ'}</div>
                      </div>
                    </div>
                  </td>
                  <td><strong>{phuHuynh.soDienThoai}</strong></td>
                  <td>{phuHuynh.email || '—'}</td>
                  <td>
                    <div className="children-badge-list">
                      {treEm.length ? treEm.map((child) => (
                        <span key={child.maTre} className="badge-child-link">
                          <Baby size={12} /> {getChildName(child)} ({child.quanHe || 'Chưa rõ quan hệ'})
                        </span>
                      )) : <span className="text-muted">Chưa liên kết trẻ</span>}
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${active ? 'pill-green' : 'pill-yellow'}`}>
                      <ShieldCheck size={12} /> {status}
                    </span>
                    {taiKhoan?.tenDangNhap && (
                      <div className="text-muted text-xs">{taiKhoan.tenDangNhap}</div>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons-cell">
                      <button
                        className="btn-tbl view"
                        title="Xem chi tiết"
                        aria-label={`Xem chi tiết ${parentName}`}
                        onClick={() => handleViewParent(phuHuynh.maPhuHuynh)}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        className="btn-tbl view"
                        title="Chỉnh sửa thông tin"
                        aria-label={`Chỉnh sửa thông tin ${parentName}`}
                        disabled={busy}
                        onClick={() => handleOpenEdit(phuHuynh.maPhuHuynh)}
                      >
                        <Pencil size={15} />
                      </button>
                      {taiKhoan?.coTaiKhoan ? (
                        <button
                          className={`btn-tbl ${active ? 'delete' : 'view'}`}
                          title={active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          aria-label={`${active ? 'Khóa' : 'Mở khóa'} tài khoản ${parentName}`}
                          disabled={busy}
                          onClick={() => handleToggleAccount(parentItem)}
                        >
                          {active ? <LockKeyhole size={15} /> : <UnlockKeyhole size={15} />}
                        </button>
                      ) : (
                        <button
                          className="btn-secondary"
                          disabled={busy}
                          onClick={() => handleIssueAccount(parentItem)}
                        >
                          {busy ? 'Đang cấp...' : 'Cấp tài khoản'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !isSaving && setIsAddModalOpen(false)}
        title="Thêm hồ sơ phụ huynh"
        maxWidth="600px"
        footer={(
          <div className="modal-buttons">
            <button className="btn-secondary" onClick={() => setIsAddModalOpen(false)} disabled={isSaving}>
              Hủy
            </button>
            <button className="btn-primary" type="submit" form="parent-create-form" disabled={isSaving}>
              <CheckCircle2 size={16} /> {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </div>
        )}
      >
        <form id="parent-create-form" onSubmit={handleAddSubmit} className="modal-form-grid">
          <div className="form-group col-2">
            <label>Họ và tên đệm *</label>
            <input
              type="text"
              value={form.hoTenDemPH}
              onChange={(event) => updateForm('hoTenDemPH', event.target.value)}
              maxLength={255}
              required
            />
          </div>
          <div className="form-group col-2">
            <label>Tên *</label>
            <input
              type="text"
              value={form.tenPH}
              onChange={(event) => updateForm('tenPH', event.target.value)}
              maxLength={100}
              required
            />
          </div>
          <div className="form-group">
            <label>Số điện thoại *</label>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              value={form.soDienThoai}
              onChange={(event) => updateForm('soDienThoai', event.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              maxLength={100}
              value={form.email}
              onChange={(event) => updateForm('email', event.target.value)}
            />
          </div>
          <div className="form-group col-2">
            <label>Địa chỉ liên hệ *</label>
            <input
              type="text"
              maxLength={255}
              value={form.diaChiLH}
              onChange={(event) => updateForm('diaChiLH', event.target.value)}
              required
            />
          </div>

          <div className="form-group col-full">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={form.capTaiKhoan}
                onChange={(event) => updateForm('capTaiKhoan', event.target.checked)}
              />
              Cấp tài khoản đăng nhập tự động
            </label>
            <small>Hệ thống tự tạo tên đăng nhập và mật khẩu tạm thời an toàn.</small>
          </div>

          <div className="form-divider col-full"><span>Liên kết với trẻ (không bắt buộc)</span></div>
          <div className="form-group">
            <label>Chọn trẻ</label>
            <select value={form.maTre} onChange={(event) => updateForm('maTre', event.target.value)}>
              <option value="">Chưa liên kết</option>
              {children.map((child) => (
                <option key={child.maTre} value={child.maTre}>
                  {getChildName(child)}{child.tenLopHoc ? ` (${child.tenLopHoc})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Mối quan hệ với trẻ</label>
            <select
              value={form.quanHe}
              onChange={(event) => updateForm('quanHe', event.target.value)}
              disabled={!form.maTre}
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

      <Modal
        isOpen={Boolean(editingParent && editForm)}
        onClose={closeEditModal}
        title="Chỉnh sửa thông tin phụ huynh"
        maxWidth="600px"
        footer={(
          <div className="modal-buttons">
            <button className="btn-secondary" onClick={closeEditModal} disabled={isSaving}>
              Hủy
            </button>
            <button className="btn-primary" type="submit" form="parent-edit-form" disabled={isSaving}>
              <CheckCircle2 size={16} /> {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        )}
      >
        {editingParent && editForm && (
          <form id="parent-edit-form" className="modal-form-grid" onSubmit={handleEditSubmit}>
            <div className="form-group col-full">
              <label>Mã phụ huynh</label>
              <input value={editingParent.phuHuynh.maPhuHuynh} readOnly />
            </div>
            <div className="form-group col-2">
              <label>Họ tên đệm *</label>
              <input
                value={editForm.hoTenDemPH}
                onChange={(event) => updateEditForm('hoTenDemPH', event.target.value)}
                maxLength={255}
                required
              />
            </div>
            <div className="form-group col-2">
              <label>Tên phụ huynh *</label>
              <input
                value={editForm.tenPH}
                onChange={(event) => updateEditForm('tenPH', event.target.value)}
                maxLength={100}
                required
              />
            </div>
            <div className="form-group">
              <label>Số điện thoại *</label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                value={editForm.soDienThoai}
                onChange={(event) => updateEditForm('soDienThoai', event.target.value)}
                required
                aria-describedby={editError ? 'parent-edit-error' : undefined}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                maxLength={100}
                value={editForm.email}
                onChange={(event) => updateEditForm('email', event.target.value)}
                aria-describedby={editError ? 'parent-edit-error' : undefined}
              />
            </div>
            <div className="form-group col-full">
              <label>Địa chỉ liên hệ *</label>
              <input
                value={editForm.diaChiLH}
                onChange={(event) => updateEditForm('diaChiLH', event.target.value)}
                maxLength={255}
                required
              />
            </div>
            {editError && <p id="parent-edit-error" className="login-error col-full" role="alert">{editError}</p>}
          </form>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(parentDetails)}
        onClose={() => setParentDetails(null)}
        title="Chi tiết hồ sơ phụ huynh"
        maxWidth="650px"
        footer={(
          <div className="modal-buttons">
            {parentDetails && (
              <button
                className="btn-secondary"
                onClick={() => {
                  const parentId = parentDetails.phuHuynh.maPhuHuynh;
                  setParentDetails(null);
                  handleOpenEdit(parentId);
                }}
              >
                <Pencil size={15} /> Chỉnh sửa thông tin
              </button>
            )}
            <button className="btn-primary" onClick={() => setParentDetails(null)}>Đóng</button>
          </div>
        )}
      >
        {parentDetails && (
          <div className="modal-form-grid">
            <div className="form-group"><label>Mã phụ huynh</label><input value={parentDetails.phuHuynh.maPhuHuynh} readOnly /></div>
            <div className="form-group"><label>Họ tên đệm</label><input value={parentDetails.phuHuynh.hoTenDemPH || ''} readOnly /></div>
            <div className="form-group"><label>Tên phụ huynh</label><input value={parentDetails.phuHuynh.tenPH || ''} readOnly /></div>
            <div className="form-group"><label>Số điện thoại</label><input value={parentDetails.phuHuynh.soDienThoai || ''} readOnly /></div>
            <div className="form-group"><label>Email</label><input value={parentDetails.phuHuynh.email || 'Chưa cập nhật'} readOnly /></div>
            <div className="form-group col-full"><label>Địa chỉ liên hệ</label><input value={parentDetails.phuHuynh.diaChiLH || ''} readOnly /></div>
            <div className="form-group"><label>Tên đăng nhập</label><input value={parentDetails.taiKhoan?.tenDangNhap || 'Chưa cấp tài khoản'} readOnly /></div>
            <div className="form-group"><label>Trạng thái tài khoản</label><input value={getAccountStatus(parentDetails.taiKhoan)} readOnly /></div>
            <div className="form-group col-full">
              <label>Trẻ em đã liên kết</label>
              {parentDetails.treEm?.length ? (
                <div className="parent-linked-children">
                  {parentDetails.treEm.map((child) => (
                    <div className="parent-linked-child" key={child.maTre}>
                      <div>
                        <strong>{getChildName(child)}</strong>
                        <span>{child.quanHe || 'Chưa rõ quan hệ'} · Mã trẻ {child.maTre}</span>
                      </div>
                      {canManageLinks && <div className="parent-link-actions">
                        <select
                          aria-label={`Chọn trẻ thay cho ${getChildName(child)}`}
                          value={replacementByChild[child.maTre] || ''}
                          disabled={isLinkSaving}
                          onChange={(event) => setReplacementByChild((current) => ({
                            ...current,
                            [child.maTre]: event.target.value,
                          }))}
                        >
                          <option value="">Chọn trẻ để đổi liên kết</option>
                          {children
                            .filter((option) => (
                              option.maTre !== child.maTre
                              && !parentDetails.treEm.some((linked) => linked.maTre === option.maTre)
                            ))
                            .map((option) => (
                              <option key={option.maTre} value={option.maTre}>
                                {getChildName(option)}
                              </option>
                            ))}
                        </select>
                        <button
                          type="button"
                          className="btn-secondary"
                          disabled={isLinkSaving || !replacementByChild[child.maTre]}
                          onClick={() => replaceLinkedChild(child)}
                        >
                          Đổi trẻ
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          disabled={isLinkSaving}
                          onClick={() => removeParentChildLink(child)}
                        >
                          Hủy liên kết
                        </button>
                      </div>}
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted">Chưa có trẻ em được liên kết.</p>}
            </div>
            {canManageLinks && <form className="form-group col-full" onSubmit={createParentChildLink}>
              <label>Liên kết thêm trẻ</label>
              <div className="parent-link-actions">
                <select
                  value={linkForm.maTre}
                  disabled={isLinkSaving}
                  onChange={(event) => setLinkForm((current) => ({ ...current, maTre: event.target.value }))}
                  required
                >
                  <option value="">Chọn trẻ chưa liên kết</option>
                  {children
                    .filter((option) => !parentDetails.treEm?.some((linked) => linked.maTre === option.maTre))
                    .map((option) => (
                      <option key={option.maTre} value={option.maTre}>{getChildName(option)}</option>
                    ))}
                </select>
                <select
                  value={linkForm.quanHe}
                  disabled={isLinkSaving}
                  onChange={(event) => setLinkForm((current) => ({ ...current, quanHe: event.target.value }))}
                  aria-label="Mối quan hệ với trẻ"
                >
                  <option value="Bố">Bố</option>
                  <option value="Mẹ">Mẹ</option>
                  <option value="Ông">Ông</option>
                  <option value="Bà">Bà</option>
                  <option value="Người giám hộ">Người giám hộ</option>
                </select>
                <button type="submit" className="btn-primary" disabled={isLinkSaving || !linkForm.maTre}>
                  {isLinkSaving ? 'Đang lưu...' : 'Liên kết trẻ'}
                </button>
              </div>
            </form>}
            {canManageLinks && linkError && <p className="login-error col-full" role="alert">{linkError}</p>}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(oneTimeCredentials)}
        onClose={closeCredentials}
        title="Thông tin bàn giao tài khoản"
        maxWidth="540px"
        footer={(
          <div className="modal-buttons">
            {oneTimeCredentials && (
              <button
                className="btn-secondary"
                onClick={() => copyCredential(
                  `Phụ huynh: ${oneTimeCredentials.parentName}\nTên đăng nhập: ${oneTimeCredentials.username}\nMật khẩu tạm thời: ${oneTimeCredentials.password}`,
                  'thông tin bàn giao',
                )}
              >
                <Copy size={15} /> Sao chép thông tin bàn giao
              </button>
            )}
            <button className="btn-primary" onClick={closeCredentials}>Đóng</button>
          </div>
        )}
      >
        {oneTimeCredentials && (
          <div className="modal-form-grid">
            <p className="col-full"><strong>Phụ huynh:</strong> {oneTimeCredentials.parentName}</p>
            <div className="form-group col-full">
              <label>Tên đăng nhập</label>
              <div className="credential-copy-row">
                <input value={oneTimeCredentials.username} readOnly />
                <button
                  className="btn-secondary"
                  onClick={() => copyCredential(oneTimeCredentials.username, 'tên đăng nhập')}
                >
                  Sao chép tên đăng nhập
                </button>
              </div>
            </div>
            <div className="form-group col-full">
              <label>Mật khẩu tạm thời</label>
              <div className="credential-copy-row">
                <input value={oneTimeCredentials.password} readOnly />
                <button
                  className="btn-secondary"
                  onClick={() => copyCredential(oneTimeCredentials.password, 'mật khẩu tạm thời')}
                >
                  Sao chép mật khẩu
                </button>
              </div>
            </div>
            <p className="col-full" role="alert">
              Mật khẩu tạm thời chỉ hiển thị một lần. Vui lòng bàn giao an toàn cho phụ huynh.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
