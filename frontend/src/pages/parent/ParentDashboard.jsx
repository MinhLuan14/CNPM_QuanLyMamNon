import {
  ArrowRight,
  Baby,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Utensils,
  Wallet,
} from 'lucide-react'

const money = (value) => new Intl.NumberFormat('vi-VN').format(value || 0) + ' đ'
const localDate = (value) => {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Chưa cập nhật' : date.toLocaleDateString('vi-VN')
}

export default function ParentDashboard({ portal, onNavigate }) {
  const menuPreview = portal.availability.menu ? portal.menu.slice(0, 3) : []
  const outstanding = portal.availability.invoices ? portal.invoices.filter((invoice) => invoice.remainingAmount > 0) : []
  const remainingTotal = outstanding.reduce((total, invoice) => total + invoice.remainingAmount, 0)

  return (
    <div className="parent-page">
      <section className="parent-welcome">
        <div className="parent-welcome-copy">
          <span className="parent-eyebrow">CÙNG CON LỚN KHÔN MỖI NGÀY</span>
          <h2>Xin chào, {portal.parent.fullName || 'Quý phụ huynh'}!</h2>
          <p>Theo dõi thông tin học tập và sinh hoạt của bé tại BabyShark.</p>
        </div>
        <div className="parent-welcome-icon"><Baby size={44} /></div>
      </section>

      <section className="parent-stat-grid" aria-label="Tóm tắt">
        <article className="parent-stat-card">
          <span className="parent-stat-icon blue"><Baby size={20} /></span>
          <div><span>Trẻ đang liên kết</span><strong>{portal.children.length}</strong></div>
        </article>
        <article className="parent-stat-card">
          <span className="parent-stat-icon orange"><Wallet size={20} /></span>
          <div><span>Khoản còn cần thanh toán</span><strong>{portal.availability.invoices ? money(remainingTotal) : 'Chưa hỗ trợ'}</strong></div>
        </article>
        <article className="parent-stat-card">
          <span className="parent-stat-icon green"><CreditCard size={20} /></span>
          <div><span>Giao dịch đã ghi nhận</span><strong>{portal.availability.payments ? portal.payments.length : 'Chưa hỗ trợ'}</strong></div>
        </article>
      </section>

      <div className="parent-dashboard-grid">
        <section className="parent-panel">
          <div className="parent-panel-heading">
            <div><Baby size={19} /><h3>Thông tin của bé</h3></div>
            <button className="parent-text-action" onClick={() => onNavigate('Hồ sơ của bé')}>
              Xem hồ sơ <ArrowRight size={15} />
            </button>
          </div>
          {portal.children.length ? (
            <div className="parent-child-list">
              {portal.children.map((child) => (
                <article className="parent-child-summary" key={child.id}>
                  <span className="parent-child-avatar">{child.fullName.slice(0, 1)}</span>
                  <div className="parent-child-info">
                    <strong>{child.fullName}</strong>
                    <span>{child.className || 'Chưa xếp lớp'}</span>
                    <small>Giáo viên: {child.teacherName || 'Chưa có dữ liệu'}</small>
                  </div>
                  <span className="parent-child-dob">{localDate(child.dateOfBirth)}</span>
                </article>
              ))}
            </div>
          ) : (
            <p className="parent-empty-inline">Tài khoản hiện chưa có trẻ được liên kết.</p>
          )}
        </section>

        <section className="parent-panel">
          <div className="parent-panel-heading">
            <div><Utensils size={19} /><h3>Thực đơn mẫu</h3></div>
            <button className="parent-text-action" onClick={() => onNavigate('Thực đơn')}>
              Xem thực đơn <ArrowRight size={15} />
            </button>
          </div>
          {menuPreview.length ? (
            <div className="parent-menu-preview">
              {menuPreview.map((item) => (
                <div className="parent-menu-row" key={item.id}>
                  <span>{item.meal || 'Bữa ăn'}</span>
                  <strong>{item.dish || 'Chưa có tên món'}</strong>
                  {item.ingredients && <small>{item.ingredients}</small>}
                </div>
              ))}
            </div>
          ) : (
            <div className="parent-empty">
              <CalendarDays size={22} />
              <p>{portal.availability.menu ? 'Nhà trường chưa cập nhật thực đơn cho hôm nay.' : 'Cổng phụ huynh chưa có API thực đơn để tải dữ liệu.'}</p>
            </div>
          )}
        </section>

        <section className="parent-panel">
          <div className="parent-panel-heading">
            <div><Clock3 size={19} /><h3>Học phí cần lưu ý</h3></div>
            <button className="parent-text-action" onClick={() => onNavigate('Học phí & tiền ăn')}>
              Chi tiết <ArrowRight size={15} />
            </button>
          </div>
          {outstanding.length ? (
            <div className="parent-invoice-preview">
              {outstanding.slice(0, 3).map((invoice) => (
                <div className="parent-invoice-row" key={invoice.id}>
                  <span><strong>{invoice.childName}</strong><small>Kỳ {invoice.month} · hạn {localDate(invoice.dueDate)}</small></span>
                  <b>{money(invoice.remainingAmount)}</b>
                </div>
              ))}
              <p className="parent-payment-note">Thanh toán trực tuyến chưa được kết nối. Vui lòng liên hệ văn phòng nhà trường.</p>
            </div>
          ) : (
            <div className="parent-empty parent-empty-success">
              <CheckCircle2 size={22} />
              <p>Không có khoản cần thanh toán được ghi nhận.</p>
            </div>
          )}
        </section>

        <section className="parent-panel">
          <div className="parent-panel-heading">
            <div><Bell size={19} /><h3>Thông báo từ nhà trường</h3></div>
            <button className="parent-text-action" onClick={() => onNavigate('Thông báo')}>
              Xem tất cả <ArrowRight size={15} />
            </button>
          </div>
          <div className="parent-empty">
            <Bell size={22} />
            <p>{portal.availability.notifications ? 'Chưa có thông báo.' : 'Chức năng thông báo chưa có API dữ liệu.'}</p>
          </div>
        </section>
      </div>
    </div>
  )
}
