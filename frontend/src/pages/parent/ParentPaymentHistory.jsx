import { CreditCard, History } from 'lucide-react'
import ParentChildAvatar from '../../components/parent/ParentChildAvatar'

const money = (value) => `${new Intl.NumberFormat('vi-VN').format(value ?? 0)} ₫`
const dateTime = (value) => {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Chưa cập nhật' : date.toLocaleString('vi-VN')
}

const statusClass = (status) => {
  const value = status?.toLocaleLowerCase('vi') || ''
  if (value.includes('thành công') || value.includes('thanh cong') || value.includes('hoàn thành') || value.includes('đã thanh toán')) {
    return 'success'
  }
  if (value.includes('đang xử lý') || value.includes('đang chờ') || value.includes('chờ xử lý') || value.includes('pending')) {
    return 'processing'
  }
  if (value.includes('thất bại') || value.includes('that bai') || value.includes('hủy') || value.includes('lỗi') || value.includes('failed')) {
    return 'failed'
  }
  return 'unknown'
}

export default function ParentPaymentHistory({ payments, children = [], isAvailable = true, error = '', onRetry }) {
  const childrenById = new Map(children.map((child) => [String(child.id), child]))

  return (
    <div className="parent-page parent-payment-history-page">
      <section className="parent-panel parent-history-panel">
        {!isAvailable ? (
          <div className="parent-empty-large" role="alert">
            <History size={28} />
            <h3>Chưa thể tải giao dịch</h3>
            <p>{error || 'Không thể tải lịch sử thanh toán. Vui lòng thử lại.'}</p>
            {onRetry && <button type="button" className="parent-payment-button secondary" onClick={onRetry}>Thử tải lại</button>}
          </div>
        ) : payments.length ? (
          <div className="parent-table-wrap">
            <table className="parent-table">
              <thead><tr><th>Mã thanh toán</th><th>Mã học phí</th><th>Thời gian</th><th>Bé</th><th>Kỳ thu</th><th>Số tiền</th><th>Phương thức</th><th>Mã giao dịch</th><th>Trạng thái</th><th>Nội dung</th></tr></thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.id ?? 'Chưa cập nhật'}</td>
                    <td>HP-{payment.invoiceId}</td>
                    <td>{dateTime(payment.paidAt)}</td>
                    <td>
                      <span className="parent-payment-child">
                        <ParentChildAvatar
                          child={childrenById.get(String(payment.childId))}
                          className="parent-history-child-avatar"
                        />
                        <span>{payment.childName}</span>
                      </span>
                    </td>
                    <td>{payment.month}</td>
                    <td className="parent-payment-amount"><strong>{payment.amount == null ? 'Chưa cập nhật' : money(payment.amount)}</strong></td>
                    <td>{payment.method || 'Chưa cập nhật'}</td>
                    <td>{payment.transactionCode || '—'}</td>
                    <td>
                      <span className={`parent-history-status ${statusClass(payment.status)}`}>
                        {payment.status || 'Chưa cập nhật'}
                      </span>
                    </td>
                    <td className="parent-payment-description">{payment.description || 'Chưa cập nhật'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="parent-empty-large"><History size={28} /><h3>Chưa có giao dịch</h3><p>Lịch sử thanh toán sẽ xuất hiện sau khi giao dịch được nhà trường ghi nhận.</p></div>
        )}
      </section>
      <p className="parent-history-note">
        <CreditCard size={16} aria-hidden="true" />
        <span>Nếu thông tin giao dịch chưa chính xác, vui lòng liên hệ nhà trường.</span>
      </p>
    </div>
  )
}
