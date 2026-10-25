import { CreditCard, History } from 'lucide-react'

const money = (value) => new Intl.NumberFormat('vi-VN').format(value || 0) + ' đ'
const dateTime = (value) => {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Chưa cập nhật' : date.toLocaleString('vi-VN')
}

export default function ParentPaymentHistory({ payments, isAvailable = true }) {
  return (
    <div className="parent-page">
      <div className="parent-page-intro">
        <span className="parent-eyebrow">GIAO DỊCH CỦA GIA ĐÌNH</span>
        <h2>Lịch sử thanh toán</h2>
        <p>Các giao dịch được nhà trường ghi nhận cho hồ sơ phụ huynh của bạn.</p>
      </div>
      <section className="parent-panel parent-history-panel">
        {!isAvailable ? (
          <div className="parent-empty-large"><History size={28} /><h3>Chưa thể tải giao dịch</h3><p>API thanh toán hiện chưa hỗ trợ truy vấn theo tài khoản phụ huynh.</p></div>
        ) : payments.length ? (
          <div className="parent-table-wrap">
            <table className="parent-table">
              <thead><tr><th>Thời gian</th><th>Bé</th><th>Kỳ thu</th><th>Phương thức</th><th>Mã giao dịch</th><th>Số tiền</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{dateTime(payment.paidAt)}</td>
                    <td>{payment.childName}</td>
                    <td>{payment.month}</td>
                    <td>{payment.method || 'Chưa cập nhật'}</td>
                    <td>{payment.transactionCode || '—'}</td>
                    <td><strong>{money(payment.amount)}</strong></td>
                    <td><span className="parent-history-status">{payment.status || 'Đã ghi nhận'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="parent-empty-large"><History size={28} /><h3>Chưa có giao dịch</h3><p>Lịch sử thanh toán sẽ xuất hiện sau khi giao dịch được nhà trường ghi nhận.</p></div>
        )}
      </section>
      <p className="parent-history-note"><CreditCard size={15} /> Nếu thông tin giao dịch chưa chính xác, vui lòng liên hệ nhà trường.</p>
    </div>
  )
}
