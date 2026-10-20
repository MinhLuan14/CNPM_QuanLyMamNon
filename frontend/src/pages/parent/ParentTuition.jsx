import { AlertCircle, CreditCard, Wallet } from 'lucide-react'

const money = (value) => new Intl.NumberFormat('vi-VN').format(value || 0) + ' đ'
const dateLabel = (value) => {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Chưa cập nhật' : date.toLocaleDateString('vi-VN')
}

export default function ParentTuition({ invoices }) {
  const remainingTotal = invoices.reduce((sum, invoice) => sum + invoice.remainingAmount, 0)
  const paidTotal = invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0)

  return (
    <div className="parent-page">
      <div className="parent-page-intro">
        <span className="parent-eyebrow">MINH BẠCH & DỄ THEO DÕI</span>
        <h2>Học phí & tiền ăn</h2>
        <p>Các khoản thu và giao dịch được ghi nhận cho trẻ liên kết với tài khoản.</p>
      </div>
      <div className="parent-finance-summary">
        <article className="parent-stat-card"><span className="parent-stat-icon orange"><Wallet size={20} /></span><div><span>Còn cần thanh toán</span><strong>{money(remainingTotal)}</strong></div></article>
        <article className="parent-stat-card"><span className="parent-stat-icon green"><CreditCard size={20} /></span><div><span>Đã thanh toán ghi nhận</span><strong>{money(paidTotal)}</strong></div></article>
      </div>
      <div className="parent-invoice-list">
        {invoices.length ? invoices.map((invoice) => (
          <article className="parent-panel parent-invoice-card" key={invoice.id}>
            <div className="parent-invoice-heading">
              <div><small>KỲ {invoice.month}</small><h3>{invoice.childName}</h3></div>
              <span className={`parent-invoice-status ${invoice.remainingAmount > 0 ? 'due' : 'paid'}`}>
                {invoice.remainingAmount > 0 ? invoice.status || 'Còn phải thanh toán' : 'Đã thanh toán'}
              </span>
            </div>
            <div className="parent-fee-lines">
              {invoice.items.map((item, index) => (
                <div className="parent-fee-row" key={`${invoice.id}-${index}`}>
                  <span>{item.type || item.description || 'Khoản thu'}</span>
                  <strong>{money(item.amount)}</strong>
                </div>
              ))}
              <div className="parent-fee-row parent-fee-total"><span>Tổng học phí</span><strong>{money(invoice.totalAmount)}</strong></div>
              <div className="parent-fee-row"><span>Đã ghi nhận</span><strong>{money(invoice.paidAmount)}</strong></div>
              <div className="parent-fee-row parent-fee-remaining"><span>Còn lại · hạn {dateLabel(invoice.dueDate)}</span><strong>{money(invoice.remainingAmount)}</strong></div>
            </div>
            {invoice.remainingAmount > 0 && (
              <div className="parent-payment-note">
                <AlertCircle size={16} />
                <span>Thanh toán QR trực tuyến chưa được cấu hình. Vui lòng liên hệ văn phòng nhà trường để được hướng dẫn.</span>
              </div>
            )}
          </article>
        )) : (
          <section className="parent-panel parent-empty-large"><Wallet size={28} /><h3>Chưa có khoản thu</h3><p>Phiếu học phí sẽ hiển thị tại đây sau khi nhà trường lập.</p></section>
        )}
      </div>
    </div>
  )
}
