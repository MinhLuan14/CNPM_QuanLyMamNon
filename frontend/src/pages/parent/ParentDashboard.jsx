import {
  ArrowRight,
  Baby,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Utensils,
  Wallet,
} from 'lucide-react'
import ParentChildAvatar from '../../components/parent/ParentChildAvatar'

const money = (value) => `${new Intl.NumberFormat('vi-VN').format(value ?? 0)} ₫`
const localDate = (value) => {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Chưa cập nhật' : date.toLocaleDateString('vi-VN')
}

export default function ParentDashboard({ portal, onNavigate }) {
  const menuPreview = portal.availability.menu ? portal.menu.slice(0, 3) : []
  const outstanding = portal.availability.invoices
    ? portal.invoices.filter((invoice) => invoice.remainingAmount > 0)
    : []
  const remainingTotal = outstanding.reduce((total, invoice) => total + invoice.remainingAmount, 0)
  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="parent-page parent-dashboard-page">
      <section className="parent-welcome">
        <div className="parent-welcome-copy">
          <span className="parent-eyebrow">CÙNG CON LỚN KHÔN MỖI NGÀY</span>
          <h2>Xin chào, {portal.parent.fullName || 'Quý phụ huynh'}!</h2>
          <p>Theo dõi thông tin học tập và sinh hoạt của các bé tại BabySharkEdu.</p>
          <div className="parent-welcome-date"><CalendarDays size={19} />{today}</div>
        </div>
        <div className="parent-welcome-quick" aria-label="Thông tin nhanh">
          <div className="parent-welcome-quick-item">
            <Baby size={23} />
            <span>Bé đang theo dõi</span>
            <strong>{portal.children.length}</strong>
          </div>
          <div className="parent-welcome-quick-item">
            <Wallet size={23} />
            <span>Cần thanh toán</span>
            <strong>{portal.availability.invoices ? money(remainingTotal) : 'Chưa cập nhật'}</strong>
          </div>
        </div>
      </section>

      <div className="parent-dashboard-grid">
        <section className="parent-panel parent-dashboard-panel parent-dashboard-children">
          <div className="parent-panel-heading">
            <div><Baby size={23} /><h3>Thông tin của bé</h3></div>
            <button type="button" className="parent-text-action" onClick={() => onNavigate('Hồ sơ của bé')}>
              Xem hồ sơ <ArrowRight size={18} />
            </button>
          </div>
          {portal.children.length ? (
            <div className="parent-child-list">
              {portal.children.map((child) => (
                <article className="parent-child-summary" key={child.id}>
                  <ParentChildAvatar child={child} className="parent-child-avatar" />
                  <div className="parent-child-info">
                    <strong>{child.fullName}</strong>
                    <span>{child.className || 'Chưa phân lớp'}</span>
                    <small>Giáo viên phụ trách: {child.teacherName || 'Chưa cập nhật'}</small>
                  </div>
                  <span className="parent-child-dob">Ngày sinh: {localDate(child.dateOfBirth)}</span>
                </article>
              ))}
            </div>
          ) : (
            <p className="parent-empty-inline">Tài khoản hiện chưa có trẻ được liên kết.</p>
          )}
        </section>

        <section className="parent-panel parent-dashboard-panel">
          <div className="parent-panel-heading">
            <div><Utensils size={23} /><h3>Thực đơn hôm nay</h3></div>
            <button type="button" className="parent-text-action" onClick={() => onNavigate('Thực đơn')}>
              Xem thực đơn <ArrowRight size={18} />
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
            <div className="parent-empty parent-dashboard-empty">
              <CalendarDays size={27} />
              <div>
                <strong>Chưa có thực đơn hôm nay</strong>
                <p>Thông tin thực đơn sẽ được cập nhật khi nhà trường công bố.</p>
              </div>
            </div>
          )}
        </section>

        <section className="parent-panel parent-dashboard-panel">
          <div className="parent-panel-heading">
            <div><Clock3 size={23} /><h3>Học phí cần lưu ý</h3></div>
            <button type="button" className="parent-text-action" onClick={() => onNavigate('Học phí & tiền ăn')}>
              Chi tiết <ArrowRight size={18} />
            </button>
          </div>
          {!portal.availability.invoices ? (
            <div className="parent-empty parent-dashboard-empty">
              <Wallet size={27} />
              <div>
                <strong>Chưa có thông tin học phí</strong>
                <p>Vui lòng thử lại tại mục học phí.</p>
              </div>
            </div>
          ) : outstanding.length ? (
            <div className="parent-invoice-preview">
              {outstanding.slice(0, 3).map((invoice) => (
                <div className="parent-invoice-row" key={invoice.id}>
                  <span>
                    <strong>{invoice.childName}</strong>
                    <small>Kỳ {invoice.month} · hạn {localDate(invoice.dueDate)}</small>
                  </span>
                  <b>{money(invoice.remainingAmount)}</b>
                </div>
              ))}
            </div>
          ) : (
            <div className="parent-empty parent-empty-success parent-dashboard-empty">
              <CheckCircle2 size={27} />
              <div>
                <strong>Không có khoản cần thanh toán</strong>
                <p>Hiện chưa ghi nhận học phí còn phải thanh toán.</p>
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
