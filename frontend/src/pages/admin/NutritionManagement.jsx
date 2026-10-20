import { useState } from 'react';
import {
  Utensils,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Coffee,
  Sun,
  PieChart
} from 'lucide-react';
import { weeklyMenu, foodList } from '../../data/mockData';
import Modal from '../../components/Modal';

export default function NutritionManagement({ onShowToast }) {
  const menu = weeklyMenu;
  const [foods, setFoods] = useState(foodList);
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' | 'food_bank'
  const [selectedDay, setSelectedDay] = useState('Thứ 2');
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);

  // New Food form
  const [newFood, setNewFood] = useState({
    name: '',
    category: 'Món mặn trưa',
    calo: 220,
    allergen: 'Không',
    note: ''
  });

  const currentDayMenu = menu.find((m) => m.day === selectedDay) || menu[0];

  const handleAddFoodSubmit = (e) => {
    e.preventDefault();
    if (!newFood.name) {
      alert('Vui lòng nhập tên món ăn!');
      return;
    }

    const newId = `MA0${foods.length + 1}`;
    setFoods([...foods, { ...newFood, id: newId }]);
    setIsAddFoodModalOpen(false);
    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'Thành công',
        message: `Đã thêm món "${newFood.name}" vào danh mục món ăn!`
      });
    }
  };

  const handlePrintMenu = () => {
    window.print();
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <div className="page-badge">
            <Utensils size={14} /> DINH DƯỠNG & THỰC ĐƠN BÁN TRÚ
          </div>
          <h2>Thực Đơn Dinh Dưỡng Mầm Non</h2>
          <p>Kế hoạch bữa ăn cân bằng dinh dưỡng, kiểm soát dị ứng thực phẩm và calo cho từng độ tuổi</p>
        </div>

        <div className="header-actions">
          <button className="btn-secondary" onClick={handlePrintMenu}>
            <Printer size={16} /> In thực đơn tuần
          </button>
          <button className="btn-primary" onClick={() => setIsAddFoodModalOpen(true)}>
            <Plus size={18} /> Thêm món ăn mới
          </button>
        </div>
      </div>

      {/* Chuyển Tab */}
      <div className="view-toggle" style={{ marginBottom: '20px' }}>
        <button
          className={`toggle-btn ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          Lịch Thực Đơn Tuần Này
        </button>
        <button
          className={`toggle-btn ${activeTab === 'food_bank' ? 'active' : ''}`}
          onClick={() => setActiveTab('food_bank')}
        >
          Kho Món Ăn & Dị Ứng ({foods.length})
        </button>
      </div>

      {activeTab === 'weekly' && (
        <>
          {/* Nút chọn Thứ trong tuần */}
          <div className="week-day-tabs">
            {menu.map((item) => (
              <button
                key={item.day}
                className={`day-tab-btn ${selectedDay === item.day ? 'active' : ''}`}
                onClick={() => setSelectedDay(item.day)}
              >
                <div className="day-name">{item.day}</div>
                <div className="day-date">{item.date}</div>
              </button>
            ))}
          </div>

          {/* Chi tiết 3 bữa trong ngày */}
          <div className="meals-grid">
            {/* Bữa Sáng */}
            <div className="meal-card breakfast">
              <div className="meal-header">
                <div className="meal-icon-wrap">
                  <Sun size={20} className="text-orange" />
                </div>
                <div>
                  <h4>BỮA SÁNG (07:30 - 08:15)</h4>
                  <span className="meal-cal">{currentDayMenu.breakfast.calories}</span>
                </div>
              </div>

              <div className="meal-body">
                <div className="food-item-box">
                  <div className="food-label">Món chính buổi sáng:</div>
                  <div className="food-name">🍜 {currentDayMenu.breakfast.dish}</div>
                </div>

                <div className="food-item-box">
                  <div className="food-label">Thức uống kèm:</div>
                  <div className="food-name">🥛 {currentDayMenu.breakfast.beverage}</div>
                </div>
              </div>

              <div className="meal-footer">
                <span>Năng lượng khởi đầu ngày mới cho trẻ</span>
              </div>
            </div>

            {/* Bữa Trưa */}
            <div className="meal-card lunch">
              <div className="meal-header">
                <div className="meal-icon-wrap">
                  <Utensils size={20} className="text-blue" />
                </div>
                <div>
                  <h4>BỮA TRƯA CHÍNH (11:00 - 11:45)</h4>
                  <span className="meal-cal">{currentDayMenu.lunch.calories}</span>
                </div>
              </div>

              <div className="meal-body">
                <div className="food-item-box">
                  <div className="food-label">Món mặn giàu đạm:</div>
                  <div className="food-name">🍗 {currentDayMenu.lunch.main}</div>
                </div>

                <div className="food-item-box">
                  <div className="food-label">Món canh rau củ:</div>
                  <div className="food-name">🍲 {currentDayMenu.lunch.soup}</div>
                </div>

                <div className="food-item-box">
                  <div className="food-label">Cơm dẻo & Món xào:</div>
                  <div className="food-name">🍚 {currentDayMenu.lunch.side}</div>
                </div>

                <div className="food-item-box">
                  <div className="food-label">Tráng miệng tươi ngon:</div>
                  <div className="food-name">🍌 {currentDayMenu.lunch.dessert}</div>
                </div>
              </div>

              <div className="meal-footer">
                <span>Cung cấp 50% năng lượng hoạt động ngày của trẻ</span>
              </div>
            </div>

            {/* Bữa Xế */}
            <div className="meal-card snack">
              <div className="meal-header">
                <div className="meal-icon-wrap">
                  <Coffee size={20} className="text-purple" />
                </div>
                <div>
                  <h4>BỮA XẾ CHIỀU (14:30 - 15:00)</h4>
                  <span className="meal-cal">{currentDayMenu.afternoonSnack.calories}</span>
                </div>
              </div>

              <div className="meal-body">
                <div className="food-item-box">
                  <div className="food-label">Món nhẹ dinh dưỡng:</div>
                  <div className="food-name">🍮 {currentDayMenu.afternoonSnack.dish}</div>
                </div>

                <div className="food-item-box">
                  <div className="food-label">Thức uống bổ dưỡng:</div>
                  <div className="food-name">🧃 {currentDayMenu.afternoonSnack.drink}</div>
                </div>
              </div>

              <div className="meal-footer">
                <span>Bồi dưỡng sau giấc ngủ trưa</span>
              </div>
            </div>
          </div>

          {/* Tỷ Lệ Dinh Dưỡng Khoa Học */}
          <div className="nutrition-balance-card">
            <div className="balance-header">
              <PieChart size={18} className="text-blue" />
              <h4>Cân Bằng Dinh Dưỡng Khẩu Phần Ăn Trong Ngày</h4>
            </div>
            <div className="ratio-badges">
              <span className="ratio-pill protein">
                Chất Đạm (Protein): <strong>{currentDayMenu.nutritionRatio.protein}</strong>
              </span>
              <span className="ratio-pill carbs">
                Tinh Bột (Carbohydrate): <strong>{currentDayMenu.nutritionRatio.carbs}</strong>
              </span>
              <span className="ratio-pill lipid">
                Chất Béo (Lipid): <strong>{currentDayMenu.nutritionRatio.lipid}</strong>
              </span>
            </div>
            <p className="ratio-note">
              * Thực đơn được các chuyên gia dinh dưỡng Viện Dinh Dưỡng Quốc Gia khuyến nghị cho độ tuổi mầm non (18 tháng - 6 tuổi).
            </p>
          </div>
        </>
      )}

      {/* Tab Kho Món Ăn */}
      {activeTab === 'food_bank' && (
        <div className="table-responsive fade-in">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Mã món</th>
                <th>Tên món ăn</th>
                <th>Phân loại</th>
                <th>Lượng Calo</th>
                <th>Cảnh báo Dị ứng</th>
                <th>Ghi chú chế biến</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((food) => (
                <tr key={food.id}>
                  <td><strong>{food.id}</strong></td>
                  <td><strong>{food.name}</strong></td>
                  <td><span className="badge-class">{food.category}</span></td>
                  <td><strong className="text-blue">{food.calo} kcal</strong></td>
                  <td>
                    {food.allergen !== 'Không' ? (
                      <span className="text-danger font-medium">
                        <AlertTriangle size={13} /> {food.allergen}
                      </span>
                    ) : (
                      <span className="text-green font-medium">An toàn</span>
                    )}
                  </td>
                  <td>{food.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Thêm Món Ăn Mới */}
      <Modal
        isOpen={isAddFoodModalOpen}
        onClose={() => setIsAddFoodModalOpen(false)}
        title="Thêm Món Ăn Mới Vào Thực Đơn"
        maxWidth="550px"
        footer={
          <div className="modal-buttons">
            <button className="btn-secondary" onClick={() => setIsAddFoodModalOpen(false)}>
              Hủy
            </button>
            <button className="btn-primary" onClick={handleAddFoodSubmit}>
              <CheckCircle2 size={16} /> Lưu món ăn
            </button>
          </div>
        }
      >
        <form onSubmit={handleAddFoodSubmit} className="modal-form-grid">
          <div className="form-group col-2">
            <label>Tên món ăn *</label>
            <input
              type="text"
              placeholder="VD: Canh cua rau mồng tơi"
              value={newFood.name}
              onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Bữa ăn / Phân loại</label>
            <select
              value={newFood.category}
              onChange={(e) => setNewFood({ ...newFood, category: e.target.value })}
            >
              <option value="Món ăn sáng">Món ăn sáng</option>
              <option value="Món mặn trưa">Món mặn trưa</option>
              <option value="Món canh">Món canh</option>
              <option value="Món xế chiều">Món xế chiều</option>
              <option value="Tráng miệng">Tráng miệng</option>
            </select>
          </div>

          <div className="form-group">
            <label>Lượng Calo ước tính (kcal)</label>
            <input
              type="number"
              value={newFood.calo}
              onChange={(e) => setNewFood({ ...newFood, calo: Number(e.target.value) })}
            />
          </div>

          <div className="form-group col-2">
            <label>Thành phần dị ứng (nếu có)</label>
            <input
              type="text"
              placeholder="VD: Tôm cua, đậu phộng, trứng, sữa bò... hoặc Không"
              value={newFood.allergen}
              onChange={(e) => setNewFood({ ...newFood, allergen: e.target.value })}
            />
          </div>

          <div className="form-group col-2">
            <label>Ghi chú chế biến cho nhà bếp</label>
            <input
              type="text"
              placeholder="VD: Thái nhỏ, nấu nhừ, hạn chế muối đường..."
              value={newFood.note}
              onChange={(e) => setNewFood({ ...newFood, note: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
