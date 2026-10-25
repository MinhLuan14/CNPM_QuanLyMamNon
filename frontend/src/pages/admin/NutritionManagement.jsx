import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Edit,
  Eye,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Trash2,
  Utensils,
} from 'lucide-react';
import Modal from '../../components/Modal';
import {
  deleteMenu,
  deleteFood,
  deleteMenuItem,
  getFoods,
  getMenu,
  getMenus,
  saveFood,
  saveMenu,
  saveMenuItem,
  setFoodStatus as updateFoodStatus,
} from '../../api/nutrition';
import './NutritionManagement.css';

const WEEKDAYS = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
const MEAL_OPTIONS = ['Bữa sáng', 'Bữa phụ sáng', 'Bữa trưa', 'Bữa phụ chiều'];
const VND_NUMBER_FORMAT = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });
const MAX_FOOD_PRICE = 9999999999.99;
const FOOD_CATEGORIES = [
  'Món sáng',
  'Món chính',
  'Món mặn',
  'Món canh',
  'Món rau',
  'Món phụ',
  'Tráng miệng',
  'Đồ uống',
];
const PAGE_SIZE = 10;

function sortMealGroups(groups) {
  const mealOrder = new Map(MEAL_OPTIONS.map((meal, index) => [meal, index]));
  return Array.from(groups.entries()).sort(([firstMeal], [secondMeal]) => {
    const firstOrder = mealOrder.get(firstMeal);
    const secondOrder = mealOrder.get(secondMeal);
    if (firstOrder !== undefined || secondOrder !== undefined) {
      return (firstOrder ?? Number.MAX_SAFE_INTEGER) - (secondOrder ?? Number.MAX_SAFE_INTEGER);
    }
    return firstMeal.localeCompare(secondMeal, 'vi');
  });
}

function dateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function localDate(value) {
  return new Date(`${value}T12:00:00`);
}

function startOfWeek(date) {
  const result = new Date(date);
  result.setHours(12, 0, 0, 0);
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  return result;
}

function addDays(value, amount) {
  const result = localDate(value);
  result.setDate(result.getDate() + amount);
  return dateString(result);
}

function isoWeek(date) {
  const thursday = new Date(date);
  thursday.setHours(12, 0, 0, 0);
  thursday.setDate(thursday.getDate() + 4 - (thursday.getDay() || 7));
  const year = thursday.getFullYear();
  const firstDay = new Date(year, 0, 1, 12);
  const week = Math.ceil((((thursday - firstDay) / 86400000) + 1) / 7);
  return { week, year };
}

function formatDate(value, options = { day: 'numeric', month: 'long', year: 'numeric' }) {
  if (!value) return 'Chưa có thông tin';
  return localDate(value).toLocaleDateString('vi-VN', options);
}

function emptyMenuForm(start) {
  const end = addDays(start, 6);
  return {
    ngayBatDau: start,
    ngayKetThuc: end,
    ghiChu: '',
    trangThai: 'true',
  };
}

function statusFormValue(status) {
  return status == null ? '' : String(status);
}

function fullNameForWeek(start) {
  const { week, year } = isoWeek(localDate(start));
  return { week, year, month: localDate(start).getMonth() + 1 };
}

function errorMessage(error) {
  return error?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '';
  const amount = Number(value);
  return Number.isFinite(amount) ? `${VND_NUMBER_FORMAT.format(amount)} ₫` : '';
}

