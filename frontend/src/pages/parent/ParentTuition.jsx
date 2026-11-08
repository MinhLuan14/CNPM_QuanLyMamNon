import { useRef, useState } from 'react'
import {
  AlertCircle,
  Building2,
  CreditCard,
  Eye,
  FileText,
  QrCode,
  RefreshCw,
  Wallet,
  X,
} from 'lucide-react'
import { createInvoiceQr } from '../../api/hocPhi'

const money = (value) => `${new Intl.NumberFormat('vi-VN').format(value ?? 0)} ₫`
const isQrImage = (value) => /^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(value || '')
const dateLabel = (value) => {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Chưa cập nhật' : date.toLocaleDateString('vi-VN')
}
const dateTimeLabel = (value) => {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Chưa cập nhật' : date.toLocaleString('vi-VN')
}
const statusClass = (status) => {
  if (status === 'Đã thanh toán') return 'paid'
  if (status === 'Chưa thanh toán') return 'due'
  if (status?.toLocaleLowerCase('vi').includes('quá hạn')) return 'overdue'
  return 'other'
}

export default function ParentTuition({ invoices, children = [], isAvailable = true, error = '', onRetry }) {
  const [directInvoiceId, setDirectInvoiceId] = useState(null)
  const [qrPayment, setQrPayment] = useState(null)
  const [selectedChildId, setSelectedChildId] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [expandedInvoiceId, setExpandedInvoiceId] = useState(null)
  const qrRequestId = useRef(0)
  const filteredInvoices = invoices
    .filter((invoice) => !selectedChildId || String(invoice.childId) === selectedChildId)
    .filter((invoice) => !selectedMonth || String(invoice.monthNumber) === selectedMonth)
    .filter((invoice) => !selectedYear || String(invoice.year) === selectedYear)
    .filter((invoice) => !selectedStatus || invoice.status === selectedStatus)
    .slice()
    .sort((left, right) => (right.year - left.year)
      || (right.monthNumber - left.monthNumber)
      || (right.id - left.id))
  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0)
  const paidTotal = filteredInvoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0)
  const remainingTotal = filteredInvoices.reduce((sum, invoice) => sum + invoice.remainingAmount, 0)
  const paidCount = filteredInvoices.filter((invoice) => invoice.status === 'Đã thanh toán').length
  const unpaidCount = filteredInvoices.filter((invoice) => invoice.status === 'Chưa thanh toán').length
  const months = [...new Set(invoices.map((invoice) => invoice.monthNumber).filter(Number.isInteger))]
    .sort((left, right) => left - right)
  const years = [...new Set(invoices.map((invoice) => invoice.year).filter(Number.isInteger))]
    .sort((left, right) => right - left)
  const statuses = [...new Set(invoices.map((invoice) => invoice.status).filter(Boolean))]
    .sort((left, right) => left.localeCompare(right, 'vi'))

  const requestQr = async (invoice) => {
    const requestId = ++qrRequestId.current
    setDirectInvoiceId(null)
    setQrPayment({ invoice, loading: true, error: '', data: null })
    try {
      const data = await createInvoiceQr(invoice.id)
      if (requestId === qrRequestId.current) {
        setQrPayment({ invoice, loading: false, error: '', data })
      }
    } catch (requestError) {
      if (requestId === qrRequestId.current) {
        setQrPayment({
          invoice,
          loading: false,
          error: requestError.message || 'Không thể tạo mã QR. Vui lòng thử lại.',
          data: null,
        })
      }
    }
  }

  const closeQr = () => {
    qrRequestId.current += 1
    setQrPayment(null)
  }

  return (
    <div className="parent-page parent-tuition-page">
      <div className="parent-finance-summary">
        <article className="parent-stat-card"><span className="parent-stat-icon blue"><FileText size={20} /></span><div><span>Tổng số phiếu</span><strong>{isAvailable ? filteredInvoices.length : '—'}</strong></div></article>
        <article className="parent-stat-card"><span className="parent-stat-icon orange"><Wallet size={20} /></span><div><span>Tổng học phí</span><strong>{isAvailable ? money(totalAmount) : '—'}</strong></div></article>
        <article className="parent-stat-card"><span className="parent-stat-icon green"><CreditCard size={20} /></span><div><span>Đã thanh toán</span><strong>{isAvailable ? money(paidTotal) : '—'}</strong></div></article>
        <article className="parent-stat-card"><span className="parent-stat-icon orange"><Wallet size={20} /></span><div><span>Còn phải thanh toán</span><strong>{isAvailable ? money(remainingTotal) : '—'}</strong></div></article>
        <article className="parent-stat-card"><span className="parent-stat-icon orange"><AlertCircle size={20} /></span><div><span>Phiếu chưa thanh toán</span><strong>{isAvailable ? unpaidCount : '—'}</strong></div></article>
        <article className="parent-stat-card"><span className="parent-stat-icon green"><CreditCard size={20} /></span><div><span>Phiếu đã thanh toán</span><strong>{isAvailable ? paidCount : '—'}</strong></div></article>
      </div>
      {isAvailable && (
        <section className="parent-panel parent-invoice-filters" aria-label="Lọc phiếu học phí">
          <label>
            Bé
            <select value={selectedChildId} onChange={(event) => {
              setSelectedChildId(event.target.value)
              setExpandedInvoiceId(null)
            }}>
              <option value="">Tất cả các bé</option>
              {children.map((child) => <option key={child.id} value={child.id}>{child.fullName}</option>)}
            </select>
          </label>
          <label>
            Tháng
            <select value={selectedMonth} onChange={(event) => {
              setSelectedMonth(event.target.value)
              setExpandedInvoiceId(null)
            }}>
              <option value="">Tất cả tháng</option>
              {months.map((month) => <option key={month} value={month}>{month}</option>)}
            </select>
          </label>
          <label>
            Năm
            <select value={selectedYear} onChange={(event) => {
              setSelectedYear(event.target.value)
              setExpandedInvoiceId(null)
            }}>
              <option value="">Tất cả năm</option>
              {years.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>
          <label>
            Trạng thái
            <select value={selectedStatus} onChange={(event) => {
              setSelectedStatus(event.target.value)
              setExpandedInvoiceId(null)
            }}>
              <option value="">Tất cả trạng thái</option>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
        </section>
      )}
      <div className="parent-invoice-list">
        {!isAvailable ? (
          <section className="parent-panel parent-empty-large" role="alert">
            <AlertCircle size={28} />
            <h3>Chưa thể tải khoản thu</h3>
            <p>{error || 'Không thể tải danh sách học phí. Vui lòng thử lại.'}</p>
            {onRetry && <button type="button" className="parent-payment-button secondary" onClick={onRetry}>Thử tải lại</button>}
          </section>
        ) : invoices.length && filteredInvoices.length ? filteredInvoices.map((invoice) => (
          <article className="parent-panel parent-invoice-card" key={invoice.id}>
            <div className="parent-invoice-heading">
              <div>
                <small>KỲ {invoice.month}{invoice.className ? ` · ${invoice.className}` : ''}</small>
                <h3>{invoice.childName}</h3>
                <span className="parent-invoice-code">Mã phiếu thu: HP-{invoice.id}</span>
              </div>
              <span className={`parent-invoice-status ${statusClass(invoice.status)}`}>
                {invoice.status || 'Chưa cập nhật'}
              </span>
            </div>
            <div className="parent-fee-lines">
              <div className="parent-fee-row"><span>Ngày lập</span><strong>{dateLabel(invoice.createdAt)}</strong></div>
              <div className="parent-fee-row"><span>Hạn thanh toán</span><strong>{dateLabel(invoice.dueDate)}</strong></div>
              <div className="parent-fee-row parent-fee-total"><span>Tổng học phí</span><strong>{money(invoice.totalAmount)}</strong></div>
              <div className="parent-fee-row"><span>Đã ghi nhận</span><strong>{money(invoice.paidAmount)}</strong></div>
              <div className="parent-fee-row parent-fee-remaining"><span>Còn phải thanh toán</span><strong>{money(invoice.remainingAmount)}</strong></div>
            </div>
            <div className="parent-invoice-detail-actions">
              <button
                type="button"
                className="parent-payment-button secondary"
                onClick={() => setExpandedInvoiceId(expandedInvoiceId === invoice.id ? null : invoice.id)}
                aria-expanded={expandedInvoiceId === invoice.id}
              >
                <Eye size={16} /> {expandedInvoiceId === invoice.id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
              </button>
            </div>
            {expandedInvoiceId === invoice.id && (
              <div className="parent-invoice-detail">
                <h4>Chi tiết học phí</h4>
                {invoice.items.length ? (
                  <div className="parent-table-wrap">
                    <table className="parent-table">
                      <thead><tr><th>Loại phí</th><th>Nội dung</th><th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead>
                      <tbody>
                        {invoice.items.map((item) => (
                          <tr key={item.id}>
                            <td>{item.type || 'Chưa cập nhật'}</td>
                            <td>{item.description || 'Chưa cập nhật'}</td>
                            <td>{item.quantity ?? '—'}</td>
                            <td>{item.unitPrice == null ? '—' : money(item.unitPrice)}</td>
                            <td><strong>{item.amount == null ? 'Chưa cập nhật' : money(item.amount)}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot><tr><th colSpan="4">Tổng học phí</th><th>{money(invoice.totalAmount)}</th></tr></tfoot>
                    </table>
                  </div>
                ) : <p className="parent-empty-inline">Phiếu học phí chưa có chi tiết khoản thu.</p>}
                <h4>Lịch sử giao dịch của phiếu</h4>
                {invoice.payment ? (
                  <div className="parent-payment-history-detail">
                    <span>Mã thanh toán: {invoice.payment.id ?? 'Chưa cập nhật'}</span>
                    <span>Mã học phí: HP-{invoice.id}</span>
                    <span>Số tiền: {invoice.payment.amount == null ? 'Chưa cập nhật' : money(invoice.payment.amount)}</span>
                    <span>Phương thức: {invoice.payment.method || 'Chưa cập nhật'}</span>
                    <span>Mã giao dịch: {invoice.payment.transactionCode || 'Chưa cập nhật'}</span>
                    <span>Thời gian: {dateTimeLabel(invoice.payment.paidAt)}</span>
                    <span>Trạng thái: {invoice.payment.status || 'Chưa cập nhật'}</span>
                    <span>Nội dung: {invoice.payment.description || 'Chưa cập nhật'}</span>
                  </div>
                ) : <p className="parent-empty-inline">Phiếu học phí chưa có giao dịch thanh toán.</p>}
              </div>
            )}
            {invoice.remainingAmount > 0 && (
              invoice.hasRecordedPayment ? (
                <div className="parent-payment-note">
                  <AlertCircle size={16} />
                  <span>Phiếu thu đã có giao dịch ghi nhận. Vui lòng liên hệ nhà trường để đối chiếu khoản còn lại.</span>
                </div>
              ) : (
                <div className="parent-payment-actions">
                  <button
                    type="button"
                    className="parent-payment-button secondary"
                    onClick={() => {
                      closeQr()
                      setDirectInvoiceId(directInvoiceId === invoice.id ? null : invoice.id)
                    }}
                    aria-expanded={directInvoiceId === invoice.id}
                  >
                    <Building2 size={16} /> Thanh toán trực tiếp tại trường
                  </button>
                  <button
                    type="button"
                    className="parent-payment-button primary"
                    onClick={() => requestQr(invoice)}
                  >
                    <QrCode size={16} /> Thanh toán bằng QR
                  </button>
                  {directInvoiceId === invoice.id && (
                    <div className="parent-payment-note parent-direct-note">
                      <Building2 size={16} />
                      <span>Vui lòng đến văn phòng nhà trường để thanh toán và nhận xác nhận. Phiếu thu sẽ chỉ được cập nhật sau khi nhân viên ghi nhận khoản thu.</span>
                    </div>
                  )}
                </div>
              )
            )}
          </article>
        )) : (
          <section className="parent-panel parent-empty-large">
            <Wallet size={28} />
            <h3>{invoices.length ? 'Không có phiếu phù hợp' : 'Chưa có khoản thu'}</h3>
            <p>{invoices.length
              ? 'Thử thay đổi bộ lọc để xem các phiếu học phí khác.'
              : 'Phiếu học phí sẽ hiển thị tại đây sau khi nhà trường lập.'}</p>
          </section>
        )}
      </div>
      {qrPayment && (
        <div className="parent-qr-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeQr()
        }}>
          <section className="parent-qr-dialog" role="dialog" aria-modal="true" aria-labelledby="parent-qr-title">
            <div className="parent-qr-heading">
              <div><span className="parent-eyebrow">THANH TOÁN HỌC PHÍ</span><h3 id="parent-qr-title">Mã QR phiếu HP-{qrPayment.invoice.id}</h3></div>
              <button type="button" className="parent-qr-close" aria-label="Đóng" onClick={closeQr}><X size={20} /></button>
            </div>
            {qrPayment.loading ? (
              <div className="parent-qr-state" role="status"><RefreshCw size={22} className="parent-qr-spinner" /><p>Đang tạo mã QR...</p></div>
            ) : qrPayment.error ? (
              <div className="parent-qr-state parent-qr-error" role="alert">
                <AlertCircle size={24} /><p>{qrPayment.error}</p>
                <button type="button" className="parent-payment-button primary" onClick={() => requestQr(qrPayment.invoice)}>
                  <RefreshCw size={16} /> Thử lại
                </button>
              </div>
            ) : qrPayment.data && isQrImage(qrPayment.data.anhQrDataUri) ? (
              <>
                <div className="parent-qr-image-wrap">
                  <img src={qrPayment.data.anhQrDataUri} alt={`Mã QR thanh toán học phí phiếu HP-${qrPayment.invoice.id}`} />
                </div>
                <div className="parent-qr-details">
                  <div><span>Số tiền chuyển</span><strong>{money(qrPayment.data.soTien)}</strong></div>
                  <div><span>Ngân hàng</span><strong>{qrPayment.data.nganHang}</strong></div>
                  <div><span>Chủ tài khoản</span><strong>{qrPayment.data.tenChuTaiKhoan}</strong></div>
                  <div><span>Số tài khoản</span><strong>{qrPayment.data.soTaiKhoan}</strong></div>
                  <div className="parent-qr-transfer-info"><span>Nội dung chuyển khoản</span><strong>{qrPayment.data.noiDungChuyenKhoan}</strong></div>
                </div>
                <p className="parent-qr-waiting-note"><AlertCircle size={16} /> Sau khi chuyển khoản, vui lòng chờ nhà trường xác nhận. Tạo mã QR không đồng nghĩa với phiếu thu đã được thanh toán.</p>
              </>
            ) : (
              <div className="parent-qr-state parent-qr-error" role="alert">
                <AlertCircle size={24} /><p>Dữ liệu ảnh QR không hợp lệ. Vui lòng thử tạo lại.</p>
                <button type="button" className="parent-payment-button primary" onClick={() => requestQr(qrPayment.invoice)}>
                  <RefreshCw size={16} /> Thử lại
                </button>
              </div>
            )}
            <button type="button" className="parent-qr-back" onClick={closeQr}>Đóng và quay lại chi tiết phiếu thu</button>
          </section>
        </div>
      )}
    </div>
  )
}
