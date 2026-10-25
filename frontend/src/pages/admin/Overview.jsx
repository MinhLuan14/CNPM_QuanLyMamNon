import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Baby,
  GraduationCap,
  School,
  Wallet,
  CalendarDays,
  Clock,
  AlertCircle,
  Sparkles,
  Utensils,
  PlusCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import logoImg from '../../assets/Logo.png';
import { authRequest, responseError } from '../../api/auth';
import { getMenu, getMenus } from '../../api/nutrition';

const PAYMENT_SUCCESS = 'Thành công';
const VALID_INVOICE_STATUSES = new Set(['Chưa thanh toán', 'Đã thanh toán', 'Đã thanh toán một phần']);
const GROUP_COLORS = ['#ff7875', '#ffc069', '#5cdbd3', '#85a5ff', '#91a3b0'];

async function fetchArray(path, fallback) {
  const response = await authRequest(path);
  if (!response.ok) throw new Error(await responseError(response, fallback));
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error(fallback);
  return data;
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function weekRange(date) {
  const monday = new Date(date);
  monday.setHours(12, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const friday = new Date(monday);
  friday.setDate(friday.getDate() + 4);
  const thursday = new Date(date);
  thursday.setHours(12, 0, 0, 0);
  thursday.setDate(thursday.getDate() + 4 - (thursday.getDay() || 7));
  const firstDay = new Date(thursday.getFullYear(), 0, 1, 12);
  const week = Math.ceil((((thursday - firstDay) / 86400000) + 1) / 7);
  return { monday, friday, week, year: thursday.getFullYear() };
}

function displayDate(date, options = { day: 'numeric', month: 'short' }) {
  return date.toLocaleDateString('vi-VN', options);
}

function formatMoney(value) {
  if (!Number.isFinite(value)) return '—';
  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(value)} ₫`;
}

function successfulPayment(invoice) {
  const payment = invoice.thanhToan;
  const amount = Number(payment?.soTienThanhToan);
  return payment?.trangThai === PAYMENT_SUCCESS && Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function isCountableInvoice(invoice) {
  if (!VALID_INVOICE_STATUSES.has(invoice.trangThai)) return false;
  if (invoice.trangThai === 'Chưa thanh toán') return true;
  return successfulPayment(invoice) > 0;
}

function groupNameForAge(ageValue) {
  const age = String(ageValue || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (age.includes('thang') || age.includes('duoi 3') || /(^|\D)0\s*[-–]\s*3/.test(age)) return 'Khối Nhà trẻ';
  if (/3\s*[-–]\s*4/.test(age)) return 'Khối Mầm';
  if (/4\s*[-–]\s*5/.test(age)) return 'Khối Chồi';
  if (/5\s*[-–]\s*6/.test(age)) return 'Khối Lá';
  return ageValue ? `Khối ${ageValue}` : 'Chưa phân nhóm tuổi';
}

async function fetchTodayMenu(today) {
  const menus = await getMenus();
  const todayKey = localDateKey(today);
  const menu = menus.find((item) => item.trangThai === true
    && item.ngayBatDau
    && item.ngayKetThuc
    && item.ngayBatDau.slice(0, 10) <= todayKey
    && item.ngayKetThuc.slice(0, 10) >= todayKey);
  if (!menu) return null;
  return getMenu(menu.maThucDon);
}

export default function Overview({ onNavigate }) {
  const [collections, setCollections] = useState({ children: null, teachers: null, classes: null, invoices: null });
  const [collectionErrors, setCollectionErrors] = useState({});
  const [todayMenu, setTodayMenu] = useState(null);
  const [todayMenuError, setTodayMenuError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [today, setToday] = useState(() => new Date());
  const currentDate = today.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const currentWeek = weekRange(today);
  const weekLabel = `Tuần ${currentWeek.week}/${currentWeek.year} · ${displayDate(currentWeek.monday)} – ${displayDate(currentWeek.friday)}`;

  const loadOverview = useCallback(async () => {
    const requestDate = new Date();
    setToday(requestDate);
    setIsLoading(true);
    setCollectionErrors({});
    setTodayMenuError('');
    const results = await Promise.allSettled([
      fetchArray('/api/tre-em', 'Không thể tải danh sách trẻ.'),
      fetchArray('/api/giao-vien', 'Không thể tải danh sách giáo viên.'),
      fetchArray('/api/lop-hoc', 'Không thể tải danh sách lớp học.'),
      fetchArray('/api/hoc-phi', 'Không thể tải danh sách phiếu thu.'),
      fetchTodayMenu(requestDate),
    ]);
    const keys = ['children', 'teachers', 'classes', 'invoices'];
    const nextCollections = {};
    const nextErrors = {};
    keys.forEach((key, index) => {
      const result = results[index];
      if (result.status === 'fulfilled') nextCollections[key] = result.value;
      else {
        nextCollections[key] = null;
        nextErrors[key] = result.reason?.message || 'Không thể tải dữ liệu.';
      }
    });
    setCollections(nextCollections);
    setCollectionErrors(nextErrors);
    const menuResult = results[4];
    if (menuResult.status === 'fulfilled') setTodayMenu(menuResult.value);
    else {
      setTodayMenu(null);
      setTodayMenuError(menuResult.reason?.message || 'Không thể tải thực đơn hôm nay.');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => loadOverview(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadOverview]);

  const activeChildren = collections.children?.filter((child) => child.trangThaiHocTap === 'Đang học') ?? null;
  const { teachers } = collections;
  const activeTeacherCount = teachers?.filter((teacher) => teacher.dangPhanCong === true).length ?? null;
  const currentMonthInvoices = collections.invoices?.filter((invoice) => (
    invoice.thangApDung === currentMonth && invoice.namApDung === currentYear && isCountableInvoice(invoice)
  )) ?? null;
  const monthlyDue = currentMonthInvoices?.reduce((sum, invoice) => sum + Number(invoice.tongTien || 0), 0) ?? null;
  const monthlyCollected = currentMonthInvoices?.reduce((sum, invoice) => sum + successfulPayment(invoice), 0) ?? null;
  const collectionRate = monthlyDue > 0 ? Math.round((monthlyCollected / monthlyDue) * 100) : null;
  const billedChildCount = currentMonthInvoices ? new Set(currentMonthInvoices.map((invoice) => invoice.maTre)).size : null;
  const paidChildCount = currentMonthInvoices
    ? new Set(currentMonthInvoices.filter((invoice) => successfulPayment(invoice) > 0).map((invoice) => invoice.maTre)).size
    : null;

  const classSummary = useMemo(() => {
    if (!collections.classes || !collections.children) return null;
    const currentStudents = collections.children.filter((child) => child.trangThaiHocTap === 'Đang học');
    const studentsByClass = new Map();
    currentStudents.forEach((child) => {
      if (child.maLopHoc != null) studentsByClass.set(child.maLopHoc, (studentsByClass.get(child.maLopHoc) || 0) + 1);
    });
    const groups = new Map();
    collections.classes.forEach((classItem) => {
      const name = groupNameForAge(classItem.doTuoi);
      const group = groups.get(name) || { name, count: 0, capacity: 0, hasCompleteCapacity: true, classes: 0 };
      group.classes += 1;
      group.count += studentsByClass.get(classItem.maLopHoc) || 0;
      if (Number.isFinite(Number(classItem.soLuongToiDa)) && Number(classItem.soLuongToiDa) > 0) {
        group.capacity += Number(classItem.soLuongToiDa);
      } else {
        group.hasCompleteCapacity = false;
      }
      groups.set(name, group);
    });
    return [...groups.values()].map((group, index) => ({ ...group, color: GROUP_COLORS[index % GROUP_COLORS.length] }));
  }, [collections.classes, collections.children]);

  const recentPayments = useMemo(() => {
    if (!collections.invoices) return null;
    return collections.invoices
      .filter((invoice) => invoice.thanhToan?.thoiGianThanhToan)
      .map((invoice) => ({ invoice, payment: invoice.thanhToan, timestamp: new Date(invoice.thanhToan.thoiGianThanhToan).getTime() }))
      .filter((item) => Number.isFinite(item.timestamp))
      .sort((first, second) => second.timestamp - first.timestamp)
      .slice(0, 5);
  }, [collections.invoices]);

  const todayMeals = useMemo(() => {
    const todayKey = localDateKey(today);
    return (todayMenu?.chiTiet || []).filter((item) => item.ngayAn?.slice(0, 10) === todayKey);
  }, [today, todayMenu]);
  const mealsByTime = useMemo(() => {
    const groups = new Map();
    todayMeals.forEach((meal) => {
      const key = meal.buaAn || 'Bữa ăn chưa phân loại';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(meal.monAn?.tenMonAn || 'Món ăn không có tên');
    });
    return [...groups.entries()];
  }, [todayMeals]);
  const collectionErrorEntries = Object.entries(collectionErrors);

  return (
    <div className="dashboard-content fade-in" aria-busy={isLoading}>
      {/* Banner Chào Mừng */}
      <div className="welcome-banner">
        <div className="welcome-copy">
          <div className="welcome-tag">
            <Sparkles size={14} className="inline-icon" /> HỆ THỐNG MẦM NON THÔNG MINH BABYSHARK
          </div>
          <h2>Chào mừng trở lại, Ban Quản Trị!</h2>
          <p>
            "Cùng con lớn lên mỗi ngày ♡" — Tổng quan sử dụng dữ liệu hồ sơ, lớp học, giáo viên, phiếu thu và thực đơn hiện có.
          </p>
          <div className="welcome-date">
            <CalendarDays size={15} />
            <span>{currentDate}</span>
          </div>

          <div className="banner-badges">
            <span className="badge love">❤️ Yêu thương</span>
            <span className="badge respect">⭐ Tôn trọng</span>
            <span className="badge grow">🌱 Phát triển</span>
            <span className="badge happy">😊 Hạnh phúc</span>
          </div>
        </div>

        <div className="welcome-art">
          <img src={logoImg} alt="BabyShark" style={{ width: '130px', height: '130px', objectFit: 'contain' }} />
        </div>
        <div className="banner-decoration decoration-one" />
        <div className="banner-decoration decoration-two" />
      </div>

      {collectionErrorEntries.length > 0 && (
        <div className="overview-data-warning" role="status">
          <AlertCircle size={16} /> Một số khu vực chưa tải được dữ liệu: {collectionErrorEntries.map(([key]) => ({
            children: 'trẻ em', teachers: 'giáo viên', classes: 'lớp học', invoices: 'phiếu thu',
          }[key])).join(', ')}. Các giá trị tương ứng được để trống thay vì ước lượng.
        </div>
      )}

      {/* 4 Thẻ Thống Kê Chính Nổi Bật */}
      <div className="stats-grid">
        <div className="stat-card stat-card-hover card-blue" onClick={() => onNavigate && onNavigate('Quản lý trẻ')}>
          <div className="stat-icon blue">
            <Baby size={24} />
          </div>
          <div className="stat-label">TỔNG SỐ HỌC SINH</div>
          <div className="stat-value text-blue">{isLoading ? '…' : activeChildren == null ? '—' : activeChildren.length} <span className="stat-sub">bé</span></div>
          <div className="stat-footer">
            <span>{activeChildren == null ? 'Không có dữ liệu trạng thái' : 'Đang theo học tại trường'}</span>
            <span className="stat-change blue">{collections.children ? `${collections.children.filter((child) => child.trangThaiHocTap === 'Tạm nghỉ').length} tạm nghỉ` : 'Chưa tải được'}</span>
          </div>
        </div>

        <div className="stat-card stat-card-hover card-purple" onClick={() => onNavigate && onNavigate('Quản lý giáo viên')}>
          <div className="stat-icon purple">
            <GraduationCap size={24} />
          </div>
          <div className="stat-label">GIÁO VIÊN</div>
          <div className="stat-value text-purple">{isLoading ? '…' : teachers == null ? '—' : teachers.length} <span className="stat-sub">hồ sơ</span></div>
          <div className="stat-footer">
            <span>{teachers == null ? 'Chưa tải được danh sách' : 'Không bao gồm nhân sự khác'}</span>
            <span className="stat-change purple">{activeTeacherCount == null ? '—' : `${activeTeacherCount} đang phân công`}</span>
          </div>
        </div>

        <div className="stat-card stat-card-hover card-orange" onClick={() => onNavigate && onNavigate('Quản lý lớp học')}>
          <div className="stat-icon orange">
            <School size={24} />
          </div>
          <div className="stat-label">LỚP HỌC ĐÃ KHAI BÁO</div>
          <div className="stat-value text-orange">{isLoading ? '…' : collections.classes == null ? '—' : collections.classes.length} <span className="stat-sub">lớp</span></div>
          <div className="stat-footer">
            <span>{collections.classes == null ? 'Chưa tải được danh sách' : 'Hạng lớp lấy từ độ tuổi đã cấu hình'}</span>
            <span className="stat-change orange">Chưa có trạng thái mở lớp</span>
          </div>
        </div>

        <div className="stat-card stat-card-hover card-green" onClick={() => onNavigate && onNavigate('Học phí & tiền ăn')}>
          <div className="stat-icon green">
            <Wallet size={24} />
          </div>
          <div className="stat-label">PHIẾU THU THÁNG {String(currentMonth).padStart(2, '0')}/{currentYear}</div>
          <div className="stat-value text-green">{isLoading ? '…' : monthlyDue == null ? '—' : formatMoney(monthlyDue)} <span className="stat-sub" /></div>
          <div className="stat-footer">
            <span>{collectionRate == null ? 'Chưa đủ dữ liệu để tính tỷ lệ thu' : `Đã thu ${collectionRate}% · ${formatMoney(monthlyCollected)}`}</span>
            <span className="stat-change green">{billedChildCount == null ? '—' : `${paidChildCount}/${billedChildCount} trẻ có phiếu`}</span>
          </div>
        </div>
      </div>

      {/* Lưới 2 Cột: Biểu Đồ & Hoạt Động */}
      <div className="dashboard-grid">
        {/* Cột 1: Tỷ lệ chuyên cần tuần này & Phân bổ khối */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Tỷ Lệ Đi Học Trong Tuần Này</h3>
              <p>{displayDate(currentWeek.monday)} – {displayDate(currentWeek.friday)} · Thứ Hai đến Thứ Sáu</p>
            </div>
            <div className="badge-pill bg-light-blue text-blue">{weekLabel}</div>
          </div>

          <div className="chart-legend">
            <span><i className="legend-dot blue-dot" /> Có mặt (%)</span>
            <span><i className="legend-dot orange-dot" /> Nghỉ phép (%)</span>
          </div>

          <div className="chart overview-chart-empty" role="status">
            <span>Chưa có API hoặc dữ liệu điểm danh để tính tỷ lệ đi học trong tuần này.</span>
          </div>

          <div className="chart-summary">
            <div>
              <span>Tỷ lệ đi học trung bình</span>
              <strong className="text-blue">Chưa có dữ liệu</strong>
            </div>
            <div>
              <span>Tình trạng sức khỏe</span>
              <strong className="text-green">Chưa có dữ liệu sức khỏe</strong>
            </div>
            <div>
              <span>Bé cần chăm sóc đặc biệt</span>
              <strong className="text-orange">Chưa có dữ liệu</strong>
            </div>
          </div>

          {/* Phân bổ các khối mầm non */}
          <div className="class-breakdown-section">
            <h4 className="sub-title-bar">Sĩ số theo khối lớp hiện tại</h4>
            {classSummary == null ? (
              <div className="overview-inline-empty" role="status">{isLoading ? 'Đang tải sĩ số lớp…' : 'Không thể tải dữ liệu lớp và trẻ.'}</div>
            ) : classSummary.length ? (
              <div className="class-bars">
                {classSummary.map((group) => {
                  const hasCapacity = group.hasCompleteCapacity && group.capacity > 0;
                  const percent = hasCapacity ? Math.round((group.count / group.capacity) * 100) : null;
                  return (
                    <div key={group.name} className="class-bar-item">
                      <div className="class-bar-info">
                        <span><strong>{group.name}</strong> · {group.classes} lớp</span>
                        <span>{group.count} trẻ{hasCapacity ? ` / ${group.capacity} chỗ (${percent}%)` : ' · chưa đủ dữ liệu sức chứa'}</span>
                      </div>
                      {hasCapacity && <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(100, percent)}%`, backgroundColor: group.color }} /></div>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="overview-inline-empty" role="status">Chưa có lớp học được khai báo.</div>
            )}
          </div>
        </div>

        {/* Cột 2: Hoạt động gần đây & Lịch ăn hôm nay */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Hoạt Động & Sự Kiện Gần Đây</h3>
              <p>Nhật ký diễn biến trong ngày tại trường mầm non</p>
            </div>
            <button className="text-link" onClick={() => onNavigate && onNavigate('Thanh toán')}>
              Xem giao dịch
            </button>
          </div>

          <div className="activity-list">
            {recentPayments == null ? (
              <div className="overview-inline-empty" role="status">{isLoading ? 'Đang tải giao dịch…' : 'Không thể tải hoạt động thanh toán.'}</div>
            ) : recentPayments.length ? recentPayments.map(({ invoice, payment }) => (
              <div className="activity-item" key={payment.maThanhToan}>
                <div className="activity-icon green"><Wallet size={18} /></div>
                <div className="activity-copy">
                  <strong>Giao dịch {payment.maThanhToan} · {payment.trangThai || 'Chưa xác định trạng thái'}</strong>
                  <span>{invoice.hoTenTre || 'Trẻ chưa có tên'} · {formatMoney(payment.soTienThanhToan == null ? NaN : Number(payment.soTienThanhToan))} · {payment.phuongThucThanhToan || 'Chưa có phương thức'}</span>
                  <small><Clock size={12} /> {new Date(payment.thoiGianThanhToan).toLocaleString('vi-VN')}</small>
                </div>
              </div>
            )) : (
              <div className="overview-inline-empty" role="status">Chưa có giao dịch có thời điểm ghi nhận.</div>
            )}
          </div>

          {/* Hộp gợi ý dinh dưỡng hôm nay */}
          <div className="today-menu-widget">
            <div className="today-menu-header">
              <Utensils size={16} />
              <strong>Thực đơn hôm nay</strong>
            </div>
            {todayMenuError ? (
              <p className="today-menu-content" role="alert">{todayMenuError}</p>
            ) : isLoading ? (
              <p className="today-menu-content" role="status">Đang tải thực đơn…</p>
            ) : mealsByTime.length ? (
              <div className="today-menu-content overview-today-meals">
                {mealsByTime.map(([mealName, mealItems]) => <p key={mealName}><strong>{mealName}:</strong> {mealItems.join(', ')}</p>)}
              </div>
            ) : (
              <p className="today-menu-content">{todayMenu ? 'Thực đơn hôm nay chưa có món được ghi nhận.' : 'Chưa có thực đơn được đánh dấu đang áp dụng cho hôm nay.'}</p>
            )}
            <button
              className="btn-outline-sm"
              onClick={() => onNavigate && onNavigate('Thực đơn')}
            >
              Xem thực đơn cả tuần →
            </button>
          </div>
        </div>
      </div>

      {/* Thao Tác Nhanh */}
      <div className="panel quick-panel">
        <div className="panel-heading">
          <div>
            <h3>Lối Tắt Thao Tác Nhanh</h3>
            <p>Truy cập nhanh các nghiệp vụ thường dùng hàng ngày</p>
          </div>
        </div>

        <div className="quick-actions">
          <button className="quick-action" onClick={() => onNavigate && onNavigate('Quản lý trẻ')}>
            <span className="quick-icon blue"><PlusCircle size={20} /></span>
            <div>
              <strong>Thêm trẻ em mới</strong>
              <p>Nhập hồ sơ tuyển sinh</p>
            </div>
          </button>

          <button className="quick-action" onClick={() => onNavigate && onNavigate('Thực đơn')}>
            <span className="quick-icon orange"><Utensils size={20} /></span>
            <div>
              <strong>Lập thực đơn tuần</strong>
              <p>Cân đối calo & dinh dưỡng</p>
            </div>
          </button>

          <button className="quick-action" onClick={() => onNavigate && onNavigate('Học phí & tiền ăn')}>
            <span className="quick-icon green"><FileText size={20} /></span>
            <div>
              <strong>Lập phiếu thu học phí</strong>
              <p>Thu học phí & tiền ăn</p>
            </div>
          </button>

          <button className="quick-action" onClick={() => onNavigate && onNavigate('Tài khoản & phân quyền')}>
            <span className="quick-icon purple"><UserCheck size={20} /></span>
            <div>
              <strong>Cấp tài khoản phụ huynh</strong>
              <p>Kết nối ứng dụng gia đình</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
