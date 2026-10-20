import { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  QrCode,
  DollarSign,
  Smartphone
} from 'lucide-react';
import { initialPayments, initialTuitionList } from '../../data/mockData';
import Modal from '../../components/Modal';

export default function PaymentManagement({ onShowToast, preselectedInvoice }) {
  const [payments, setPayments] = useState(initialPayments);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('vietqr'); // 'vietqr' | 'momo' | 'cash'

  // Payment Form State
  const [paymentForm, setPaymentForm] = useState({
    invoiceId: preselectedInvoice ? preselectedInvoice.id : 'HP202610-003',
    childName: preselectedInvoice ? preselectedInvoice.childName : 'Lê Minh Khang',
    parentName: 'Lê Văn Cường',
    amount: preselectedInvoice ? preselectedInvoice.remainingAmount : 4270000,
    method: 'VietQR Chuyển khoản',
    collector: 'Thủ quỹ Nguyễn Thị Tâm'
  });

  const filteredPayments = payments.filter((p) => {
    return (
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.transactionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.method.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const formatVND = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
  };

  const handleOpenPay = (invoice) => {
    if (invoice) {
      setPaymentForm({
        invoiceId: invoice.id,
        childName: invoice.childName,
        parentName: 'Phụ huynh bé ' + invoice.childName,
        amount: invoice.remainingAmount || invoice.totalAmount,
        method: 'VietQR Chuyển khoản',
        collector: 'Thủ quỹ Nguyễn Thị Tâm'
      });
    }
    setIsPayModalOpen(true);
  };

  const handleConfirmPayment = () => {
    const newTxId = `TT-202610-0${93 + payments.length}`;
    const newPayment = {
      id: newTxId,
      invoiceId: paymentForm.invoiceId,
      childName: paymentForm.childName,
      parentName: paymentForm.parentName,
      amount: Number(paymentForm.amount),
      method:
        paymentMethod === 'vietqr'
          ? 'VietQR Chuyển khoản'
          : paymentMethod === 'momo'
          ? 'Ví MoMo'
          : 'Tiền mặt tại phòng tài vụ',
      transactionNo:
        paymentMethod === 'cash'
          ? `PTM-00${payments.length + 10}`
          : `MBB_${Math.floor(10000000 + Math.random() * 90000000)}`,
      time: new Date().toLocaleString('vi-VN'),
      collector: paymentForm.collector,
      status: 'Thành công'
    };

    setPayments([newPayment, ...payments]);
    setIsPayModalOpen(false);

    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'Thanh toán thành công',
        message: `Đã xác nhận thanh toán ${formatVND(newPayment.amount)} cho bé ${newPayment.childName}!`
      });
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <div className="page-badge">
            <CreditCard size={14} /> QUẢN LÝ GIAO DỊCH & THANH TOÁN
          </div>
          <h2>Cổng Thanh Toán & Lịch Sử Giao Dịch</h2>
          <p>Thu học phí trực tuyến qua mã VietQR, ví điện tử MoMo hoặc thu tiền mặt tại quầy tài vụ</p>
        </div>

        <button className="btn-primary" onClick={() => handleOpenPay(null)}>
          <Plus size={18} /> Thu học phí trực tiếp
        </button>
      </div>

      {/* Thẻ Thống Kê Giao Dịch */}
      <div className="mini-stats-row">
        <div className="mini-stat-card">
          <span className="dot-indicator bg-green" />
          <div>
            <span className="mini-label">Giao dịch thành công</span>
            <strong>{payments.length} lượt giao dịch</strong>
          </div>
        </div>
        <div className="mini-stat-card">
          <span className="dot-indicator bg-blue" />
          <div>
            <span className="mini-label">Thanh toán qua Chuyển khoản QR</span>
            <strong>{payments.filter((p) => p.method.includes('QR')).length} giao dịch</strong>
          </div>
        </div>
        <div className="mini-stat-card">
          <span className="dot-indicator bg-purple" />
          <div>
            <span className="mini-label">Tổng tiền giao dịch ghi nhận</span>
            <strong>{formatVND(payments.reduce((acc, c) => acc + c.amount, 0))}</strong>
          </div>
        </div>
      </div>

      {/* Tìm Kiếm */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo mã giao dịch, tên bé, phương thức..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Bảng Lịch Sử Giao Dịch */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Mã GD</th>
              <th>Mã Phiếu Thu</th>
              <th>Học sinh</th>
              <th>Người thanh toán</th>
              <th>Số tiền</th>
              <th>Phương thức</th>
              <th>Mã tham chiếu ngân hàng</th>
              <th>Thời gian</th>
              <th>Người thu ngân</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.id}</strong></td>
                <td><span className="badge-class">{p.invoiceId}</span></td>
                <td><strong>{p.childName}</strong></td>
                <td>{p.parentName}</td>
                <td><strong className="text-green font-bold">{formatVND(p.amount)}</strong></td>
                <td>
                  <span className="payment-method-pill">
                    {p.method.includes('QR') ? '💳 ' : p.method.includes('MoMo') ? '📱 ' : '💵 '}
                    {p.method}
                  </span>
                </td>
                <td><code>{p.transactionNo}</code></td>
                <td>{p.time}</td>
                <td>{p.collector}</td>
                <td>
                  <span className="status-pill pill-green">
                    <CheckCircle2 size={12} /> {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Thu Học Phí Trực Tuyến & Mã QR */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Thu Học Phí & Xác Nhận Thanh Toán"
        maxWidth="620px"
        footer={
          <div className="modal-buttons">
            <button className="btn-secondary" onClick={() => setIsPayModalOpen(false)}>
              Hủy
            </button>
            <button className="btn-primary" onClick={handleConfirmPayment}>
              <CheckCircle2 size={16} /> Xác nhận đã nhận tiền
            </button>
          </div>
        }
      >
        <div className="payment-modal-body">
          {/* Chọn Phương Thức Thanh Toán */}
          <div className="payment-method-selector">
            <button
              className={`method-btn ${paymentMethod === 'vietqr' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('vietqr')}
            >
              <QrCode size={18} />
              <span>Chuyển Khoản VietQR</span>
            </button>
            <button
              className={`method-btn ${paymentMethod === 'momo' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('momo')}
            >
              <Smartphone size={18} />
              <span>Ví Điện Tử MoMo</span>
            </button>
            <button
              className={`method-btn ${paymentMethod === 'cash' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('cash')}
            >
              <DollarSign size={18} />
              <span>Tiền Mặt Tại Quầy</span>
            </button>
          </div>

          {/* Form Thông Tin Khoản Thu */}
          <div className="modal-form-grid" style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label>Mã Phiếu Thu Học Phí</label>
              <select
                value={paymentForm.invoiceId}
                onChange={(e) => {
                  const inv = initialTuitionList.find((t) => t.id === e.target.value);
                  if (inv) {
                    setPaymentForm({
                      ...paymentForm,
                      invoiceId: inv.id,
                      childName: inv.childName,
                      amount: inv.remainingAmount || inv.totalAmount
                    });
                  }
                }}
              >
                {initialTuitionList.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.id} - {inv.childName} ({formatVND(inv.totalAmount)})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Học sinh</label>
              <input type="text" value={paymentForm.childName} readOnly />
            </div>

            <div className="form-group">
              <label>Người nộp tiền (Phụ huynh)</label>
              <input
                type="text"
                value={paymentForm.parentName}
                onChange={(e) => setPaymentForm({ ...paymentForm, parentName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Số tiền thanh toán (VNĐ) *</label>
              <input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          {/* Hiển thị Mã QR khi chọn VietQR hoặc MoMo */}
          {paymentMethod === 'vietqr' && (
            <div className="qr-payment-box">
              <div className="qr-card">
                <div className="qr-badge">VIETQR CHUYỂN KHOẢN TỨC THÌ</div>
                <div className="qr-mockup">
                  {/* Mô phỏng mã QR đồ họa sinh động */}
                  <div className="qr-matrix">
                    <QrCode size={130} className="text-blue" />
                  </div>
                </div>
                <div className="qr-bank-details">
                  <p>Ngân hàng: <strong>MB BANK (Quân Đội)</strong></p>
                  <p>Số tài khoản: <strong>8888 6666 9999</strong></p>
                  <p>Chủ tài khoản: <strong>TRUONG MAM NON BABYSHARK</strong></p>
                  <p>Số tiền: <strong className="text-blue">{formatVND(paymentForm.amount)}</strong></p>
                  <p>Nội dung: <code>HOCPHI {paymentForm.invoiceId} {paymentForm.childName}</code></p>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'momo' && (
            <div className="qr-payment-box">
              <div className="qr-card" style={{ borderColor: '#d81b60' }}>
                <div className="qr-badge" style={{ backgroundColor: '#d81b60' }}>VÍ ĐIỆN TỬ MOMO</div>
                <div className="qr-mockup">
                  <QrCode size={130} style={{ color: '#d81b60' }} />
                </div>
                <div className="qr-bank-details">
                  <p>Ví MoMo Doanh Nghiệp: <strong>Trường Mầm Non BabyShark</strong></p>
                  <p>SĐT: <strong>0903 888 999</strong></p>
                  <p>Số tiền: <strong className="text-blue">{formatVND(paymentForm.amount)}</strong></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
