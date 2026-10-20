import {
  Baby,
  GraduationCap,
  School,
  Wallet,
  CalendarDays,
  ArrowUpRight,
  TrendingUp,
  Clock,
  AlertCircle,
  Sparkles,
  Utensils,
  PlusCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import logoImg from '../../assets/Logo.png';

export default function Overview({ onNavigate }) {
  const currentDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const attendanceData = [
    { day: 'Thứ 2', present: 96, absent: 4 },
    { day: 'Thứ 3', present: 98, absent: 2 },
    { day: 'Thứ 4', present: 94, absent: 6 },
    { day: 'Thứ 5', present: 97, absent: 3 },
    { day: 'Thứ 6', present: 92, absent: 8 },
  ];

  const classSummary = [
    { name: 'Khối Nhà trẻ', count: 38, capacity: 42, color: '#ff7875', age: '18 - 36 tháng' },
    { name: 'Khối Mầm', count: 46, capacity: 50, color: '#ffc069', age: '3 - 4 tuổi' },
    { name: 'Khối Chồi', count: 53, capacity: 56, color: '#5cdbd3', age: '4 - 5 tuổi' },
    { name: 'Khối Lá', count: 57, capacity: 60, color: '#85a5ff', age: '5 - 6 tuổi' },
  ];

  return (
    <div className="dashboard-content fade-in">
      {/* Banner Chào Mừng */}
      <div className="welcome-banner">
        <div className="welcome-copy">
          <div className="welcome-tag">
            <Sparkles size={14} className="inline-icon" /> HỆ THỐNG MẦM NON THÔNG MINH BABYSHARK
          </div>
          <h2>Chào mừng trở lại, Ban Quản Trị!</h2>
          <p>
            "Cùng con lớn lên mỗi ngày ♡" — Hôm nay có <strong>178 / 186</strong> trẻ đã có mặt tại trường. 
            Mọi hoạt động chăm sóc, dinh dưỡng và học tập đang diễn ra an toàn & vui tươi!
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

      {/* 4 Thẻ Thống Kê Chính Nổi Bật */}
      <div className="stats-grid">
        <div className="stat-card stat-card-hover card-blue" onClick={() => onNavigate && onNavigate('Quản lý trẻ')}>
          <div className="stat-icon blue">
            <Baby size={24} />
          </div>
          <div className="stat-label">TỔNG SỐ HỌC SINH</div>
          <div className="stat-value text-blue">186 <span className="stat-sub">bé</span></div>
          <div className="stat-footer">
            <span>Đang theo học tại trường</span>
            <span className="stat-change blue"><ArrowUpRight size={13} /> +12 mới</span>
          </div>
        </div>

        <div className="stat-card stat-card-hover card-purple" onClick={() => onNavigate && onNavigate('Quản lý giáo viên')}>
          <div className="stat-icon purple">
            <GraduationCap size={24} />
          </div>
          <div className="stat-label">CÁN BỘ & GIÁO VIÊN</div>
          <div className="stat-value text-purple">24 <span className="stat-sub">cô</span></div>
          <div className="stat-footer">
            <span>100% đạt chuẩn Sư phạm</span>
            <span className="stat-change purple">8 lớp học</span>
          </div>
        </div>

        <div className="stat-card stat-card-hover card-orange" onClick={() => onNavigate && onNavigate('Quản lý lớp học')}>
          <div className="stat-icon orange">
            <School size={24} />
          </div>
          <div className="stat-label">LỚP HỌC ĐANG MỞ</div>
          <div className="stat-value text-orange">8 <span className="stat-sub">lớp</span></div>
          <div className="stat-footer">
            <span>Nhà trẻ • Mầm • Chồi • Lá</span>
            <span className="stat-change orange">Sĩ số 93%</span>
          </div>
        </div>

        <div className="stat-card stat-card-hover card-green" onClick={() => onNavigate && onNavigate('Học phí & tiền ăn')}>
          <div className="stat-icon green">
            <Wallet size={24} />
          </div>
          <div className="stat-label">HỌC PHÍ THÁNG 10/2026</div>
          <div className="stat-value text-green">748.2M <span className="stat-sub">VNĐ</span></div>
          <div className="stat-footer">
            <span>Đã thu 88.5% chỉ tiêu</span>
            <span className="stat-change green"><TrendingUp size={13} /> 165/186 bé</span>
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
              <p>Thống kê tỷ lệ chuyên cần từ Thứ 2 đến Thứ 6</p>
            </div>
            <div className="badge-pill bg-light-blue text-blue">Tuần 42</div>
          </div>

          <div className="chart-legend">
            <span><i className="legend-dot blue-dot" /> Có mặt (%)</span>
            <span><i className="legend-dot orange-dot" /> Nghỉ phép (%)</span>
          </div>

          <div className="chart">
            {attendanceData.map((item) => (
              <div key={item.day} className="chart-column">
                <div className="bar-pair">
                  <div
                    className="bar bar-blue"
                    style={{ height: `${item.present}%` }}
                    title={`Có mặt: ${item.present}%`}
                  />
                  <div
                    className="bar bar-orange"
                    style={{ height: `${item.absent * 5}%` }}
                    title={`Nghỉ: ${item.absent}%`}
                  />
                </div>
                <span>{item.day}</span>
              </div>
            ))}
          </div>

          <div className="chart-summary">
            <div>
              <span>Tỷ lệ đi học trung bình</span>
              <strong className="text-blue">95.4%</strong>
            </div>
            <div>
              <span>Tình trạng sức khỏe</span>
              <strong className="text-green">99% Tốt</strong>
            </div>
            <div>
              <span>Bé cần chăm sóc đặc biệt</span>
              <strong className="text-orange">3 bé</strong>
            </div>
          </div>

          {/* Phân bổ các khối mầm non */}
          <div className="class-breakdown-section">
            <h4 className="sub-title-bar">Sĩ số theo khối lớp hiện tại</h4>
            <div className="class-bars">
              {classSummary.map((cls) => {
                const percent = Math.round((cls.count / cls.capacity) * 100);
                return (
                  <div key={cls.name} className="class-bar-item">
                    <div className="class-bar-info">
                      <span><strong>{cls.name}</strong> ({cls.age})</span>
                      <span>{cls.count}/{cls.capacity} bé ({percent}%)</span>
                    </div>
                    <div className="progress-track">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${percent}%`, backgroundColor: cls.color }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cột 2: Hoạt động gần đây & Lịch ăn hôm nay */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Hoạt Động & Sự Kiện Gần Đây</h3>
              <p>Nhật ký diễn biến trong ngày tại trường mầm non</p>
            </div>
            <button className="text-link" onClick={() => onNavigate && onNavigate('Quản lý trẻ')}>
              Xem tất cả
            </button>
          </div>

          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon blue">
                <UserCheck size={18} />
              </div>
              <div className="activity-copy">
                <strong>Điểm danh & Đo thân nhiệt buổi sáng</strong>
                <span>Hoàn tất điểm danh 186/186 học sinh qua ứng dụng</span>
                <small><Clock size={12} /> 08:15 Hôm nay</small>
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-icon green">
                <Wallet size={18} />
              </div>
              <div className="activity-copy">
                <strong>Phụ huynh bé Hoàng Tuấn Kiệt đã nộp học phí</strong>
                <span>Thanh toán 4.020.000 VNĐ qua Chuyển khoản VietQR</span>
                <small><Clock size={12} /> 10:30 Hôm nay</small>
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-icon orange">
                <Utensils size={18} />
              </div>
              <div className="activity-copy">
                <strong>Bếp ăn hoàn tất chuẩn bị bữa trưa dinh dưỡng</strong>
                <span>Thực đơn: Thịt heo rim nước dừa, Canh rau ngót thịt băm, Chuối tiêu</span>
                <small><Clock size={12} /> 11:00 Hôm nay</small>
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-icon purple">
                <AlertCircle size={18} />
              </div>
              <div className="activity-copy">
                <strong>Nhắc nhở: Lớp Mầm 1 có bé Trần Bảo Ngọc dị ứng tôm</strong>
                <span>Nhà bếp đã chuẩn bị suất ăn thay thế an toàn cho bé</span>
                <small><Clock size={12} /> 11:15 Hôm nay</small>
              </div>
            </div>
          </div>

          {/* Hộp gợi ý dinh dưỡng hôm nay */}
          <div className="today-menu-widget">
            <div className="today-menu-header">
              <Utensils size={16} />
              <strong>Bữa xế chiều hôm nay (14:30)</strong>
            </div>
            <p className="today-menu-content">
              🍮 <strong>Bánh flan caramen béo ngậy</strong> + 🍉 <strong>Nước ép dưa hấu mát lành</strong>
            </p>
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
