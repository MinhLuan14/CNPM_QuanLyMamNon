import { useCallback, useEffect, useState } from 'react';
import {
  School,
  Plus,
  Users,
  Baby,
  CheckCircle2,
  Trash2,
  Eye,
  MapPin,
  Edit,
  ChevronRight,
} from 'lucide-react';
import { authRequest, fetchCsrfToken, responseError } from '../../api/auth';
import Modal from '../../components/Modal';

const AGE_GROUPS = ['18 - 36 tháng', '3 - 4 tuổi', '4 - 5 tuổi', '5 - 6 tuổi'];

const AGE_GROUP_DETAILS = {
  '18 - 36 tháng': { grade: 'Nhà trẻ', color: '#ff7875' },
  '3 - 4 tuổi': { grade: 'Mầm', color: '#ffc069' },
  '4 - 5 tuổi': { grade: 'Chồi', color: '#5cdbd3' },
  '5 - 6 tuổi': { grade: 'Lá', color: '#85a5ff' },
};

const EMPTY_FORM = {
  tenLopHoc: '',
  phongHoc: '',
  soLuongToiDa: 25,
  doTuoi: '3 - 4 tuổi',
};

async function readResponse(response, fallback) {
  if (!response.ok) {
    throw new Error(await responseError(response, fallback));
  }
  return response.status === 204 ? null : response.json();
}

function getGrade(ageGroup) {
  return AGE_GROUP_DETAILS[ageGroup]?.grade || 'Khác';
}

function formatDate(date) {
  if (!date) return 'Chưa có thông tin';
  const parsedDate = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsedDate.getTime())
    ? date
    : parsedDate.toLocaleDateString('vi-VN');
}

