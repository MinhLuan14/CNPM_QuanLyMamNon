import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Baby,
  CheckCircle2,
  Edit,
  Eye,
  Filter,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { authRequest, fetchCsrfToken, responseError } from '../../api/auth';
import Modal from '../../components/Modal';

const STATUS_OPTIONS = ['Đang học', 'Tạm nghỉ', 'Đã nghỉ'];
const EMPTY_FORM = {
  hoTenDemTre: '',
  tenTre: '',
  ngayThangNamSinh: '',
  noiSinh: '',
  maLopHoc: '',
  trangThaiHocTap: 'Đang học',
};

async function readResponse(response, fallback) {
  if (!response.ok) {
    throw new Error(await responseError(response, fallback));
  }
  return response.status === 204 ? null : response.json();
}

function getFullName(child) {
  return [child.hoTenDemTre, child.tenTre].filter(Boolean).join(' ');
}

function formatDate(date) {
  if (!date) return 'Chưa có thông tin';
  const parsedDate = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? date : parsedDate.toLocaleDateString('vi-VN');
}

export default function ChildrenManagement({ onShowToast }) {
  const [childrenList, setChildrenList] = useState([]);
  const [classes, setClasses] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingChildId, setEditingChildId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyChildId, setBusyChildId] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [failedRequest, setFailedRequest] = useState(null);

  const requestApi = useCallback(async (path, options) => {
    const method = options?.method || 'GET';
    const response = await authRequest(path, options);
    if (!response.ok) {
      setFailedRequest({ method, path, status: response.status, statusText: response.statusText });
    }
    return response;
  }, []);

  const loadData = useCallback(async (keyword = '') => {
    setIsLoading(true);
    setLoadError('');
    setFailedRequest(null);
    try {
      const childPath = keyword
        ? `/api/tre-em/tim-kiem?keyword=${encodeURIComponent(keyword)}`
        : '/api/tre-em';
      const [childrenResponse, classesResponse, statisticsResponse] = await Promise.all([
        requestApi(childPath),
        requestApi('/api/lop-hoc'),
        requestApi('/api/tre-em/thong-ke'),
      ]);
      const [childData, classData, statisticsData] = await Promise.all([
        readResponse(childrenResponse, 'Không thể tải danh sách trẻ.'),
        readResponse(classesResponse, 'Không thể tải danh sách lớp học.'),
        readResponse(statisticsResponse, 'Không thể tải thống kê trẻ.'),
      ]);
      setChildrenList(childData);
      setClasses(classData);
      setStatistics(statisticsData);
    } catch (error) {
      setLoadError(error.message || 'Không thể tải dữ liệu quản lý trẻ.');
    } finally {
      setIsLoading(false);
    }
  }, [requestApi]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => loadData(searchQuery.trim()), searchQuery ? 250 : 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadData, searchQuery]);

  const filteredChildren = useMemo(() => childrenList.filter((child) => {
    const matchesClass = selectedClass === 'ALL'
      || (selectedClass === 'UNASSIGNED' && child.maLopHoc == null)
      || String(child.maLopHoc) === selectedClass;
    const matchesStatus = selectedStatus === 'ALL' || child.trangThaiHocTap === selectedStatus;
    return matchesClass && matchesStatus;
  }), [childrenList, selectedClass, selectedStatus]);

  const showToast = (type, title, message) => {
    onShowToast?.({ type, title, message });
  };

  const openAddModal = () => {
    setEditingChildId(null);
    setFormData(EMPTY_FORM);
    setIsFormModalOpen(true);
  };

  const openEditModal = (child) => {
    setEditingChildId(child.maTre);
    setFormData({
      hoTenDemTre: child.hoTenDemTre || '',
      tenTre: child.tenTre || '',
      ngayThangNamSinh: child.ngayThangNamSinh || '',
      noiSinh: child.noiSinh || '',
      maLopHoc: child.maLopHoc ? String(child.maLopHoc) : '',
      trangThaiHocTap: child.trangThaiHocTap || 'Đang học',
    });
    setIsFormModalOpen(true);
  };

  const handleSaveSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const csrfToken = await fetchCsrfToken();
      const path = editingChildId ? `/api/tre-em/${editingChildId}` : '/api/tre-em';
      const response = await requestApi(path, {
        method: editingChildId ? 'PUT' : 'POST',
        headers: { 'X-XSRF-TOKEN': csrfToken },
        body: JSON.stringify({
          hoTenDemTre: formData.hoTenDemTre.trim(),
          tenTre: formData.tenTre.trim(),
          ngayThangNamSinh: formData.ngayThangNamSinh,
          noiSinh: formData.noiSinh.trim(),
          maLopHoc: formData.maLopHoc ? Number(formData.maLopHoc) : null,
          trangThaiHocTap: formData.trangThaiHocTap,
        }),
      });
      const savedChild = await readResponse(
        response,
        editingChildId ? 'Không thể cập nhật hồ sơ trẻ.' : 'Không thể thêm hồ sơ trẻ.',
      );
      setIsFormModalOpen(false);
      await loadData(searchQuery.trim());
      showToast(
        'success',
        'Thành công',
        `${editingChildId ? 'Đã cập nhật' : 'Đã thêm'} hồ sơ ${getFullName(savedChild)}.`,
      );
    } catch (error) {
      showToast('error', 'Không thể lưu hồ sơ trẻ', error.message || 'Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteChild = async (child) => {
    const fullName = getFullName(child);
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ trẻ "${fullName}"?`)) return;

    setBusyChildId(child.maTre);
    try {
      const csrfToken = await fetchCsrfToken();
      const response = await requestApi(`/api/tre-em/${child.maTre}`, {
        method: 'DELETE',
        headers: { 'X-XSRF-TOKEN': csrfToken },
      });
      await readResponse(response, 'Không thể xóa hồ sơ trẻ.');
      await loadData(searchQuery.trim());
      showToast('success', 'Đã xóa', `Đã xóa hồ sơ trẻ ${fullName}.`);
    } catch (error) {
      showToast('error', 'Không thể xóa hồ sơ trẻ', error.message || 'Vui lòng thử lại.');
    } finally {
      setBusyChildId(null);
    }
  };

  const handleViewDetail = async (child) => {
    setSelectedChild(child);
    setIsDetailModalOpen(true);
    try {
      const response = await requestApi(`/api/tre-em/${child.maTre}`);
      const detail = await readResponse(response, 'Không thể tải chi tiết hồ sơ trẻ.');
      setSelectedChild(detail);
    } catch (error) {
      showToast('error', 'Không thể tải hồ sơ', error.message || 'Vui lòng thử lại.');
    }
  };

  const statusCount = (status) => statistics?.theoTrangThai?.[status] ?? 0;

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <div className="page-badge"><Baby size={14} /> QUẢN LÝ THÔNG TIN TRẺ EM</div>
          <h2>Hồ Sơ Trẻ Em</h2>
          <p>Quản lý hồ sơ, lớp học và trạng thái học tập của trẻ.</p>
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Thêm hồ sơ trẻ
        </button>
      </div>

      {failedRequest && (
        <div className="empty-state-hint" role="alert">
          API thất bại: <strong>{failedRequest.method} {failedRequest.path}</strong>
          {' — '}
          <strong>{failedRequest.status} {failedRequest.statusText}</strong>
        </div>
      )}

      <div className="mini-stats-row">
        <div className="mini-stat-card">
          <span className="dot-indicator bg-blue" />
          <div><span className="mini-label">Tổng số trẻ</span><strong>{statistics?.tongSoTre ?? 0} trẻ</strong></div>
        </div>
        {STATUS_OPTIONS.map((status) => (
          <div className="mini-stat-card" key={status}>
            <span className={`dot-indicator ${status === 'Đang học' ? 'bg-green' : status === 'Tạm nghỉ' ? 'bg-orange' : 'bg-pink'}`} />
            <div><span className="mini-label">{status}</span><strong>{statusCount(status)} trẻ</strong></div>
          </div>
        ))}
      </div>

      {statistics && (
        <div className="panel-hint">
          <Users size={16} className="text-blue" />
          <span>
            Thống kê theo độ tuổi: {Object.entries(statistics.theoDoTuoi || {})
              .map(([age, count]) => `${age}: ${count}`)
              .join(' • ')}
          </span>
        </div>
      )}

      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="search"
            placeholder="Tìm theo họ tên hoặc mã trẻ..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
        <div className="filter-selects">
          <div className="select-group">
            <Filter size={15} />
            <select value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)}>
              <option value="ALL">Tất cả lớp</option>
              <option value="UNASSIGNED">Chưa phân lớp</option>
              {classes.map((classItem) => (
                <option key={classItem.maLopHoc} value={String(classItem.maLopHoc)}>
                  {classItem.tenLopHoc}
                </option>
              ))}
            </select>
          </div>
          <div className="select-group">
            <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
              <option value="ALL">Tất cả trạng thái</option>
              {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
          <div className="layout-switch">
            <button
              className={`icon-toggle ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Xem dạng thẻ"
              aria-label="Xem dạng thẻ"
            >
              ▦
            </button>
            <button
              className={`icon-toggle ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Xem dạng bảng"
              aria-label="Xem dạng bảng"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="empty-state-hint" role="alert">
          <AlertCircle size={24} />
          <p>{loadError}</p>
          <button className="btn-secondary" onClick={() => loadData(searchQuery.trim())}>Thử tải lại</button>
        </div>
      )}
      {isLoading ? (
        <div className="empty-state-hint" role="status">Đang tải hồ sơ trẻ...</div>
      ) : !loadError && filteredChildren.length === 0 ? (
        <div className="empty-state-hint">
          <Baby size={28} />
          <p>{childrenList.length === 0 ? 'Chưa có hồ sơ trẻ phù hợp.' : 'Không có trẻ nào khớp bộ lọc.'}</p>
        </div>
      ) : !loadError && viewMode === 'grid' ? (
        <div className="cards-grid">
          {filteredChildren.map((child) => (
            <article key={child.maTre} className="child-card card-lift">
              <div className="child-card-header">
                <div className="child-avatar"><Baby size={23} /></div>
                <div className="child-basic">
                  <div className="child-name-row"><h4>{getFullName(child)}</h4></div>
                  <span className="child-code">Mã trẻ: {child.maTre}</span>
                </div>
                <span className={`status-pill ${child.trangThaiHocTap === 'Đang học' ? 'pill-green' : 'pill-yellow'}`}>
                  {child.trangThaiHocTap}
                </span>
              </div>

              <div className="child-card-body">
                <div className="info-line"><span className="label">Ngày sinh</span><strong>{formatDate(child.ngayThangNamSinh)}</strong></div>
                <div className="info-line"><span className="label">Nơi sinh</span><strong>{child.noiSinh}</strong></div>
                <div className="info-line"><span className="label">Lớp học</span><strong className="text-blue">{child.tenLopHoc || 'Chưa phân lớp'}</strong></div>
              </div>

              <div className="child-card-footer">
                <button className="btn-action-icon view" onClick={() => handleViewDetail(child)}>
                  <Eye size={16} /> Chi tiết
                </button>
                <button className="btn-action-icon edit" onClick={() => openEditModal(child)}>
                  <Edit size={16} /> Sửa
                </button>
                <button
                  className="btn-action-icon delete"
                  disabled={busyChildId === child.maTre}
                  onClick={() => handleDeleteChild(child)}
                  aria-label={`Xóa hồ sơ ${getFullName(child)}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : !loadError ? (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Mã trẻ</th>
                <th>Họ và tên</th>
                <th>Ngày sinh</th>
                <th>Nơi sinh</th>
                <th>Lớp học</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredChildren.map((child) => (
                <tr key={child.maTre}>
                  <td><strong>{child.maTre}</strong></td>
                  <td>{getFullName(child)}</td>
                  <td>{formatDate(child.ngayThangNamSinh)}</td>
                  <td>{child.noiSinh}</td>
                  <td>{child.tenLopHoc || 'Chưa phân lớp'}</td>
                  <td><span className={`status-pill ${child.trangThaiHocTap === 'Đang học' ? 'pill-green' : 'pill-yellow'}`}>{child.trangThaiHocTap}</span></td>
                  <td>
                    <div className="action-buttons-cell">
                      <button className="btn-tbl view" onClick={() => handleViewDetail(child)} title="Chi tiết">
                        <Eye size={15} />
                      </button>
                      <button className="btn-tbl" onClick={() => openEditModal(child)} title="Sửa">
                        <Edit size={15} />
                      </button>
                      <button
                        className="btn-tbl delete"
                        disabled={busyChildId === child.maTre}
                        onClick={() => handleDeleteChild(child)}
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
      ) : null}

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingChildId ? 'Cập nhật hồ sơ trẻ' : 'Thêm hồ sơ trẻ mới'}
        maxWidth="600px"
        footer={
          <div className="modal-buttons">
            <button className="btn-secondary" onClick={() => setIsFormModalOpen(false)} disabled={isSaving}>Hủy</button>
            <button className="btn-primary" onClick={handleSaveSubmit} disabled={isSaving}>
              <CheckCircle2 size={16} /> {isSaving ? 'Đang lưu...' : 'Lưu hồ sơ'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveSubmit} className="modal-form-grid">
          <div className="form-group">
            <label htmlFor="child-middle-name">Họ và tên đệm *</label>
            <input
              id="child-middle-name"
              maxLength={255}
              value={formData.hoTenDemTre}
              onChange={(event) => setFormData({ ...formData, hoTenDemTre: event.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="child-name">Tên trẻ *</label>
            <input
              id="child-name"
              maxLength={100}
              value={formData.tenTre}
              onChange={(event) => setFormData({ ...formData, tenTre: event.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="child-dob">Ngày sinh *</label>
            <input
              id="child-dob"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              value={formData.ngayThangNamSinh}
              onChange={(event) => setFormData({ ...formData, ngayThangNamSinh: event.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="child-birthplace">Nơi sinh *</label>
            <input
              id="child-birthplace"
              maxLength={100}
              value={formData.noiSinh}
              onChange={(event) => setFormData({ ...formData, noiSinh: event.target.value })}
              required
            />
          </div>
          <div className="form-group col-2">
            <label htmlFor="child-class">Lớp học</label>
            <select
              id="child-class"
              value={formData.maLopHoc}
              onChange={(event) => setFormData({ ...formData, maLopHoc: event.target.value })}
            >
              <option value="">Chưa phân lớp</option>
              {classes.map((classItem) => (
                <option key={classItem.maLopHoc} value={String(classItem.maLopHoc)}>
                  {classItem.tenLopHoc} — {classItem.doTuoi}
                </option>
              ))}
            </select>
          </div>
          {editingChildId && (
            <div className="form-group col-2">
              <label htmlFor="child-status">Trạng thái học tập</label>
              <select
                id="child-status"
                value={formData.trangThaiHocTap}
                onChange={(event) => setFormData({ ...formData, trangThaiHocTap: event.target.value })}
              >
                {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
          )}
        </form>
      </Modal>

      {selectedChild && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Hồ sơ trẻ: ${getFullName(selectedChild)}`}
          maxWidth="600px"
          footer={
            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setIsDetailModalOpen(false)}>Đóng</button>
              <button className="btn-primary" onClick={() => {
                setIsDetailModalOpen(false);
                openEditModal(selectedChild);
              }}>
                <Edit size={16} /> Cập nhật hồ sơ
              </button>
            </div>
          }
        >
          <div className="detail-sections">
            <div className="detail-card">
              <h4><Baby size={16} /> Thông tin trẻ</h4>
              <div className="detail-grid">
                <div><span>Mã trẻ:</span> <strong>{selectedChild.maTre}</strong></div>
                <div><span>Họ và tên:</span> <strong>{getFullName(selectedChild)}</strong></div>
                <div><span>Ngày sinh:</span> <strong>{formatDate(selectedChild.ngayThangNamSinh)}</strong></div>
                <div><span>Nơi sinh:</span> <strong>{selectedChild.noiSinh}</strong></div>
                <div>
                  <span>Lớp:</span>
                  <strong>{selectedChild.tenLopHoc || 'Chưa phân lớp'}</strong>
                </div>
                <div><span>Trạng thái:</span> <strong>{selectedChild.trangThaiHocTap}</strong></div>
              </div>
            </div>
            {selectedChild.tenLopHoc && (
              <div className="detail-card">
                <h4><MapPin size={16} /> Thông tin lớp học</h4>
                <p>{selectedChild.tenLopHoc}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
