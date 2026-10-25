import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle2,
  Edit,
  Eye,
  GraduationCap,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  School,
  Search,
  UserCheck,
} from 'lucide-react';
import Modal from '../../components/Modal';
import { authRequest, fetchCsrfToken, responseError } from '../../api/auth';
import { API_BASE_URL } from '../../config';

const ASSIGNMENT_ROLES = [
  'Giáo viên chủ nhiệm',
  'Giáo viên phó / phụ trách',
  'Giáo viên năng khiếu',
  'Tổ trưởng chuyên môn',
  'Giáo viên hỗ trợ',
];
const PAGE_SIZE = 8;
const TODAY = (() => {
  const localDate = new Date();
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().slice(0, 10);
})();

const EMPTY_FORM = {
  hoTen: '',
  ngaySinh: '',
  soDienThoai: '',
  email: '',
  diaChiLH: '',
  trinhDoChuyenMon: '',
  maLopHoc: '',
  vaiTro: ASSIGNMENT_ROLES[0],
};

async function readJson(response, fallback) {
  if (!response.ok) {
    throw new Error(await responseError(response, fallback));
  }
  return response.status === 204 ? null : response.json();
}

export default function TeachersManagement({ onShowToast }) {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [assignmentFilter, setAssignmentFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [classError, setClassError] = useState('');
  const [modalMode, setModalMode] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [operation, setOperation] = useState('');
  const [assignmentClassId, setAssignmentClassId] = useState('');
  const [assignmentRole, setAssignmentRole] = useState(ASSIGNMENT_ROLES[0]);
  const [assignmentRoleDrafts, setAssignmentRoleDrafts] = useState({});
  const [initialAssignment, setInitialAssignment] = useState(null);
  const [credentials, setCredentials] = useState(null);

  const showToast = (type, title, message) => {
    onShowToast?.({ type, title, message });
  };

  const loadTeachers = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const response = await authRequest('/api/giao-vien');
      const data = await readJson(response, 'Không thể tải danh sách giáo viên.');
      if (!Array.isArray(data)) {
        throw new Error('Dữ liệu danh sách giáo viên từ máy chủ không hợp lệ.');
      }
      setTeachers(data);
      return data;
    } catch (error) {
      setTeachers([]);
      setLoadError(error.message || 'Không thể kết nối tới máy chủ.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadClasses = useCallback(async () => {
    setClassError('');
    try {
      const response = await authRequest('/api/lop-hoc');
      const data = await readJson(response, 'Không thể tải danh sách lớp học.');
      if (!Array.isArray(data)) {
        throw new Error('Dữ liệu danh sách lớp học từ máy chủ không hợp lệ.');
      }
      setClasses(data);
    } catch (error) {
      setClasses([]);
      setClassError(error.message || 'Không thể tải danh sách lớp học.');
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadTeachers();
      loadClasses();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadClasses, loadTeachers]);

  useEffect(() => () => {
    if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const filteredTeachers = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('vi');
    return teachers.filter((teacher) => {
      const matchesSearch = [
        teacher.hoTen,
        teacher.soDienThoai,
        teacher.email,
      ].some((value) => (value || '').toLocaleLowerCase('vi').includes(query));
      const assignments = teacher.phanCong || [];
      const matchesClass = selectedClass === 'ALL'
        || assignments.some((assignment) => (
          assignment.maLopHoc === Number(selectedClass) && assignment.dangPhuTrach
        ));
      const matchesAssignment = assignmentFilter === 'ALL'
        || (assignmentFilter === 'ASSIGNED' ? teacher.dangPhanCong : !teacher.dangPhanCong);
      return matchesSearch && matchesClass && matchesAssignment;
    });
  }, [assignmentFilter, searchQuery, selectedClass, teachers]);

  const pageCount = Math.max(1, Math.ceil(filteredTeachers.length / PAGE_SIZE));
  const visiblePage = Math.min(currentPage, pageCount);
  const pageTeachers = filteredTeachers.slice((visiblePage - 1) * PAGE_SIZE, visiblePage * PAGE_SIZE);
  const assignedCount = teachers.filter((teacher) => teacher.dangPhanCong).length;

  const closeModal = () => {
    if (isSaving || operation) return;
    setModalMode(null);
    setSelectedTeacher(null);
    setFormError('');
    setFieldErrors({});
    setDetailsError('');
  };

  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setInitialAssignment(null);
    setDetailsError('');
    setImageFile(null);
    setImagePreview(`${API_BASE_URL}/images/default-teacher.svg`);
    setFormError('');
    setFieldErrors({});
    setSelectedTeacher(null);
    setModalMode('create');
  };

  const openEdit = async (teacher) => {
    setModalMode('edit');
    setSelectedTeacher(teacher);
    setIsLoadingDetails(true);
    setDetailsError('');
    setInitialAssignment(null);
    setFormError('');
    setFieldErrors({});
    setImageFile(null);
    setImagePreview(teacher.anhDaiDien
      ? `${API_BASE_URL}${teacher.anhDaiDien}`
      : `${API_BASE_URL}/images/default-teacher.svg`);
    try {
      const response = await authRequest(`/api/giao-vien/${teacher.maGiaoVien}`);
      const detail = await readJson(response, 'Không thể tải chi tiết giáo viên để chỉnh sửa.');
      const activeAssignment = (detail.phanCong || []).find((assignment) => assignment.dangPhuTrach) || null;
      setSelectedTeacher(detail);
      setInitialAssignment(activeAssignment
        ? {
          maLopHoc: activeAssignment.maLopHoc,
          vaiTro: activeAssignment.vaiTro || ASSIGNMENT_ROLES[0],
          tenLopHoc: activeAssignment.tenLopHoc,
        }
        : null);
      setForm({
        hoTen: detail.hoTen || '',
        ngaySinh: detail.ngaySinh || '',
        soDienThoai: detail.soDienThoai || '',
        email: detail.email || '',
        diaChiLH: detail.diaChiLH || '',
        trinhDoChuyenMon: detail.trinhDoChuyenMon || '',
        maLopHoc: activeAssignment ? String(activeAssignment.maLopHoc) : '',
        vaiTro: activeAssignment?.vaiTro || ASSIGNMENT_ROLES[0],
      });
    } catch (error) {
      setDetailsError(error.message || 'Không thể tải chi tiết giáo viên để chỉnh sửa.');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const openDetails = async (teacher) => {
    setSelectedTeacher(teacher);
    setDetailsError('');
    setIsLoadingDetails(true);
    setAssignmentClassId('');
    setAssignmentRole(ASSIGNMENT_ROLES[0]);
    setModalMode('view');
    try {
      const response = await authRequest(`/api/giao-vien/${teacher.maGiaoVien}`);
      const detail = await readJson(response, 'Không thể tải chi tiết giáo viên.');
      setSelectedTeacher(detail);
      setAssignmentRoleDrafts(Object.fromEntries(
        (detail.phanCong || []).map((assignment) => [assignment.maLopHoc, assignment.vaiTro || ASSIGNMENT_ROLES[0]]),
      ));
    } catch (error) {
      setDetailsError(error.message || 'Không thể tải chi tiết giáo viên.');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSaveTeacher = async (event) => {
    event.preventDefault();
    setFormError('');
    setFieldErrors({});
    setIsSaving(true);
    try {
      const csrfToken = await fetchCsrfToken();
      const payload = {
        hoTen: form.hoTen.trim(),
        ngaySinh: form.ngaySinh || null,
        soDienThoai: form.soDienThoai.trim(),
        email: form.email.trim(),
        diaChiLH: form.diaChiLH.trim(),
        trinhDoChuyenMon: form.trinhDoChuyenMon.trim() || null,
        maLopHoc: form.maLopHoc ? Number(form.maLopHoc) : null,
        vaiTro: form.maLopHoc ? form.vaiTro : null,
        maLopHocCu: modalMode === 'edit' ? initialAssignment?.maLopHoc ?? null : null,
      };
      const isEdit = modalMode === 'edit';
      const response = await authRequest(
        isEdit ? `/api/giao-vien/${selectedTeacher.maGiaoVien}` : '/api/giao-vien',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'X-XSRF-TOKEN': csrfToken },
          body: JSON.stringify(payload),
        },
      );
      const result = await readJson(response, 'Không thể lưu hồ sơ giáo viên.');
      const savedTeacher = isEdit ? result : result.giaoVien;
      let imageError = '';
      if (imageFile) {
        try {
          const imageFormData = new FormData();
          imageFormData.append('file', imageFile);
          const imageResponse = await authRequest(
            `/api/giao-vien/${savedTeacher.maGiaoVien}/anh-dai-dien`,
            {
              method: 'POST',
              headers: { 'X-XSRF-TOKEN': csrfToken },
              body: imageFormData,
            },
          );
          await readJson(imageResponse, 'Không thể tải ảnh đại diện giáo viên.');
        } catch (error) {
          imageError = error.message || 'Không thể tải ảnh đại diện giáo viên.';
        }
      }
      const updatedTeachers = await loadTeachers();
      setModalMode(null);
      setSelectedTeacher(null);
      setImageFile(null);
      if (isEdit) {
        showToast(imageError ? 'error' : 'success',
          imageError ? 'Hồ sơ đã lưu nhưng ảnh chưa cập nhật' : 'Đã cập nhật hồ sơ',
          imageError ? `Thông tin hồ sơ đã lưu; ${imageError}` : 'Thông tin giáo viên đã được lưu.');
      } else {
        setCredentials({
          tenDangNhap: result.tenDangNhap,
          matKhauTamThoi: result.matKhauTamThoi,
        });
        showToast(imageError ? 'error' : 'success',
          imageError ? 'Đã tạo hồ sơ nhưng ảnh chưa cập nhật' : 'Đã thêm giáo viên',
          imageError
            ? `Hồ sơ và tài khoản đã tạo; ${imageError}`
            : 'Hồ sơ và tài khoản giáo viên đã được tạo. Hãy lưu thông tin đăng nhập tạm thời đang hiển thị.');
      }
      if (!updatedTeachers) {
        showToast('error', 'Không tải được danh sách mới', 'Hồ sơ đã được lưu nhưng danh sách cần được tải lại.');
      }
    } catch (error) {
      const message = error.message || 'Không thể lưu hồ sơ giáo viên. Vui lòng thử lại.';
      if (message.includes('Số điện thoại')) {
        setFieldErrors({ soDienThoai: message });
      } else if (message.includes('ngày sinh')) {
        setFieldErrors({ ngaySinh: message });
      } else if (message.includes('email')) {
        setFieldErrors({ email: message });
      } else if (message.includes('địa chỉ')) {
        setFieldErrors({ diaChiLH: message });
      } else {
        setFormError(message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const runAssignmentAction = async (endpoint, method, body, successMessage, operationKey) => {
    setOperation(operationKey);
    try {
      const csrfToken = await fetchCsrfToken();
      const response = await authRequest(endpoint, {
        method,
        headers: { 'X-XSRF-TOKEN': csrfToken },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const updatedTeacher = await readJson(response, 'Không thể cập nhật phân công.');
      setSelectedTeacher(updatedTeacher);
      setAssignmentRoleDrafts(Object.fromEntries(
        (updatedTeacher.phanCong || []).map((assignment) => [assignment.maLopHoc, assignment.vaiTro || ASSIGNMENT_ROLES[0]]),
      ));
      await loadTeachers();
      showToast('success', 'Đã cập nhật phân công', successMessage);
    } catch (error) {
      showToast('error', 'Không thể cập nhật phân công', error.message || 'Vui lòng thử lại.');
    } finally {
      setOperation('');
    }
  };

  const addAssignment = () => {
    if (!assignmentClassId) {
      showToast('error', 'Chưa chọn lớp', 'Vui lòng chọn lớp học cần phân công.');
      return;
    }
    runAssignmentAction(
      `/api/giao-vien/${selectedTeacher.maGiaoVien}/phan-cong`,
      'POST',
      { maLopHoc: Number(assignmentClassId), vaiTro: assignmentRole },
      'Lớp đã được thêm vào phân công giáo viên.',
      'add-assignment',
    );
  };

  const updateAssignmentRole = (assignment) => {
    const vaiTro = assignmentRoleDrafts[assignment.maLopHoc];
    if (!vaiTro || vaiTro === assignment.vaiTro) return;
    runAssignmentAction(
      `/api/giao-vien/${selectedTeacher.maGiaoVien}/phan-cong/${assignment.maLopHoc}`,
      'PUT',
      { maLopHoc: assignment.maLopHoc, vaiTro },
      'Vai trò phân công đã được cập nhật.',
      `role-${assignment.maLopHoc}`,
    );
  };

  const endAssignment = (assignment) => {
    if (!window.confirm(`Kết thúc phân công lớp "${assignment.tenLopHoc}"? Lịch sử phân công sẽ được giữ lại.`)) {
      return;
    }
    runAssignmentAction(
      `/api/giao-vien/${selectedTeacher.maGiaoVien}/phan-cong/${assignment.maLopHoc}/ket-thuc`,
      'PATCH',
      null,
      'Phân công đã kết thúc và được lưu lịch sử.',
      `end-${assignment.maLopHoc}`,
    );
  };

  const teacherForm = (
    <form id="teacher-form" onSubmit={handleSaveTeacher} className="modal-form-grid">
      {formError && <div className="empty-state-hint col-2" role="alert"><AlertCircle size={16} /> {formError}</div>}
      <div className="form-group col-2">
        <label htmlFor="teacher-avatar">Ảnh đại diện</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img
            src={imagePreview || `${API_BASE_URL}/images/default-teacher.svg`}
            alt="Xem trước ảnh đại diện giáo viên"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = `${API_BASE_URL}/images/default-teacher.svg`;
            }}
            style={{ width: '88px', height: '88px', objectFit: 'cover', borderRadius: '50%' }}
          />
          <input
            id="teacher-avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              if (file && (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
                || file.size > 5 * 1024 * 1024)) {
                showToast('error', 'Ảnh không hợp lệ', 'Chỉ nhận JPEG, PNG hoặc WebP tối đa 5 MB.');
                event.target.value = '';
                return;
              }
              setImageFile(file);
              setImagePreview(file
                ? URL.createObjectURL(file)
                : selectedTeacher?.anhDaiDien
                  ? `${API_BASE_URL}${selectedTeacher.anhDaiDien}`
                  : `${API_BASE_URL}/images/default-teacher.svg`);
              event.target.value = '';
            }}
          />
        </div>
        <small>JPEG, PNG hoặc WebP; tối đa 5 MB. Ảnh được tải lên khi lưu hồ sơ.</small>
        {imageFile && <small>{imageFile.name} · {(imageFile.size / 1024 / 1024).toFixed(2)} MB</small>}
      </div>
      <div className="form-group col-2">
        <label htmlFor="teacher-name">Họ và tên giáo viên *</label>
        <input
          id="teacher-name"
          type="text"
          maxLength={356}
          placeholder="VD: Nguyễn Ngọc Lan"
          value={form.hoTen}
          onChange={(event) => setForm({ ...form, hoTen: event.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="teacher-dob">Ngày sinh</label>
        <input
          id="teacher-dob"
          type="date"
          max={TODAY}
          value={form.ngaySinh}
          aria-invalid={Boolean(fieldErrors.ngaySinh)}
          onChange={(event) => {
            setForm({ ...form, ngaySinh: event.target.value });
            setFieldErrors({ ...fieldErrors, ngaySinh: '' });
          }}
        />
        {fieldErrors.ngaySinh && <small className="text-red" role="alert">{fieldErrors.ngaySinh}</small>}
      </div>
      <div className="form-group">
        <label htmlFor="teacher-phone">Số điện thoại *</label>
        <input
          id="teacher-phone"
          type="tel"
          inputMode="numeric"
          pattern="[0-9]{10}"
          maxLength={10}
          placeholder="0909xxxxxx"
          value={form.soDienThoai}
          aria-invalid={Boolean(fieldErrors.soDienThoai)}
          onChange={(event) => {
            setForm({ ...form, soDienThoai: event.target.value });
            setFieldErrors({ ...fieldErrors, soDienThoai: '' });
          }}
          required
        />
        {fieldErrors.soDienThoai && <small className="text-red" role="alert">{fieldErrors.soDienThoai}</small>}
      </div>
      <div className="form-group col-2">
        <label htmlFor="teacher-email">Email liên hệ *</label>
        <input
          id="teacher-email"
          type="email"
          maxLength={100}
          placeholder="lan.nguyen@babyshark.edu.vn"
          value={form.email}
          aria-invalid={Boolean(fieldErrors.email)}
          onChange={(event) => {
            setForm({ ...form, email: event.target.value });
            setFieldErrors({ ...fieldErrors, email: '' });
          }}
          required
        />
        {fieldErrors.email && <small className="text-red" role="alert">{fieldErrors.email}</small>}
      </div>
      <div className="form-group col-2">
        <label htmlFor="teacher-address">Địa chỉ liên hệ *</label>
        <input
          id="teacher-address"
          type="text"
          maxLength={255}
          value={form.diaChiLH}
          aria-invalid={Boolean(fieldErrors.diaChiLH)}
          onChange={(event) => {
            setForm({ ...form, diaChiLH: event.target.value });
            setFieldErrors({ ...fieldErrors, diaChiLH: '' });
          }}
          required
        />
        {fieldErrors.diaChiLH && <small className="text-red" role="alert">{fieldErrors.diaChiLH}</small>}
      </div>
      <div className="form-group col-2">
        <label htmlFor="teacher-qualification">Trình độ & bằng cấp chuyên môn</label>
        <input
          id="teacher-qualification"
          type="text"
          maxLength={255}
          placeholder="VD: Cử nhân Sư phạm Mầm non"
          value={form.trinhDoChuyenMon}
          onChange={(event) => setForm({ ...form, trinhDoChuyenMon: event.target.value })}
        />
      </div>
      {(modalMode === 'create' || modalMode === 'edit') && (
        <>
          <div className="form-group">
            <label htmlFor="teacher-class">Lớp học phân công</label>
            <select
              id="teacher-class"
              value={form.maLopHoc}
              onChange={(event) => setForm({ ...form, maLopHoc: event.target.value })}
              disabled={Boolean(classError) || isLoadingDetails}
            >
              <option value="">Chưa phân công</option>
              {initialAssignment
                && !classes.some((classItem) => classItem.maLopHoc === initialAssignment.maLopHoc) && (
                  <option value={initialAssignment.maLopHoc}>{initialAssignment.tenLopHoc}</option>
              )}
              {classes.map((classItem) => (
                <option key={classItem.maLopHoc} value={classItem.maLopHoc}>
                  {classItem.tenLopHoc}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="teacher-role">Vai trò đảm nhiệm</label>
            <select
              id="teacher-role"
              value={form.vaiTro}
              onChange={(event) => setForm({ ...form, vaiTro: event.target.value })}
              disabled={!form.maLopHoc || isLoadingDetails}
            >
              {ASSIGNMENT_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>
          {classError && <div className="empty-state-hint col-2" role="alert">{classError}</div>}
        </>
      )}
    </form>
  );

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <div className="page-badge"><GraduationCap size={14} /> QUẢN LÝ ĐỘI NGŨ GIÁO VIÊN</div>
          <h2>Danh Sách Cán Bộ & Giáo Viên</h2>
          <p>Quản lý hồ sơ sư phạm và lịch sử phân công đứng lớp của giáo viên</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={18} /> Thêm giáo viên mới
        </button>
      </div>

      <div className="mini-stats-row">
        <div className="mini-stat-card">
          <span className="dot-indicator bg-purple" />
          <div><span className="mini-label">Tổng đội ngũ giáo viên</span><strong>{teachers.length} giáo viên</strong></div>
        </div>
        <div className="mini-stat-card">
          <span className="dot-indicator bg-blue" />
          <div><span className="mini-label">Đang có phân công</span><strong>{assignedCount} giáo viên</strong></div>
        </div>
        <div className="mini-stat-card">
          <span className="dot-indicator bg-green" />
          <div><span className="mini-label">Chưa phân công</span><strong>{teachers.length - assignedCount} giáo viên</strong></div>
        </div>
      </div>

      {loadError && (
        <div className="empty-state-hint" role="alert">
          <AlertCircle size={16} /> {loadError}
          <button className="btn-secondary" onClick={loadTeachers} disabled={isLoading}>
            <RefreshCw size={15} /> Tải lại
          </button>
        </div>
      )}

      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="search"
            placeholder="Tìm theo tên giáo viên, số điện thoại, email..."
            value={searchQuery}
            onChange={(event) => {
              setCurrentPage(1);
              setSearchQuery(event.target.value);
            }}
          />
        </div>
        <div className="filter-selects">
          <select value={selectedClass} onChange={(event) => {
            setCurrentPage(1);
            setSelectedClass(event.target.value);
          }} aria-label="Lọc theo lớp">
            <option value="ALL">Tất cả lớp phụ trách</option>
            {classes.map((classItem) => (
              <option key={classItem.maLopHoc} value={classItem.maLopHoc}>{classItem.tenLopHoc}</option>
            ))}
          </select>
          <select
            value={assignmentFilter}
            onChange={(event) => {
              setCurrentPage(1);
              setAssignmentFilter(event.target.value);
            }}
            aria-label="Lọc theo tình trạng phân công"
          >
            <option value="ALL">Tất cả tình trạng</option>
            <option value="ASSIGNED">Đang được phân công</option>
            <option value="UNASSIGNED">Chưa phân công</option>
          </select>
        </div>
      </div>

      {classError && <div className="empty-state-hint" role="alert">{classError}</div>}
      {isLoading ? (
        <div className="empty-state-hint" role="status">Đang tải danh sách giáo viên...</div>
      ) : loadError ? (
        <div className="empty-state-hint">Không thể hiển thị dữ liệu giáo viên khi backend gặp lỗi.</div>
      ) : teachers.length === 0 ? (
        <div className="empty-state-hint">Chưa có hồ sơ giáo viên trong cơ sở dữ liệu.</div>
      ) : filteredTeachers.length === 0 ? (
        <div className="empty-state-hint">Không tìm thấy giáo viên phù hợp với bộ lọc.</div>
      ) : (
        <>
          <div className="cards-grid">
            {pageTeachers.map((teacher) => {
              const activeAssignments = (teacher.phanCong || []).filter((assignment) => assignment.dangPhuTrach);
              return (
                <div key={teacher.maGiaoVien} className="teacher-card card-lift">
                  <div className="teacher-card-top">
                    <div className="teacher-avatar">
                      <img
                        src={`${API_BASE_URL}${teacher.anhDaiDien || `/api/giao-vien/${teacher.maGiaoVien}/anh-dai-dien`}`}
                        alt={`Ảnh đại diện ${teacher.hoTen}`}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = `${API_BASE_URL}/images/default-teacher.svg`;
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                      />
                    </div>
                    <div className="teacher-header-info">
                      <h4>{teacher.hoTen}</h4>
                      <span className="teacher-id-tag">GV{String(teacher.maGiaoVien).padStart(4, '0')}</span>
                      <p className="teacher-role-badge">
                        {activeAssignments.length ? activeAssignments.map((assignment) => assignment.vaiTro).filter(Boolean).join(', ') : 'Chưa phân công'}
                      </p>
                    </div>
                  </div>
                  <div className="teacher-details">
                    <div className="teacher-info-item">
                      <School size={15} className="text-blue" />
                      <span>Phụ trách: <strong>{activeAssignments.length
                        ? activeAssignments.map((assignment) => assignment.tenLopHoc).join(', ')
                        : 'Chưa phân công'}</strong></span>
                    </div>
                    <div className="teacher-info-item">
                      <Award size={15} className="text-orange" />
                      <span>{teacher.trinhDoChuyenMon || 'Chưa cập nhật trình độ'}</span>
                    </div>
                    <div className="teacher-info-item">
                      <Calendar size={15} className="text-green" />
                      <span>Ngày sinh: <strong>{teacher.ngaySinh || 'Chưa cập nhật'}</strong></span>
                    </div>
                    <div className="teacher-info-item"><Phone size={15} className="text-purple" /><span>{teacher.soDienThoai}</span></div>
                    <div className="teacher-info-item"><Mail size={15} className="text-blue" /><span>{teacher.email}</span></div>
                  </div>
                  <div className="teacher-card-footer">
                    <span className={`status-pill ${teacher.dangPhanCong ? 'pill-green' : 'pill-red'}`}>
                      <UserCheck size={12} /> {teacher.dangPhanCong ? 'Đang được phân công' : 'Chưa phân công'}
                    </span>
                    <div className="actions-cluster">
                      <button className="btn-action-icon" title="Xem chi tiết" onClick={() => openDetails(teacher)}>
                        <Eye size={16} />
                      </button>
                      <button className="btn-action-icon edit" title="Chỉnh sửa hồ sơ" onClick={() => openEdit(teacher)}>
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {pageCount > 1 && (
            <div className="pagination-controls">
              <button className="btn-secondary" onClick={() => setCurrentPage(Math.max(1, visiblePage - 1))} disabled={visiblePage === 1}>
                Trang trước
              </button>
              <span>Trang {visiblePage}/{pageCount} · {filteredTeachers.length} giáo viên</span>
              <button className="btn-secondary" onClick={() => setCurrentPage(Math.min(pageCount, visiblePage + 1))} disabled={visiblePage === pageCount}>
                Trang sau
              </button>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        onClose={closeModal}
        title={modalMode === 'edit' ? 'Chỉnh sửa hồ sơ giáo viên' : 'Thêm Giáo Viên Mới'}
        maxWidth="600px"
        footer={
          <div className="modal-buttons">
            <button className="btn-secondary" type="button" onClick={closeModal} disabled={isSaving}>Hủy</button>
            <button
              className="btn-primary"
              type="submit"
              form="teacher-form"
              disabled={isSaving || isLoadingDetails || Boolean(detailsError) || Boolean(classError && modalMode === 'create' && form.maLopHoc)}
            >
              {isSaving ? <RefreshCw size={16} className="spin" /> : <CheckCircle2 size={16} />}
              {isSaving ? 'Đang lưu...' : 'Lưu giáo viên'}
            </button>
          </div>
        }
      >
        {isLoadingDetails && modalMode === 'edit' ? (
          <div className="empty-state-hint" role="status">Đang tải hồ sơ và phân công lớp...</div>
        ) : detailsError && modalMode === 'edit' ? (
          <div className="empty-state-hint" role="alert">{detailsError}</div>
        ) : teacherForm}
      </Modal>

      <Modal
        isOpen={modalMode === 'view'}
        onClose={closeModal}
        title="Chi tiết giáo viên và phân công"
        maxWidth="700px"
        footer={
          <div className="modal-buttons">
            <button className="btn-secondary" type="button" onClick={closeModal} disabled={Boolean(operation)}>Đóng</button>
            <button className="btn-primary" type="button" onClick={() => openEdit(selectedTeacher)} disabled={Boolean(operation) || isLoadingDetails || Boolean(detailsError)}>
              <Edit size={16} /> Chỉnh sửa hồ sơ
            </button>
          </div>
        }
      >
        {isLoadingDetails ? (
          <div className="empty-state-hint" role="status">Đang tải chi tiết giáo viên...</div>
        ) : detailsError ? (
          <div className="empty-state-hint" role="alert">{detailsError}</div>
        ) : selectedTeacher && (
          <div className="modal-form-grid">
            <div className="form-group col-2">
              <label>Ảnh đại diện</label>
              <img
                src={`${API_BASE_URL}${selectedTeacher.anhDaiDien || `/api/giao-vien/${selectedTeacher.maGiaoVien}/anh-dai-dien`}`}
                alt={`Ảnh đại diện ${selectedTeacher.hoTen}`}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = `${API_BASE_URL}/images/default-teacher.svg`;
                }}
                style={{ width: '112px', height: '112px', objectFit: 'cover', borderRadius: '50%' }}
              />
            </div>
            <div className="form-group"><label>Mã giáo viên</label><strong>GV{String(selectedTeacher.maGiaoVien).padStart(4, '0')}</strong></div>
            <div className="form-group"><label>Họ và tên</label><strong>{selectedTeacher.hoTen}</strong></div>
            <div className="form-group"><label>Ngày sinh</label><span>{selectedTeacher.ngaySinh || 'Chưa cập nhật'}</span></div>
            <div className="form-group"><label>Số điện thoại</label><span>{selectedTeacher.soDienThoai}</span></div>
            <div className="form-group col-2"><label>Email</label><span>{selectedTeacher.email}</span></div>
            <div className="form-group col-2"><label>Địa chỉ liên hệ</label><span>{selectedTeacher.diaChiLH}</span></div>
            <div className="form-group col-2"><label>Trình độ chuyên môn</label><span>{selectedTeacher.trinhDoChuyenMon || 'Chưa cập nhật'}</span></div>
            <div className="form-group"><label>Tên đăng nhập</label><span>{selectedTeacher.tenDangNhap}</span></div>
            <div className="form-group"><label>Tình trạng tài khoản</label><span>{selectedTeacher.trangThaiTaiKhoan ? 'Đang hoạt động' : 'Đã khóa'}</span></div>
            <div className="form-group col-2">
              <label>Thêm phân công lớp</label>
              <div className="filter-selects">
                <select value={assignmentClassId} onChange={(event) => setAssignmentClassId(event.target.value)} disabled={Boolean(operation)}>
                  <option value="">Chọn lớp</option>
                  {classes.map((classItem) => <option key={classItem.maLopHoc} value={classItem.maLopHoc}>{classItem.tenLopHoc}</option>)}
                </select>
                <select value={assignmentRole} onChange={(event) => setAssignmentRole(event.target.value)} disabled={Boolean(operation)}>
                  {ASSIGNMENT_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
                <button className="btn-primary" type="button" onClick={addAssignment} disabled={Boolean(operation) || !assignmentClassId}>
                  {operation === 'add-assignment' ? 'Đang lưu...' : 'Phân công'}
                </button>
              </div>
              {classError && <span className="text-red">{classError}</span>}
            </div>
            <div className="form-group col-2">
              <label>Lịch sử phân công</label>
              {(selectedTeacher.phanCong || []).length === 0 ? (
                <span>Chưa có phân công lớp.</span>
              ) : (
                <div className="teacher-details">
                  {selectedTeacher.phanCong.map((assignment) => (
                    <div className="teacher-info-item" key={assignment.maLopHoc}>
                      <School size={15} className="text-blue" />
                      <span>
                        <strong>{assignment.tenLopHoc}</strong>
                        {' · '}
                        <select
                          value={assignmentRoleDrafts[assignment.maLopHoc] || assignment.vaiTro || ASSIGNMENT_ROLES[0]}
                          onChange={(event) => setAssignmentRoleDrafts({
                            ...assignmentRoleDrafts,
                            [assignment.maLopHoc]: event.target.value,
                          })}
                          disabled={Boolean(operation) || !assignment.dangPhuTrach}
                          aria-label={`Vai trò phân công ${assignment.tenLopHoc}`}
                        >
                          {ASSIGNMENT_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                        </select>
                        {' · '}
                        {assignment.dangPhuTrach ? 'Đang phụ trách' : `Đã kết thúc ${assignment.ngayKetThuc || ''}`}
                        {assignment.dangPhuTrach && (
                          <>
                            <button
                              className="btn-secondary"
                              type="button"
                              onClick={() => updateAssignmentRole(assignment)}
                              disabled={Boolean(operation) || assignmentRoleDrafts[assignment.maLopHoc] === assignment.vaiTro}
                            >
                              Lưu vai trò
                            </button>
                            <button
                              className="btn-secondary"
                              type="button"
                              onClick={() => endAssignment(assignment)}
                              disabled={Boolean(operation)}
                            >
                              Kết thúc
                            </button>
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(credentials)}
        onClose={() => setCredentials(null)}
        title="Thông tin đăng nhập cấp một lần"
        maxWidth="500px"
        footer={<div className="modal-buttons"><button className="btn-primary" onClick={() => setCredentials(null)}>Đã lưu thông tin</button></div>}
      >
        {credentials && (
          <div className="modal-form-grid">
            <p className="col-2">Mật khẩu tạm chỉ hiển thị lần này. Hãy bàn giao an toàn cho giáo viên và không chụp/log thông tin này.</p>
            <div className="form-group"><label>Tên đăng nhập</label><code>{credentials.tenDangNhap}</code></div>
            <div className="form-group"><label>Mật khẩu tạm</label><code>{credentials.matKhauTamThoi}</code></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
