import { useRef, useState } from 'react'
import { AlertCircle, Building2, CreditCard, QrCode, RefreshCw, Wallet, X } from 'lucide-react'
import { createInvoiceQr } from '../../api/hocPhi'

const money = (value) => new Intl.NumberFormat('vi-VN').format(value || 0) + ' đ'
const isQrImage = (value) => /^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(value || '')
const dateLabel = (value) => {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Chưa cập nhật' : date.toLocaleDateString('vi-VN')
}

export default function ParentTuition({ invoices, isAvailable = true, error = '', onRetry }) {
  const [directInvoiceId, setDirectInvoiceId] = useState(null)
  const [qrPayment, setQrPayment] = useState(null)
  const qrRequestId = useRef(0)
  const remainingTotal = isAvailable ? invoices.reduce((sum, invoice) => sum + invoice.remainingAmount, 0) : null
  const paidTotal = isAvailable ? invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0) : null

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
    <div className="parent-page">
      <div className="parent-page-intro">
        <span className="parent-eyebrow">MINH BẠCH & DỄ THEO DÕI</span>
        <h2>Học phí & tiền ăn</h2>
        <p>Các khoản thu và giao dịch được ghi nhận cho trẻ liên kết với tài khoản.</p>
      </div>
      <div className="parent-finance-summary">
        <article className="parent-stat-card"><span className="parent-stat-icon orange"><Wallet size={20} /></span><div><span>Còn cần thanh toán</span><strong>{isAvailable ? money(remainingTotal) : 'Chưa hỗ trợ'}</strong></div></article>
        <article className="parent-stat-card"><span className="parent-stat-icon green"><CreditCard size={20} /></span><div><span>Đã thanh toán ghi nhận</span><strong>{isAvailable ? money(paidTotal) : 'Chưa hỗ trợ'}</strong></div></article>
      </div>
      <div className="parent-invoice-list">
        {!isAvailable ? (
          <section className="parent-panel parent-empty-large" role="alert">
            <AlertCircle size={28} />
            <h3>Chưa thể tải khoản thu</h3>
            <p>{error || 'Không thể tải danh sách học phí. Vui lòng thử lại.'}</p>
            {onRetry && <button type="button" className="parent-payment-button secondary" onClick={onRetry}>Thử tải lại</button>}
          </section>
        ) : invoices.length ? invoices.map((invoice) => (
          <article className="parent-panel parent-invoice-card" key={invoice.id}>
            <div className="parent-invoice-heading">
              <div>
                <small>KỲ {invoice.month}{invoice.className ? ` · ${invoice.className}` : ''}</small>
                <h3>{invoice.childName}</h3>
                <span className="parent-invoice-code">Mã phiếu thu: HP-{invoice.id}</span>
              </div>
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
          <section className="parent-panel parent-empty-large"><Wallet size={28} /><h3>Chưa có khoản thu</h3><p>Phiếu học phí sẽ hiển thị tại đây sau khi nhà trường lập.</p></section>
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