export default function NutritionManagement({ onShowToast }) {
  const [menus, setMenus] = useState([]);
  const [foods, setFoods] = useState([]);
  const [menuDetailResult, setMenuDetailResult] = useState(null);
  const [weekStart, setWeekStart] = useState(() => dateString(startOfWeek(new Date())));
  const [selectedDate, setSelectedDate] = useState(() => dateString(startOfWeek(new Date())));
  const [activeTab, setActiveTab] = useState('weekly');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [foodsError, setFoodsError] = useState('');
  const [menuModal, setMenuModal] = useState(null);
  const [menuForm, setMenuForm] = useState(() => emptyMenuForm(dateString(startOfWeek(new Date()))));
  const [menuSaving, setMenuSaving] = useState(false);
  const [foodModal, setFoodModal] = useState(null);
  const [foodForm, setFoodForm] = useState({
    tenMonAn: '', loaiMon: '', thanhPhan: '', donGia: '', trangThai: 'true',
  });
  const [foodFormError, setFoodFormError] = useState('');
  const [foodPriceError, setFoodPriceError] = useState('');
  const [foodCategoryError, setFoodCategoryError] = useState('');
  const [foodSaving, setFoodSaving] = useState(false);
  const [foodDeleteTarget, setFoodDeleteTarget] = useState(null);
  const [foodDeleteError, setFoodDeleteError] = useState('');
  const [foodDeleting, setFoodDeleting] = useState(false);
  const [itemModal, setItemModal] = useState(null);
  const [itemForm, setItemForm] = useState({
    ngayAn: dateString(startOfWeek(new Date())),
    buaAn: '',
    maMonAn: '',
    donGia: '',
    ghiChu: '',
  });
  const [itemQuery, setItemQuery] = useState('');
  const [foodSearch, setFoodSearch] = useState('');
  const [foodCategory, setFoodCategory] = useState('ALL');
  const [foodStatus, setFoodStatusFilter] = useState('ALL');
  const [foodPage, setFoodPage] = useState(1);
  const [savingItem, setSavingItem] = useState(false);
  const [workingId, setWorkingId] = useState(null);

  const notify = useCallback((type, title, message) => {
    onShowToast?.({ type, title, message });
  }, [onShowToast]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    setFoodsError('');
    const [menuResult, foodResult] = await Promise.allSettled([getMenus(), getFoods()]);
    if (menuResult.status === 'fulfilled') {
      setMenus(menuResult.value);
    } else {
      setMenus([]);
      setLoadError(errorMessage(menuResult.reason));
    }
    if (foodResult.status === 'fulfilled') {
      setFoods(foodResult.value);
    } else {
      setFoods([]);
      setFoodsError(errorMessage(foodResult.reason));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let isCurrent = true;
    Promise.allSettled([getMenus(), getFoods()]).then(([menuResult, foodResult]) => {
      if (!isCurrent) return;
      if (menuResult.status === 'fulfilled') setMenus(menuResult.value);
      else setLoadError(errorMessage(menuResult.reason));
      if (foodResult.status === 'fulfilled') setFoods(foodResult.value);
      else {
        setFoodsError(errorMessage(foodResult.reason));
        setFoods([]);
      }
      setIsLoading(false);
    });
    return () => { isCurrent = false; };
  }, []);

  const weekMenu = useMemo(
    () => menus.find((menu) => menu.ngayBatDau === weekStart) || null,
    [menus, weekStart],
  );

  useEffect(() => {
    let isCurrent = true;
    if (!weekMenu) return () => { isCurrent = false; };
    getMenu(weekMenu.maThucDon)
      .then((menu) => {
        if (isCurrent) setMenuDetailResult({ id: weekMenu.maThucDon, menu, error: '' });
      })
      .catch((error) => {
        if (isCurrent) {
          setMenuDetailResult({ id: weekMenu.maThucDon, menu: null, error: errorMessage(error) });
          notify('error', 'Không thể tải chi tiết thực đơn', errorMessage(error));
        }
      });
    return () => { isCurrent = false; };
  }, [notify, weekMenu]);

  const menuDetails = weekMenu && menuDetailResult?.id === weekMenu.maThucDon
    ? menuDetailResult.menu
    : null;
  const isDetailsLoading = Boolean(weekMenu && menuDetailResult?.id !== weekMenu.maThucDon);

  const weekDates = useMemo(
    () => WEEKDAYS.map((dayName, index) => {
      const date = addDays(weekStart, index);
      return { dayName, date, menu: menus.find((menu) => menu.ngayBatDau <= date && menu.ngayKetThuc >= date) };
    }),
    [menus, weekStart],
  );

  const dayItems = useMemo(
    () => (menuDetails?.chiTiet || []).filter((item) => item.ngayAn === selectedDate),
    [menuDetails, selectedDate],
  );
  const mealGroups = useMemo(() => {
    const groups = new Map();
    dayItems.forEach((item) => {
      const key = item.buaAn || 'Bữa ăn chưa phân loại';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    return sortMealGroups(groups);
  }, [dayItems]);

  const categoryOptions = useMemo(
    () => [
      ...FOOD_CATEGORIES,
      ...Array.from(new Set(foods.map((food) => food.loaiMon).filter(
        (category) => category && !FOOD_CATEGORIES.includes(category),
      ))).sort((a, b) => a.localeCompare(b, 'vi')),
    ],
    [foods],
  );
  const filteredFoods = useMemo(() => foods.filter((food) => {
    const matchesSearch = `${food.tenMonAn || ''} ${food.thanhPhan || ''}`.toLocaleLowerCase('vi')
      .includes(foodSearch.trim().toLocaleLowerCase('vi'));
    const matchesCategory = foodCategory === 'ALL' || food.loaiMon === foodCategory;
    const matchesStatus = foodStatus === 'ALL'
      || (foodStatus === 'ACTIVE' ? food.trangThai === true
        : foodStatus === 'INACTIVE' ? food.trangThai === false : food.trangThai == null);
    return matchesSearch && matchesCategory && matchesStatus;
  }), [foodCategory, foodSearch, foodStatus, foods]);
  const foodPageCount = Math.max(1, Math.ceil(filteredFoods.length / PAGE_SIZE));
  const visibleFoods = filteredFoods.slice((foodPage - 1) * PAGE_SIZE, foodPage * PAGE_SIZE);
  const selectableFoods = foods.filter((food) => food.trangThai === true);
  const filteredSelectableFoods = selectableFoods.filter((food) => (
    food.tenMonAn || '').toLocaleLowerCase('vi').includes(itemQuery.trim().toLocaleLowerCase('vi')));
  const originalItemFood = itemModal?.originalFoodId
    ? foods.find((food) => food.maMonAn === itemModal.originalFoodId)
    : null;
  const selectedItemFood = foods.find((food) => String(food.maMonAn) === itemForm.maMonAn);
  const selectedItemHasNoPrice = Boolean(itemForm.maMonAn)
    && selectedItemFood?.donGia == null
    && (!itemModal?.id || Number(itemModal.originalFoodId) !== Number(itemForm.maMonAn));

  const changeWeek = (offset) => {
    const next = addDays(weekStart, offset * 7);
    setWeekStart(next);
    setSelectedDate(next);
  };

  const handleMenuSubmit = async (event) => {
    event.preventDefault();
    const start = localDate(menuForm.ngayBatDau);
    const monday = dateString(startOfWeek(start));
    if (menuForm.ngayBatDau !== monday) {
      notify('error', 'Ngày bắt đầu không hợp lệ', 'Tuần thực đơn phải bắt đầu vào thứ Hai.');
      return;
    }
    if (menuForm.ngayKetThuc !== addDays(menuForm.ngayBatDau, 6)) {
      notify('error', 'Khoảng thời gian không hợp lệ', 'Ngày kết thúc phải là Chủ nhật cùng tuần.');
      return;
    }
    const { week, year, month } = fullNameForWeek(menuForm.ngayBatDau);
    setMenuSaving(true);
    try {
      const saved = await saveMenu({
        tuanApDung: week,
        thangApDung: month,
        namApDung: year,
        ngayBatDau: menuForm.ngayBatDau,
        ngayKetThuc: menuForm.ngayKetThuc,
        ghiChu: menuForm.ghiChu.trim() || null,
        trangThai: menuForm.trangThai === '' ? null : menuForm.trangThai === 'true',
      }, menuModal?.id);
      setMenuModal(null);
      setWeekStart(saved.ngayBatDau);
      setSelectedDate(saved.ngayBatDau);
      await loadData();
      notify('success', 'Đã lưu thực đơn', `Thực đơn tuần ${saved.tuanApDung}/${saved.namApDung} đã được lưu.`);
    } catch (error) {
      notify('error', 'Không thể lưu thực đơn', errorMessage(error));
    } finally {
      setMenuSaving(false);
    }
  };

  const openMenuModal = (menu = null) => {
    setMenuForm(menu ? {
      ngayBatDau: menu.ngayBatDau,
      ngayKetThuc: menu.ngayKetThuc,
      ghiChu: menu.ghiChu || '',
      trangThai: statusFormValue(menu.trangThai),
    } : emptyMenuForm(weekStart));
    setMenuModal(menu ? { id: menu.maThucDon } : { id: null });
  };

  const handleDeleteMenu = async () => {
    if (!weekMenu || !window.confirm('Xóa thực đơn tuần này? Thực đơn chỉ xóa được khi không còn chi tiết món ăn.')) return;
    setWorkingId(weekMenu.maThucDon);
    try {
      await deleteMenu(weekMenu.maThucDon);
      await loadData();
      notify('success', 'Đã xóa thực đơn', 'Thực đơn tuần đã được xóa.');
    } catch (error) {
      notify('error', 'Không thể xóa thực đơn', errorMessage(error));
    } finally {
      setWorkingId(null);
    }
  };

  const openItemModal = (item = null, meal = '') => {
    setItemQuery('');
    setItemForm(item ? {
      ngayAn: item.ngayAn,
      buaAn: item.buaAn || '',
      maMonAn: String(item.monAn.maMonAn),
      donGia: item.donGia ?? '',
      ghiChu: item.ghiChu || '',
    } : {
      ngayAn: selectedDate,
      buaAn: meal || '',
      maMonAn: '',
      donGia: '',
      ghiChu: '',
    });
    setItemModal(item
      ? {
        id: item.maChiTietThucDon,
        originalFoodId: item.monAn.maMonAn,
        originalPrice: item.donGia ?? '',
      }
      : { id: null, originalFoodId: null });
  };

  const handleItemSubmit = async (event) => {
    event.preventDefault();
    if (!weekMenu) return;
    if (!itemForm.buaAn.trim()) {
      notify('error', 'Chưa chọn bữa ăn', 'Vui lòng chọn bữa ăn trước khi lưu.');
      return;
    }
    if (selectedItemHasNoPrice) {
      notify(
        'error',
        'Món ăn chưa có đơn giá',
        'Vui lòng cập nhật đơn giá món ăn trước khi thêm vào thực đơn.',
      );
      return;
    }
    setSavingItem(true);
    try {
      await saveMenuItem(weekMenu.maThucDon, {
        ngayAn: itemForm.ngayAn,
        buaAn: itemForm.buaAn.trim(),
        maMonAn: Number(itemForm.maMonAn),
        ghiChu: itemForm.ghiChu.trim() || null,
      }, itemModal?.id);
      setItemModal(null);
      const updated = await getMenu(weekMenu.maThucDon);
      setMenuDetailResult({ id: weekMenu.maThucDon, menu: updated, error: '' });
      notify('success', 'Đã lưu món', 'Chi tiết món ăn trong thực đơn đã được cập nhật.');
    } catch (error) {
      notify('error', 'Không thể lưu món', errorMessage(error));
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!weekMenu || !window.confirm(`Xóa món "${item.monAn.tenMonAn}" khỏi thực đơn ngày ${formatDate(item.ngayAn)}?`)) return;
    setWorkingId(item.maChiTietThucDon);
    try {
      await deleteMenuItem(weekMenu.maThucDon, item.maChiTietThucDon);
      setMenuDetailResult({
        id: weekMenu.maThucDon,
        menu: await getMenu(weekMenu.maThucDon),
        error: '',
      });
      notify('success', 'Đã xóa món', 'Món ăn đã được gỡ khỏi thực đơn.');
    } catch (error) {
      notify('error', 'Không thể xóa món', errorMessage(error));
    } finally {
      setWorkingId(null);
    }
  };

  const openFoodModal = (food = null, mode = 'edit') => {
    setFoodFormError('');
    setFoodPriceError('');
    setFoodCategoryError('');
    setFoodForm(food ? {
      tenMonAn: food.tenMonAn || '',
      loaiMon: food.loaiMon || '',
      thanhPhan: food.thanhPhan || '',
      donGia: food.donGia == null ? '' : String(food.donGia),
      trangThai: statusFormValue(food.trangThai),
    } : { tenMonAn: '', loaiMon: '', thanhPhan: '', donGia: '', trangThai: 'true' });
    setFoodModal(food ? { id: food.maMonAn, mode } : { id: null, mode: 'create' });
  };

  const handleFoodSubmit = async (event) => {
    event.preventDefault();
    if (!foodForm.tenMonAn.trim()) {
      setFoodFormError('Vui lòng nhập tên món ăn.');
      return;
    }
    if (!foodForm.loaiMon.trim()) {
      setFoodCategoryError('Vui lòng chọn loại món ăn trước khi lưu.');
      return;
    }
    const price = Number(foodForm.donGia);
    const validPriceFormat = /^\d{1,10}(?:\.\d{1,2})?$/.test(foodForm.donGia.trim());
    if (!validPriceFormat || !Number.isFinite(price) || price < 0 || price > MAX_FOOD_PRICE) {
      setFoodPriceError('Đơn giá bắt buộc, không âm và tối đa 10 chữ số nguyên cùng 2 chữ số thập phân.');
      return;
    }
    setFoodFormError('');
    setFoodPriceError('');
    setFoodCategoryError('');
    setFoodSaving(true);
    try {
      await saveFood({
        tenMonAn: foodForm.tenMonAn.trim(),
        loaiMon: foodForm.loaiMon,
        thanhPhan: foodForm.thanhPhan.trim() || null,
        donGia: price,
        trangThai: foodForm.trangThai === '' ? null : foodForm.trangThai === 'true',
      }, foodModal?.id);
      setFoodModal(null);
      setFoods(await getFoods());
      notify('success', 'Đã lưu món ăn', 'Danh mục món ăn đã được cập nhật.');
    } catch (error) {
      if (error?.status === 409) {
        setFoodFormError(errorMessage(error));
      } else {
        notify('error', 'Không thể lưu món ăn', errorMessage(error));
      }
    } finally {
      setFoodSaving(false);
    }
  };

  const toggleFoodStatus = async (food) => {
    setWorkingId(food.maMonAn);
    try {
      await updateFoodStatus(food.maMonAn, food.trangThai !== true);
      setFoods(await getFoods());
      notify('success', 'Đã cập nhật trạng thái', `Món "${food.tenMonAn}" đã được cập nhật.`);
    } catch (error) {
      notify('error', 'Không thể cập nhật món ăn', errorMessage(error));
    } finally {
      setWorkingId(null);
    }
  };

  const openFoodDeleteConfirmation = (food) => {
    setFoodDeleteError('');
    setFoodDeleteTarget(food);
  };

  const closeFoodDeleteConfirmation = () => {
    if (!foodDeleting) {
      setFoodDeleteError('');
      setFoodDeleteTarget(null);
    }
  };

  const handleDeleteFood = async () => {
    if (!foodDeleteTarget || foodDeleting) return;
    const target = foodDeleteTarget;
    setFoodDeleteError('');
    setFoodDeleting(true);
    try {
      await deleteFood(target.maMonAn);
      setFoods((currentFoods) => currentFoods.filter((food) => food.maMonAn !== target.maMonAn));
      const remainingFilteredCount = filteredFoods.length
        - (filteredFoods.some((food) => food.maMonAn === target.maMonAn) ? 1 : 0);
      setFoodPage((page) => Math.min(page, Math.max(1, Math.ceil(remainingFilteredCount / PAGE_SIZE))));
      setFoodDeleteTarget(null);
      notify('success', 'Xóa món ăn thành công', `Món "${target.tenMonAn}" đã được xóa.`);
    } catch (error) {
      setFoodDeleteError(errorMessage(error));
    } finally {
      setFoodDeleting(false);
    }
  };

  const handlePrint = () => {
    if (!weekMenu || !menuDetails || isDetailsLoading) {
      notify('error', 'Chưa có dữ liệu để in', 'Hãy tải thành công thực đơn tuần trước khi in.');
      return;
    }
    window.print();
  };

  const closeMenu = () => {
    if (!menuSaving) setMenuModal(null);
  };
  const closeFood = () => {
    if (!foodSaving) setFoodModal(null);
  };
  const closeItem = () => {
    if (!savingItem) setItemModal(null);
  };

  return (
    <div className="page-container fade-in nutrition-management">
      <div className="page-header nutrition-screen-only">
        <div>
          <div className="page-badge"><Utensils size={14} /> DINH DƯỠNG & THỰC ĐƠN BÁN TRÚ</div>
          <h2>Quản lý thực đơn dinh dưỡng</h2>
        </div>
        <div className="header-actions nutrition-header-actions">
          <button className="btn-secondary" type="button" onClick={loadData} disabled={isLoading}>
            <RefreshCw size={16} /> Làm mới
          </button>
          <button className="btn-secondary" type="button" onClick={handlePrint} disabled={!menuDetails || isDetailsLoading}>
            <Printer size={16} /> In thực đơn
          </button>
          <button className="btn-primary" type="button" onClick={() => openMenuModal()}>
            <Plus size={18} /> Tạo thực đơn tuần
          </button>
        </div>
      </div>

      <div className="view-toggle nutrition-screen-only nutrition-tabs" role="tablist">
        <button
          className={`toggle-btn ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
          role="tab"
          aria-selected={activeTab === 'weekly'}
        >
          Lịch thực đơn
        </button>
        <button
          className={`toggle-btn ${activeTab === 'food_bank' ? 'active' : ''}`}
          onClick={() => setActiveTab('food_bank')}
          role="tab"
          aria-selected={activeTab === 'food_bank'}
        >
          Danh mục món ăn <span className="nutrition-count">{foods.length}</span>
        </button>
      </div>

      {loadError && (
        <div className="empty-state-hint nutrition-screen-only" role="alert">
          <AlertCircle size={18} /> {loadError}
          <button className="btn-secondary" type="button" onClick={loadData}>Thử lại</button>
        </div>
      )}

      {activeTab === 'weekly' && (
        <section className="nutrition-screen-only">
          <div className="nutrition-week-toolbar">
            <div className="nutrition-week-nav">
              <button type="button" className="btn-secondary" onClick={() => changeWeek(-1)} aria-label="Tuần trước">
                <ChevronLeft size={17} />
              </button>
              <div>
                <strong>{formatDate(weekStart)} – {formatDate(addDays(weekStart, 6))}</strong>
                <span>{weekMenu ? `Tuần ${weekMenu.tuanApDung}/${weekMenu.namApDung}` : 'Chưa có thực đơn cho tuần này'}</span>
              </div>
              <button type="button" className="btn-secondary" onClick={() => changeWeek(1)} aria-label="Tuần sau">
                <ChevronRight size={17} />
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  const current = dateString(startOfWeek(new Date()));
                  setWeekStart(current);
                  setSelectedDate(current);
                }}
              >
                Tuần hiện tại
              </button>
            </div>
            {weekMenu && (
              <div className="nutrition-menu-actions">
                <span className={`nutrition-status ${weekMenu.trangThai === true ? '' : 'inactive'}`}>
                  {weekMenu.trangThai === true ? 'Đang áp dụng' : weekMenu.trangThai === false ? 'Ngừng áp dụng' : 'Chưa xác định'}
                </span>
                <button className="btn-secondary" type="button" onClick={() => openMenuModal(weekMenu)}>
                  <Edit size={15} /> Sửa thực đơn
                </button>
                {(!menuDetails?.chiTiet?.length) && (
                  <button className="btn-secondary nutrition-delete-button" type="button" onClick={handleDeleteMenu} disabled={workingId === weekMenu.maThucDon}>
                    <Trash2 size={15} /> Xóa
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="nutrition-calendar" aria-label="Lịch ngày trong tuần">
            {weekDates.map(({ dayName, date, menu }) => {
              const hasItems = menuDetails?.chiTiet?.some((item) => item.ngayAn === date);
              const dayStatus = !menu
                ? 'Chưa có thực đơn'
                : menu.trangThai === false
                  ? 'Ngừng áp dụng'
                  : isDetailsLoading
                    ? 'Đang tải món'
                    : menuDetailResult?.error
                      ? 'Không tải được'
                      : hasItems ? 'Có món' : 'Chưa có món';
              return (
                <button
                  key={date}
                  type="button"
                  className={`nutrition-calendar-day ${selectedDate === date ? 'selected' : ''} ${hasItems ? 'has-items' : 'no-items'} ${menu?.trangThai === false ? 'inactive-menu' : ''}`}
                  aria-pressed={selectedDate === date}
                  onClick={() => setSelectedDate(date)}
                >
                  <span>{dayName}</span>
                  <strong>{formatDate(date, { day: 'numeric', month: 'short' })}</strong>
                  <small>{dayStatus}</small>
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <div className="empty-state-hint" role="status">Đang tải dữ liệu thực đơn...</div>
          ) : weekMenu ? (
            <>
              {weekMenu.ghiChu && <div className="nutrition-menu-note"><strong>Ghi chú:</strong> {weekMenu.ghiChu}</div>}
              {isDetailsLoading ? (
                <div className="empty-state-hint" role="status">Đang tải các món trong thực đơn...</div>
              ) : menuDetails ? (
                <div className="nutrition-day-content">
                  <div className="nutrition-day-heading">
                    <div>
                      <span><CalendarDays size={16} /> {WEEKDAYS[(localDate(selectedDate).getDay() + 6) % 7]}</span>
                      <h3>{formatDate(selectedDate)}</h3>
                    </div>
                    <button className="btn-primary" type="button" onClick={() => openItemModal()}>
                      <Plus size={16} /> Thêm món vào ngày
                    </button>
                  </div>
                  {mealGroups.length ? (
                    <div className="nutrition-meals">
                      {mealGroups.map(([meal, items]) => (
                        <article className="nutrition-meal-card" key={meal}>
                          <header>
                            <div><Utensils size={18} /><h4>{meal}</h4><span>{items.length} món</span></div>
                            <button className="btn-secondary" type="button" onClick={() => openItemModal(null, meal)}>
                              <Plus size={14} /> Thêm món
                            </button>
                          </header>
                          <div className="nutrition-meal-items">
                            {items.map((item) => (
                              <div className="nutrition-food-row" key={item.maChiTietThucDon}>
                                <div className="nutrition-food-main">
                                  <strong>{item.monAn?.tenMonAn || 'Món ăn không có tên'}</strong>
                                  <span>
                                    {[item.monAn?.loaiMon, item.monAn?.thanhPhan].filter(Boolean).join(' · ') || 'Chưa có phân loại hoặc thành phần'}
                                  </span>
                                  {item.ghiChu && <small>Ghi chú: {item.ghiChu}</small>}
                                </div>
                                <div className="nutrition-food-actions">
                                  <strong>{item.donGia != null ? formatCurrency(item.donGia) : 'Chưa có đơn giá đã lưu'}</strong>
                                  <button className="btn-tbl" type="button" onClick={() => openItemModal(item)} title="Sửa món trong thực đơn" aria-label={`Sửa ${item.monAn?.tenMonAn || 'món ăn'}`}>
                                    <Edit size={15} />
                                  </button>
                                  <button className="btn-tbl delete" type="button" onClick={() => handleDeleteItem(item)} disabled={workingId === item.maChiTietThucDon} title="Xóa món khỏi thực đơn" aria-label={`Xóa ${item.monAn?.tenMonAn || 'món ăn'} khỏi thực đơn`}>
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="nutrition-empty-day">
                      <Utensils size={26} />
                      <strong>Chưa có món ăn trong ngày này</strong>
                      <span>Thêm món từ danh mục đang được sử dụng để bắt đầu xây dựng thực đơn.</span>
                      <button className="btn-primary" type="button" onClick={() => openItemModal()}>
                        <Plus size={16} /> Thêm món ăn
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-state-hint" role="alert">Không thể tải chi tiết thực đơn.</div>
              )}
            </>
          ) : (
            <div className="nutrition-empty-day">
              <CalendarDays size={28} />
              <strong>Chưa có thực đơn cho tuần đã chọn</strong>
              <span>Tạo thực đơn trước khi thêm món cho từng ngày.</span>
              <button className="btn-primary" type="button" onClick={() => openMenuModal()}>
                <Plus size={16} /> Tạo thực đơn tuần
              </button>
            </div>
          )}
        </section>
      )}

      {activeTab === 'food_bank' && (
        <section className="nutrition-screen-only nutrition-food-bank">
          <div className="nutrition-food-toolbar">
            <div className="nutrition-search">
              <Search size={17} />
              <input
                type="search"
                placeholder="Tìm tên món hoặc thành phần..."
                value={foodSearch}
                onChange={(event) => {
                  setFoodSearch(event.target.value);
                  setFoodPage(1);
                }}
              />
            </div>
            <select value={foodCategory} onChange={(event) => { setFoodCategory(event.target.value); setFoodPage(1); }} aria-label="Lọc loại món">
              <option value="ALL">Tất cả loại món</option>
              {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <select value={foodStatus} onChange={(event) => { setFoodStatusFilter(event.target.value); setFoodPage(1); }} aria-label="Lọc trạng thái món">
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang sử dụng</option>
              <option value="INACTIVE">Ngừng sử dụng</option>
              <option value="UNKNOWN">Chưa xác định</option>
            </select>
            <button className="btn-primary" type="button" onClick={() => openFoodModal()}>
              <Plus size={17} /> Thêm món ăn
            </button>
          </div>
          {foodsError && <div className="empty-state-hint" role="alert"><AlertCircle size={17} /> {foodsError}</div>}
          {isLoading ? (
            <div className="empty-state-hint" role="status">Đang tải danh mục món ăn...</div>
          ) : filteredFoods.length === 0 ? (
            <div className="nutrition-empty-day">
              <Utensils size={26} />
              <strong>{foods.length ? 'Không tìm thấy món ăn phù hợp' : 'Danh mục món ăn đang trống'}</strong>
              <span>{foods.length ? 'Thử đổi từ khóa hoặc bộ lọc.' : 'Thêm món ăn vào danh mục để sử dụng trong thực đơn.'}</span>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="custom-table nutrition-food-table">
                  <thead><tr><th>Mã món</th><th>Tên món ăn</th><th>Loại món</th><th>Thành phần</th><th>Đơn giá</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                  <tbody>
                    {visibleFoods.map((food) => (
                      <tr key={food.maMonAn}>
                        <td><strong>{food.maMonAn}</strong></td>
                        <td><strong>{food.tenMonAn || '—'}</strong></td>
                        <td>
                          {food.loaiMon
                            ? <span className="nutrition-food-category-badge">{food.loaiMon}</span>
                            : <span className="nutrition-muted-category">Chưa phân loại</span>}
                        </td>
                        <td className="nutrition-ingredients">{food.thanhPhan || 'Chưa cập nhật'}</td>
                        <td className="nutrition-food-price">
                          {food.donGia == null ? 'Chưa cập nhật' : formatCurrency(food.donGia)}
                        </td>
                        <td><span className={`nutrition-status ${food.trangThai === true ? '' : 'inactive'}`}>{food.trangThai === true ? 'Đang sử dụng' : food.trangThai === false ? 'Ngừng sử dụng' : 'Chưa xác định'}</span></td>
                        <td>
                          <div className="action-buttons-cell">
                            <button className="btn-tbl view" type="button" title="Xem chi tiết" onClick={() => openFoodModal(food, 'view')}><Eye size={15} /></button>
                            <button className="btn-tbl" type="button" title="Sửa món ăn" onClick={() => openFoodModal(food, 'edit')}><Edit size={15} /></button>
                            <button
                              className="btn-tbl delete"
                              type="button"
                              title="Xóa món ăn"
                              aria-label={`Xóa món ${food.tenMonAn}`}
                              onClick={() => openFoodDeleteConfirmation(food)}
                              disabled={foodDeleting || workingId === food.maMonAn}
                            >
                              <Trash2 size={15} />
                            </button>
                            <button
                              className="btn-secondary nutrition-status-action"
                              type="button"
                              onClick={() => toggleFoodStatus(food)}
                              disabled={workingId === food.maMonAn}
                            >
                              {food.trangThai === true ? 'Ngừng dùng' : 'Kích hoạt'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {foodPageCount > 1 && (
                <div className="nutrition-pagination">
                  <button className="btn-secondary" type="button" onClick={() => setFoodPage((page) => Math.max(1, page - 1))} disabled={foodPage === 1}>Trước</button>
                  <span>Trang {foodPage}/{foodPageCount} · {filteredFoods.length} món</span>
                  <button className="btn-secondary" type="button" onClick={() => setFoodPage((page) => Math.min(foodPageCount, page + 1))} disabled={foodPage === foodPageCount}>Sau</button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {weekMenu && menuDetails && (
        <section className="nutrition-print-area" aria-hidden="true">
          <header>
            <h1>Thực đơn dinh dưỡng tuần {weekMenu.tuanApDung}/{weekMenu.namApDung}</h1>
            <p>Thời gian áp dụng: {formatDate(weekMenu.ngayBatDau)} – {formatDate(weekMenu.ngayKetThuc)}</p>
            {weekMenu.ghiChu && <p>Ghi chú: {weekMenu.ghiChu}</p>}
          </header>
          {weekDates.map(({ dayName, date }) => {
            const items = (menuDetails.chiTiet || []).filter((item) => item.ngayAn === date);
            const groups = new Map();
            items.forEach((item) => {
              const meal = item.buaAn || 'Bữa ăn chưa phân loại';
              if (!groups.has(meal)) groups.set(meal, []);
              groups.get(meal).push(item);
            });
            const sortedGroups = sortMealGroups(groups);
            return (
              <article className="nutrition-print-day" key={date}>
                <h2>{dayName} · {formatDate(date)}</h2>
                {sortedGroups.length ? sortedGroups.map(([meal, mealItems]) => (
                  <div key={meal} className="nutrition-print-meal">
                    <h3>{meal}</h3>
                    <ul>{mealItems.map((item) => (
                      <li key={item.maChiTietThucDon}>
                        {item.monAn?.tenMonAn}
                        {item.monAn?.loaiMon ? ` (${item.monAn.loaiMon})` : ''}
                        {item.donGia != null ? ` — ${formatCurrency(item.donGia)}` : ' — Chưa có đơn giá đã lưu'}
                        {item.ghiChu ? ` — ${item.ghiChu}` : ''}
                      </li>
                    ))}</ul>
                  </div>
                )) : <p>Chưa có món ăn.</p>}
              </article>
            );
          })}
        </section>
      )}

      <Modal
        isOpen={Boolean(menuModal)}
        onClose={closeMenu}
        title={menuModal?.id ? 'Cập nhật thực đơn tuần' : 'Tạo thực đơn tuần'}
        maxWidth="620px"
        footer={(
          <div className="modal-buttons">
            <button className="btn-secondary" type="button" onClick={closeMenu} disabled={menuSaving}>Hủy</button>
            <button className="btn-primary" type="submit" form="nutrition-menu-form" disabled={menuSaving}>
              <CheckCircle2 size={16} /> {menuSaving ? 'Đang lưu...' : 'Lưu thực đơn'}
            </button>
          </div>
        )}
      >
        <form id="nutrition-menu-form" onSubmit={handleMenuSubmit} className="modal-form-grid">
          <div className="form-group">
            <label htmlFor="nutrition-menu-start">Ngày bắt đầu (thứ Hai) *</label>
            <input
              id="nutrition-menu-start"
              type="date"
              value={menuForm.ngayBatDau}
              required
              onChange={(event) => {
                if (!event.target.value) return;
                const monday = dateString(startOfWeek(localDate(event.target.value)));
                setMenuForm({ ...menuForm, ngayBatDau: monday, ngayKetThuc: addDays(monday, 6) });
              }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="nutrition-menu-end">Ngày kết thúc (Chủ nhật) *</label>
            <input id="nutrition-menu-end" type="date" value={menuForm.ngayKetThuc} readOnly />
          </div>
          <div className="form-group">
            <label>Tuần áp dụng (tuần ISO)</label>
            <input value={fullNameForWeek(menuForm.ngayBatDau).week} readOnly />
          </div>
          <div className="form-group">
            <label>Tháng / năm áp dụng</label>
            <input value={`${fullNameForWeek(menuForm.ngayBatDau).month}/${fullNameForWeek(menuForm.ngayBatDau).year}`} readOnly />
          </div>
          <div className="form-group col-2">
            <label htmlFor="nutrition-menu-status">Trạng thái</label>
            <select id="nutrition-menu-status" value={menuForm.trangThai} onChange={(event) => setMenuForm({ ...menuForm, trangThai: event.target.value })}>
              <option value="">Chưa xác định</option>
              <option value="true">Đang áp dụng</option>
              <option value="false">Ngừng áp dụng</option>
            </select>
          </div>
          <div className="form-group col-2">
            <label htmlFor="nutrition-menu-note">Ghi chú (tối đa 255 ký tự)</label>
            <textarea id="nutrition-menu-note" maxLength={255} rows={3} value={menuForm.ghiChu} onChange={(event) => setMenuForm({ ...menuForm, ghiChu: event.target.value })} />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(itemModal)}
        onClose={closeItem}
        title={itemModal?.id ? 'Cập nhật món trong thực đơn' : 'Thêm món vào thực đơn'}
        maxWidth="620px"
        footer={(
          <div className="modal-buttons">
            <button className="btn-secondary" type="button" onClick={closeItem} disabled={savingItem}>Hủy</button>
            <button className="btn-primary" type="submit" form="nutrition-item-form" disabled={savingItem || selectableFoods.length === 0 || selectedItemHasNoPrice}>
              <CheckCircle2 size={16} /> {savingItem ? 'Đang lưu...' : 'Lưu món'}
            </button>
          </div>
        )}
      >
        <form id="nutrition-item-form" onSubmit={handleItemSubmit} className="modal-form-grid">
          {selectableFoods.length === 0 && <div className="empty-state-hint col-2">Chưa có món đang sử dụng trong danh mục. Hãy thêm hoặc kích hoạt món ăn trước.</div>}
          <div className="form-group col-2">
            <label htmlFor="nutrition-item-search">Tìm món ăn</label>
            <input id="nutrition-item-search" type="search" value={itemQuery} onChange={(event) => setItemQuery(event.target.value)} placeholder="Nhập tên món..." />
          </div>
          <div className="form-group col-2">
            <label htmlFor="nutrition-item-food">Món ăn *</label>
            <select
              id="nutrition-item-food"
              value={itemForm.maMonAn}
              onChange={(event) => {
                const maMonAn = event.target.value;
                const food = foods.find((candidate) => String(candidate.maMonAn) === maMonAn);
                const donGia = itemModal?.id
                  && Number(itemModal.originalFoodId) === Number(maMonAn)
                  ? itemModal.originalPrice
                  : food?.donGia ?? '';
                setItemForm((current) => ({
                  ...current,
                  maMonAn,
                  donGia,
                }));
              }}
              required
            >
              <option value="">Chọn món ăn</option>
              {originalItemFood && !filteredSelectableFoods.some(
                (food) => food.maMonAn === originalItemFood.maMonAn,
              ) && (
                  <option value={originalItemFood.maMonAn}>
                    {originalItemFood.tenMonAn}{originalItemFood.loaiMon ? ` · ${originalItemFood.loaiMon}` : ''}
                  </option>
                )}
              {filteredSelectableFoods.map((food) => <option key={food.maMonAn} value={food.maMonAn}>{food.tenMonAn}{food.loaiMon ? ` · ${food.loaiMon}` : ''}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="nutrition-item-date">Ngày ăn *</label>
            <input id="nutrition-item-date" type="date" min={weekMenu?.ngayBatDau} max={weekMenu?.ngayKetThuc} value={itemForm.ngayAn} onChange={(event) => setItemForm({ ...itemForm, ngayAn: event.target.value })} required />
          </div>
          <div className="form-group">
            <label htmlFor="nutrition-item-meal">Bữa ăn *</label>
            <div className="nutrition-select-wrap">
              <select
                id="nutrition-item-meal"
                value={itemForm.buaAn}
                onChange={(event) => setItemForm({ ...itemForm, buaAn: event.target.value })}
                required
              >
                <option value="">Chọn bữa ăn</option>
                {itemForm.buaAn && !MEAL_OPTIONS.includes(itemForm.buaAn) && (
                  <option value={itemForm.buaAn}>{itemForm.buaAn} (giá trị hiện tại)</option>
                )}
                {MEAL_OPTIONS.map((meal) => <option key={meal} value={meal}>{meal}</option>)}
              </select>
              <ChevronDown size={17} aria-hidden="true" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="nutrition-item-price">Đơn giá (₫)</label>
            <input
              id="nutrition-item-price"
              type="text"
              value={itemForm.donGia === ''
                ? (itemForm.maMonAn ? 'Chưa có đơn giá đã lưu' : '')
                : formatCurrency(itemForm.donGia)}
              placeholder="Chọn món ăn để xem đơn giá"
              readOnly
            />
            {selectedItemHasNoPrice && (
              <small className="nutrition-field-error" role="alert">
                Món ăn chưa có đơn giá. Hãy cập nhật danh mục món ăn trước khi lưu.
              </small>
            )}
          </div>
          <div className="form-group col-2">
            <label htmlFor="nutrition-item-note">Ghi chú (tối đa 255 ký tự)</label>
            <textarea id="nutrition-item-note" maxLength={255} rows={3} value={itemForm.ghiChu} onChange={(event) => setItemForm({ ...itemForm, ghiChu: event.target.value })} />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(foodModal)}
        onClose={closeFood}
        title={foodModal?.mode === 'view' ? 'Chi tiết món ăn' : foodModal?.id ? 'Cập nhật món ăn' : 'Thêm món ăn'}
        maxWidth="600px"
        footer={(
          <div className="modal-buttons">
            <button className="btn-secondary" type="button" onClick={closeFood} disabled={foodSaving}>Đóng</button>
            {foodModal?.mode !== 'view' && (
              <button className="btn-primary" type="submit" form="nutrition-food-form" disabled={foodSaving}>
                <CheckCircle2 size={16} /> {foodSaving ? 'Đang lưu...' : 'Lưu món ăn'}
              </button>
            )}
          </div>
        )}
      >
        {foodModal?.mode === 'view' ? (
          <div className="nutrition-food-detail">
            <div><span>Mã món</span><strong>{foodModal.id}</strong></div>
            <div><span>Tên món</span><strong>{foodForm.tenMonAn || '—'}</strong></div>
            <div><span>Loại món</span><strong>{foodForm.loaiMon || 'Chưa phân loại'}</strong></div>
            <div><span>Thành phần</span><strong>{foodForm.thanhPhan || 'Chưa cập nhật'}</strong></div>
            <div><span>Đơn giá</span><strong>{foodForm.donGia === '' ? 'Chưa cập nhật' : formatCurrency(foodForm.donGia)}</strong></div>
            <div><span>Trạng thái</span><strong>{foodForm.trangThai === 'true' ? 'Đang sử dụng' : foodForm.trangThai === 'false' ? 'Ngừng sử dụng' : 'Chưa xác định'}</strong></div>
          </div>
        ) : (
          <form id="nutrition-food-form" onSubmit={handleFoodSubmit} className="modal-form-grid">
            <div className="form-group col-2">
              <label htmlFor="nutrition-food-name">Tên món ăn *</label>
              <input
                id="nutrition-food-name"
                maxLength={100}
                value={foodForm.tenMonAn}
                onChange={(event) => {
                  setFoodForm({ ...foodForm, tenMonAn: event.target.value });
                  if (event.target.value.trim()) setFoodFormError('');
                }}
                aria-invalid={Boolean(foodFormError)}
                aria-describedby={foodFormError ? 'nutrition-food-name-error' : undefined}
                required
              />
              {foodFormError && (
                <small id="nutrition-food-name-error" className="nutrition-field-error" role="alert">
                  {foodFormError}
                </small>
              )}
            </div>
            <div className="form-group col-2">
              <label htmlFor="nutrition-food-category">Loại món ăn *</label>
              <div className={`nutrition-select-wrap ${foodCategoryError ? 'has-error' : ''}`}>
                <select
                  id="nutrition-food-category"
                  value={foodForm.loaiMon}
                  onChange={(event) => {
                    setFoodForm({ ...foodForm, loaiMon: event.target.value });
                    if (event.target.value) setFoodCategoryError('');
                  }}
                  onInvalid={(event) => {
                    event.preventDefault();
                    setFoodCategoryError('Vui lòng chọn loại món ăn trước khi lưu.');
                  }}
                  aria-invalid={Boolean(foodCategoryError)}
                  aria-describedby={foodCategoryError ? 'nutrition-food-category-error' : undefined}
                  required
                >
                  <option value="">Chọn loại món</option>
                  {foodForm.loaiMon && !categoryOptions.includes(foodForm.loaiMon) && (
                    <option value={foodForm.loaiMon}>{foodForm.loaiMon} (giá trị hiện tại)</option>
                  )}
                  {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
                <ChevronDown size={17} aria-hidden="true" />
              </div>
              {foodCategoryError && (
                <small id="nutrition-food-category-error" className="nutrition-field-error" role="alert">
                  {foodCategoryError}
                </small>
              )}
            </div>
            <div className="form-group col-2">
              <label htmlFor="nutrition-food-price">Đơn giá (VNĐ) *</label>
              <input
                id="nutrition-food-price"
                type="number"
                min="0"
                max={MAX_FOOD_PRICE}
                step="0.01"
                value={foodForm.donGia}
                onChange={(event) => {
                  setFoodForm({ ...foodForm, donGia: event.target.value });
                  if (event.target.value !== '') setFoodPriceError('');
                }}
                placeholder="Ví dụ: 12000"
                aria-invalid={Boolean(foodPriceError)}
                aria-describedby={foodPriceError ? 'nutrition-food-price-error' : undefined}
                required
              />
              {foodPriceError && (
                <small id="nutrition-food-price-error" className="nutrition-field-error" role="alert">
                  {foodPriceError}
                </small>
              )}
            </div>
            <div className="form-group col-2">
              <label htmlFor="nutrition-food-ingredients">Thành phần (tối đa 500 ký tự)</label>
              <textarea id="nutrition-food-ingredients" maxLength={500} rows={4} value={foodForm.thanhPhan} onChange={(event) => setFoodForm({ ...foodForm, thanhPhan: event.target.value })} />
            </div>
            <div className="form-group col-2">
              <label htmlFor="nutrition-food-status">Trạng thái</label>
              <select id="nutrition-food-status" value={foodForm.trangThai} onChange={(event) => setFoodForm({ ...foodForm, trangThai: event.target.value })}>
                <option value="">Chưa xác định</option>
                <option value="true">Đang sử dụng</option>
                <option value="false">Ngừng sử dụng</option>
              </select>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(foodDeleteTarget)}
        onClose={closeFoodDeleteConfirmation}
        title="Xác nhận xóa món ăn"
        maxWidth="480px"
        footer={(
          <div className="modal-buttons">
            <button
              className="btn-secondary"
              type="button"
              onClick={closeFoodDeleteConfirmation}
              disabled={foodDeleting}
            >
              Hủy
            </button>
            <button
              className="btn-primary nutrition-confirm-delete"
              type="button"
              onClick={handleDeleteFood}
              disabled={foodDeleting}
            >
              <Trash2 size={16} /> {foodDeleting ? 'Đang xóa...' : 'Xóa'}
            </button>
          </div>
        )}
      >
        <p className="nutrition-delete-confirmation">
          Bạn có chắc chắn muốn xóa món ăn này không?
        </p>
        <p className="nutrition-delete-guidance">
          Nếu món đang được sử dụng trong thực đơn, hãy gỡ món khỏi các thực đơn liên quan trước khi xóa.
        </p>
        {foodDeleteError && (
          <div className="empty-state-hint nutrition-delete-error" role="alert">
            <AlertCircle size={17} /> {foodDeleteError}
          </div>
        )}
      </Modal>
    </div>
  );
}