export default function ClassesManagement({ onShowToast }) {
  const [classes, setClasses] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isClassDetailOpen, setIsClassDetailOpen] = useState(false);
  const [selectedClassData, setSelectedClassData] = useState(null);
  const [childrenInClass, setChildrenInClass] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingClassId, setEditingClassId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyClassId, setBusyClassId] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [failedRequest, setFailedRequest] = useState(null);
  const [capacityError, setCapacityError] = useState('');
  const requestApi = useCallback(async (path, options) => {
    const method = options?.method || 'GET';
    const response = await authRequest(path, options);
    if (!response.ok) {
      setFailedRequest({
        method,
        path,
        status: response.status,
        statusText: response.statusText,
      });
    } else {
      setFailedRequest(null);
    }
    return response;
  }, []);

  const loadClasses = useCallback(async () => {
    try {
      const response = await requestApi('/api/lop-hoc');
      const classList = await readResponse(response, 'Không thể tải danh sách lớp học.');
      const classesWithChildren = await Promise.all(
        classList.map(async (classItem) => {
          const childrenResponse = await requestApi(`/api/lop-hoc/${classItem.maLopHoc}/tre-em`);
          const children = await readResponse(childrenResponse, 'Không thể tải sĩ số lớp học.');
          return { ...classItem, current: children.length };
        }),
      );
      setLoadError('');
      setClasses(classesWithChildren);
    } catch (error) {
      setLoadError(error.message || 'Không thể tải danh sách lớp học.');
    } finally {
      setIsLoading(false);
    }
  }, [requestApi]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => loadClasses(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadClasses]);

  const filteredClasses = classes.filter((classItem) => (
    selectedGrade === 'ALL' || getGrade(classItem.doTuoi) === selectedGrade
  ));

  const showToast = (type, title, message) => {
    onShowToast?.({ type, title, message });
  };

  const handleReloadClasses = () => {
    setIsLoading(true);
    setLoadError('');
    loadClasses();
  };

  const openAddModal = () => {
    setEditingClassId(null);
    setFormData(EMPTY_FORM);
    setIsFormModalOpen(true);
  };

  const openEditModal = (classItem) => {
    setEditingClassId(classItem.maLopHoc);
    setFormData({
      tenLopHoc: classItem.tenLopHoc,
      phongHoc: String(classItem.phongHoc),
      soLuongToiDa: classItem.soLuongToiDa,
      doTuoi: classItem.doTuoi,
    });
    setIsFormModalOpen(true);
  };

  const handleSaveSubmit = async (event) => {
    event.preventDefault();
    const roomNumber = Number(formData.phongHoc);
    const capacity = Number(formData.soLuongToiDa);
    if (!formData.tenLopHoc.trim() || !Number.isInteger(roomNumber) || roomNumber <= 0
      || !Number.isInteger(capacity) || capacity < 1 || capacity > 50
      || !formData.doTuoi.trim()) {

      if (!Number.isInteger(capacity) || capacity < 1 || capacity > 50) {
        setCapacityError(
          !Number.isInteger(capacity) || formData.soLuongToiDa === ''
            ? 'Vui lòng nhập sĩ số là số nguyên từ 1 đến 50.'
            : capacity > 50
              ? 'Sĩ số tối đa không được vượt quá 50 trẻ.'
              : 'Sĩ số tối thiểu là 1 trẻ.'
        );
        document.getElementById('class-capacity')?.focus();
        return;
      }

      showToast(
        'error',
        'Dữ liệu chưa hợp lệ',
        'Vui lòng nhập tên lớp, phòng học và sĩ số tối đa hợp lệ.'
      );
      return;
    }

    setCapacityError('');

    setIsSaving(true);
    try {
      const csrfToken = await fetchCsrfToken();
      const response = await requestApi(
        editingClassId ? `/api/lop-hoc/${editingClassId}` : '/api/lop-hoc',
        {
          method: editingClassId ? 'PUT' : 'POST',
          headers: { 'X-XSRF-TOKEN': csrfToken },
          body: JSON.stringify({
            tenLopHoc: formData.tenLopHoc.trim(),
            phongHoc: roomNumber,
            soLuongToiDa: capacity,
            doTuoi: formData.doTuoi.trim(),
          }),
        },
      );
      const savedClass = await readResponse(
        response,
        editingClassId ? 'Không thể cập nhật lớp học.' : 'Không thể thêm lớp học.',
      );
      setIsFormModalOpen(false);
      await loadClasses();
      showToast(
        'success',
        'Thành công',
        editingClassId
          ? `Đã cập nhật lớp ${savedClass.tenLopHoc}.`
          : `Đã thêm lớp ${savedClass.tenLopHoc}.`,
      );
    } catch (error) {
      showToast('error', 'Không thể lưu lớp học', error.message || 'Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenClassDetail = async (classItem) => {
    setSelectedClassData(classItem);
    setChildrenInClass([]);
    setIsClassDetailOpen(true);
    try {
      const [classResponse, childrenResponse] = await Promise.all([
        requestApi(`/api/lop-hoc/${classItem.maLopHoc}`),
        requestApi(`/api/lop-hoc/${classItem.maLopHoc}/tre-em`),
      ]);
      const [details, children] = await Promise.all([
        readResponse(classResponse, 'Không thể tải thông tin lớp học.'),
        readResponse(childrenResponse, 'Không thể tải danh sách trẻ.'),
      ]);
      setSelectedClassData({ ...details, current: children.length });
      setChildrenInClass(children);
      setClasses((currentClasses) => currentClasses.map((item) => (
        item.maLopHoc === details.maLopHoc ? { ...item, current: children.length } : item
      )));
    } catch (error) {
      showToast('error', 'Không thể tải thông tin lớp', error.message || 'Vui lòng thử lại.');
    }
  };

  const handleDeleteClass = async (classItem) => {
    if (!window.confirm(`Bạn có chắc muốn xóa lớp ${classItem.tenLopHoc}?`)) return;

    setBusyClassId(classItem.maLopHoc);
    try {
      const csrfToken = await fetchCsrfToken();
      const response = await requestApi(`/api/lop-hoc/${classItem.maLopHoc}`, {
        method: 'DELETE',
        headers: { 'X-XSRF-TOKEN': csrfToken },
      });
      await readResponse(response, 'Không thể xóa lớp học.');
      setClasses((currentClasses) => currentClasses.filter(
        (item) => item.maLopHoc !== classItem.maLopHoc,
      ));
      showToast('success', 'Đã xóa', `Đã xóa lớp ${classItem.tenLopHoc}.`);
    } catch (error) {
      showToast('error', 'Không thể xóa lớp', error.message || 'Vui lòng thử lại.');
    } finally {
      setBusyClassId(null);
    }
  };

  return (
    <div className="page-container classes-management-page fade-in">
      <div className="page-header">
        <div>
          <div className="page-badge">
            <School size={14} /> QUẢN LÝ LỚP HỌC & SĨ SỐ
          </div>
          <h2>Hệ Thống Lớp Học Mầm Non</h2>
          <p>Quản lý lớp học, độ tuổi, phòng học và sĩ số trực tiếp từ hệ thống.</p>
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Mở thêm lớp học
        </button>
      </div>

      {failedRequest && (
        <div className="empty-state-hint" role="alert">
          API thất bại: <strong>{failedRequest.method} {failedRequest.path}</strong>
          {' — '}
          <strong>{failedRequest.status} {failedRequest.statusText}</strong>
        </div>
      )}

      <div className="grade-tabs">
        {[
          ['ALL', `Tất cả các khối (${classes.length} lớp)`],
          ['Nhà trẻ', 'Khối Nhà trẻ'],
          ['Mầm', 'Khối Mầm'],
          ['Chồi', 'Khối Chồi'],
          ['Lá', 'Khối Lá'],
        ].map(([grade, label]) => (
          <button
            key={grade}
            className={`grade-tab-btn ${selectedGrade === grade ? 'active' : ''}`}
            onClick={() => setSelectedGrade(grade)}
          >
            {label}{grade !== 'ALL' ? ` (${classes.filter((item) => getGrade(item.doTuoi) === grade).length})` : ''}
          </button>
        ))}
      </div>

      {loadError && (
        <div className="empty-state-hint" role="alert">
          <p>{loadError}</p>
          <button className="btn-secondary" onClick={handleReloadClasses}>Thử tải lại</button>
        </div>
      )}

      {isLoading ? (
        <div className="empty-state-hint" role="status">Đang tải danh sách lớp học...</div>
      ) : !loadError && filteredClasses.length === 0 ? (
        <div className="empty-state-hint">
          <School size={28} />
          <p>{classes.length === 0 ? 'Chưa có lớp học nào trong hệ thống.' : 'Không có lớp học thuộc khối này.'}</p>
        </div>
      ) : (
        <div className="classes-grid">
          {filteredClasses.map((classItem) => {
            const currentCount = Number.isFinite(classItem.current)
              ? Math.max(0, classItem.current)
              : 0;
            const capacity = Number.isFinite(classItem.soLuongToiDa)
              ? Math.max(0, classItem.soLuongToiDa)
              : 0;
            const fillPercentage = capacity > 0
              ? Math.min(100, Math.round((currentCount / capacity) * 100))
              : 0;
            const remainingSeats = Math.max(0, capacity - currentCount);
            const capacityStatus = capacity === 0
              ? 'capacity-unknown'
              : currentCount >= capacity
                ? 'capacity-full'
                : fillPercentage >= 80
                  ? 'capacity-near-full'
                  : 'capacity-available';
            const capacityLabel = capacity === 0
              ? 'Chưa thiết lập sức chứa'
              : currentCount >= capacity
                ? 'Lớp đã đầy'
                : fillPercentage >= 80
                  ? `Còn ${remainingSeats} chỗ`
                  : `Còn ${remainingSeats} chỗ trống`;

            return (
              <article key={classItem.maLopHoc} className={`class-card class-card-modern card-lift ${capacityStatus}`}>
                <header className="class-card-heading">
                  <div className="class-card-identity">
                    <div className="class-badge-group">
                      <span className="class-grade-badge">{getGrade(classItem.doTuoi)}</span>
                      <span className="class-age-badge">{classItem.doTuoi || 'Chưa có độ tuổi'}</span>
                    </div>
                    <h3 className="class-title" title={classItem.tenLopHoc}>
                      {classItem.tenLopHoc}
                    </h3>
                    <span className="class-school-year">Mã lớp: {classItem.maLopHoc}</span>
                  </div>
                  <span className="room-badge" title={`Phòng ${classItem.phongHoc}`}>
                    <MapPin size={15} aria-hidden="true" />
                    <span>Phòng {classItem.phongHoc}</span>
                  </span>
                </header>

                <div className="class-card-body class-card-body-modern">
                  <section className="class-capacity-panel" aria-label="Tình hình sĩ số">
                    <div className="class-capacity-overview">
                      <div>
                        <span className="class-section-label">Sĩ số hiện tại</span>
                        <p className="class-capacity-value">
                          <strong>{currentCount}</strong>
                          <span>/ {capacity || '—'} trẻ</span>
                        </p>
                      </div>
                      <span className={`capacity-status ${capacityStatus}`}>
                        {capacity === 0
                          ? 'Chưa có sức chứa'
                          : currentCount >= capacity
                            ? 'Đã đầy'
                            : 'Đang nhận trẻ'}
                      </span>
                    </div>
                    <div
                      className="progress-track class-progress-track"
                      role="progressbar"
                      aria-label="Tỷ lệ sử dụng sức chứa"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={fillPercentage}
                    >
                      <div
                        className="progress-fill class-progress-fill"
                        style={{ width: `${fillPercentage}%` }}
                      />
                    </div>
                    <div className="class-capacity-caption">
                      <span>{capacity > 0 ? `${fillPercentage}% sức chứa` : 'Chưa có dữ liệu sức chứa'}</span>
                      <span>{capacityLabel}</span>
                    </div>
                  </section>

                  <div className="class-quick-stats">
                    <div className="class-quick-stat class-quick-stat-current">
                      <span className="class-stat-icon" aria-hidden="true"><Baby size={19} /></span>
                      <div>
                        <strong>{currentCount}</strong>
                        <span>Trẻ đang theo học</span>
                      </div>
                    </div>
                    <div className="class-quick-stat class-quick-stat-capacity">
                      <span className="class-stat-icon" aria-hidden="true"><Users size={19} /></span>
                      <div>
                        <strong>{capacity || '—'}</strong>
                        <span>Sức chứa tối đa</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="class-card-footer">
                  <button
                    className="btn-class-action"
                    onClick={() => handleOpenClassDetail(classItem)}
                    aria-label={`Xem danh sách ${currentCount} trẻ của lớp ${classItem.tenLopHoc}`}
                  >
                    <Eye size={18} aria-hidden="true" />
                    <span>Xem danh sách trẻ</span>
                    <ChevronRight size={18} className="class-action-chevron" aria-hidden="true" />
                  </button>
                  <button
                    className="btn-tbl class-icon-action class-edit-action"
                    title="Sửa lớp"
                    aria-label={`Sửa lớp ${classItem.tenLopHoc}`}
                    onClick={() => openEditModal(classItem)}
                  >
                    <Edit size={18} aria-hidden="true" />
                  </button>
                  <button
                    className="btn-tbl delete class-icon-action class-delete-action"
                    title="Xóa lớp"
                    aria-label={`Xóa lớp ${classItem.tenLopHoc}`}
                    disabled={busyClassId === classItem.maLopHoc}
                    onClick={() => handleDeleteClass(classItem)}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingClassId ? 'Cập Nhật Lớp Học' : 'Mở Thêm Lớp Học Mầm Non Mới'}
        maxWidth="600px"
        footer={
          <div className="modal-buttons">
            <button className="btn-secondary" onClick={() => setIsFormModalOpen(false)} disabled={isSaving}>
              Hủy
            </button>
            <button className="btn-primary" onClick={handleSaveSubmit} disabled={isSaving}>
              <CheckCircle2 size={16} /> {isSaving ? 'Đang lưu...' : 'Lưu lớp học'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveSubmit} className="modal-form-grid">
          <div className="form-group col-2">
            <label htmlFor="class-name">Tên lớp học *</label>
            <input
              id="class-name"
              type="text"
              maxLength={50}
              placeholder="VD: Mầm 3 (Ánh Dương)"
              value={formData.tenLopHoc}
              onChange={(event) => setFormData({ ...formData, tenLopHoc: event.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="class-age">Độ tuổi *</label>
            <select
              id="class-age"
              value={formData.doTuoi}
              onChange={(event) => setFormData({ ...formData, doTuoi: event.target.value })}
            >
              {AGE_GROUPS.map((ageGroup) => <option key={ageGroup} value={ageGroup}>{ageGroup}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="class-room">Phòng học (số phòng) *</label>
            <input
              id="class-room"
              type="number"
              min="1"
              step="1"
              value={formData.phongHoc}
              onChange={(event) => setFormData({ ...formData, phongHoc: event.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="class-capacity">
              Sĩ số tối đa <span>*</span>
            </label>

            <input
              id="class-capacity"
              type="number"
              min="1"
              max="50"
              step="1"
              value={formData.soLuongToiDa}
              onChange={(event) => {
                const value = event.target.value;

                setFormData((prev) => ({
                  ...prev,
                  soLuongToiDa: value,
                }));

                const number = Number(value);
                let error = '';

                if (value === '') {
                  error = 'Vui lòng nhập sĩ số tối đa.';
                } else if (!Number.isInteger(number)) {
                  error = 'Sĩ số phải là số nguyên.';
                } else if (number < 1) {
                  error = 'Sĩ số tối thiểu là 1 trẻ.';
                } else if (number > 50) {
                  error = 'Sĩ số tối đa không được vượt quá 50 trẻ.';
                }

                setCapacityError(error);
              }}
              onKeyDown={(event) => {
                if (['e', 'E', '+', '-', '.'].includes(event.key)) {
                  event.preventDefault();
                }
              }}
              style={{
                border: capacityError
                  ? '1px solid #ff4d4f'
                  : '1px solid #d9d9d9',
                outline: 'none',
                boxShadow: capacityError
                  ? '0 0 0 2px rgba(255, 77, 79, 0.12)'
                  : 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              aria-invalid={Boolean(capacityError)}
              aria-describedby="capacity-error"
              required
            />

            {capacityError && (
              <small
                id="capacity-error"
                role="alert"
                style={{
                  display: 'block',
                  marginTop: '5px',
                  color: '#ff4d4f',
                  fontSize: '12px',
                  lineHeight: 1.5,
                }}
              >
                <span style={{ marginRight: '4px' }}>⚠</span>
                {capacityError}
              </small>
            )}

            <small
              style={{
                display: 'block',
                marginTop: '5px',
                color: '#888',
                fontSize: '12px',
              }}
            >
              Sĩ số cho phép từ 1 đến 50 trẻ.
            </small>
          </div>
        </form>
      </Modal>

      {selectedClassData && (
        <Modal
          isOpen={isClassDetailOpen}
          onClose={() => setIsClassDetailOpen(false)}
          title={`Danh Sách Trẻ: ${selectedClassData.tenLopHoc}`}
          maxWidth="680px"
          footer={
            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setIsClassDetailOpen(false)}>Đóng</button>
            </div>
          }
        >
          <div>
            <div className="class-detail-meta">
              <span>Khối: <strong>{getGrade(selectedClassData.doTuoi)}</strong></span>
              <span>Độ tuổi: <strong>{selectedClassData.doTuoi}</strong></span>
              <span>Phòng: <strong>{selectedClassData.phongHoc}</strong></span>
              <span>Sĩ số: <strong>{childrenInClass.length}/{selectedClassData.soLuongToiDa}</strong></span>
            </div>
            <h4 style={{ margin: '16px 0 8px', fontSize: '14px' }}>
              Danh sách trẻ trong lớp ({childrenInClass.length}):
            </h4>
            {childrenInClass.length > 0 ? (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Mã trẻ</th>
                      <th>Họ và tên</th>
                      <th>Ngày sinh</th>
                      <th>Nơi sinh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {childrenInClass.map((child) => (
                      <tr key={child.maTre}>
                        <td><strong>{child.maTre}</strong></td>
                        <td>{`${child.hoTenDemTre} ${child.tenTre}`}</td>
                        <td>{formatDate(child.ngayThangNamSinh)}</td>
                        <td>{child.noiSinh}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state-hint">
                <Baby size={28} />
                <p>Hiện lớp học này chưa có trẻ nào được phân vào.</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
