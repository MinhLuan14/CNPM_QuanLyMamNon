import { useState } from 'react';
import {
  Wallet,
  Plus,
  Search,
  CheckCircle2,
  Printer,
  Eye,
  CreditCard,
} from 'lucide-react';
import { initialTuitionList, initialChildren } from '../../data/mockData';
import Modal from '../../components/Modal';

export default function TuitionManagement({ onShowToast, onNavigateToPayment }) {
  const [tuitionList, setTuitionList] = useState(initialTuitionList);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInvoiceDetailOpen, setIsInvoiceDetailOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // New Invoice State
  const [newInvoice, setNewInvoice] = useState({
    childId: 'TE001',
    month: 'Tháng 10/2026',
    tuitionFee: 2500000,
    mealFee: 770000,
    facilitiesFee: 300000,
    talentFee: 400000,
    dueDate: '2026-10-25'
  });

  const filteredTuition = tuitionList.filter((item) => {
    const matchesSearch =
      item.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.className.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalExpected = tuitionList.reduce((acc, cur) => acc + cur.totalAmount, 0);
  const totalCollected = tuitionList.reduce((acc, cur) => acc + cur.paidAmount, 0);
  const totalDebt = totalExpected - totalCollected;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const child = initialChildren.find((c) => c.id === newInvoice.childId);
    const total =
      Number(newInvoice.tuitionFee) +
      Number(newInvoice.mealFee) +
      Number(newInvoice.facilitiesFee) +
      Number(newInvoice.talentFee);

    const newId = `HP202610-00${tuitionList.length + 1}`;
    const invoiceToAdd = {
      id: newId,
      childId: newInvoice.childId,
      childName: child ? child.name : 'Học sinh',
      className: child ? child.className : 'Mầm',
      month: newInvoice.month,
      tuitionFee: Number(newInvoice.tuitionFee),
      mealFee: Number(newInvoice.mealFee),
      facilitiesFee: Number(newInvoice.facilitiesFee),
      talentFee: Number(newInvoice.talentFee),
      totalAmount: total,
      paidAmount: 0,
      remainingAmount: total,
      dueDate: newInvoice.dueDate,
      status: 'Chưa thanh toán',
      paymentDate: null,
      paymentMethod: null
    };

    setTuitionList([invoiceToAdd, ...tuitionList]);
    setIsAddModalOpen(false);
    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'Thành công',
        message: `Đã tạo phiếu thu học phí ${newId} cho bé ${invoiceToAdd.childName}!`
      });
    }
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceDetailOpen(true);
  };

  const formatVND = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <div className="page-badge">
            <Wallet size={14} /> QUẢN LÝ THU HỌC PHÍ & BÁN TRÚ
          </div>
          <h2>Học Phí & Tiền Ăn Bán Trú</h2>
          <p>Lập phiếu thu, theo dõi tiến độ đóng học phí của từng học sinh và xuất hóa đơn điện tử</p>
        </div>

        <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} /> Lập phiếu thu mới
        </button>
      </div>

      {/* Thẻ Thống Kê Tài Chính Tháng Này */}
      <div className="mini-stats-row">
        <div className="mini-stat-card">
          <span className="dot-indicator bg-blue" />
          <div>
            <span className="mini-label">Tổng học phí dự kiến</span>
            <strong>{formatVND(totalExpected)}</strong>
          </div>
        </div>
        <div className="mini-stat-card">
          <span className="dot-indicator bg-green" />
          <div>
            <span className="mini-label">Đã thực thu về quỹ</span>
            <strong className="text-green">{formatVND(totalCollected)} ({Math.round((totalCollected / totalExpected) * 100)}%)</strong>
          </div>
        </div>
        <div className="mini-stat-card">
          <span className="dot-indicator bg-orange" />
          <div>
            <span className="mini-label">Còn tồn đọng cần thu</span>
            <strong className="text-orange">{formatVND(totalDebt)}</strong>
          </div>
        </div>
      </div>

      {/* Bộ Lọc & Tìm Kiếm */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên bé, mã phiếu thu, lớp học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-selects">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái nộp</option>
            <option value="Đã thanh toán">Đã thanh toán đủ</option>
            <option value="Chưa thanh toán">Chưa thanh toán</option>
            <option value="Đã cọc một phần">Đã cọc một phần</option>
          </select>
        </div>
      </div>

      {/* Bảng Danh Sách Phiếu Thu */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Mã Phiếu</th>
              <th>Học sinh</th>
              <th>Lớp học</th>
              <th>Kỳ thu</th>
              <th>Học phí cơ bản</th>
              <th>Tiền ăn bán trú</th>
              <th>Phụ phí & Năng khiếu</th>
              <th>Tổng cộng</th>
              <th>Hạn đóng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredTuition.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.id}</strong></td>
                <td>
                  <strong>{item.childName}</strong>
                </td>
                <td><span className="badge-class">{item.className}</span></td>
                <td>{item.month}</td>
                <td>{formatVND(item.tuitionFee)}</td>
                <td>{formatVND(item.mealFee)}</td>
                <td>{formatVND(item.facilitiesFee + item.talentFee)}</td>
                <td>
                  <strong className="text-blue">{formatVND(item.totalAmount)}</strong>
                </td>
                <td>{item.dueDate}</td>
                <td>
                  <span
                    className={`status-pill ${
                      item.status === 'Đã thanh toán'
                        ? 'pill-green'
                        : item.status === 'Chưa thanh toán'
                        ? 'pill-yellow'
                        : 'pill-blue'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons-cell">
                    <button
                      className="btn-tbl view"
                      title="Xem hóa đơn chi tiết"
                      onClick={() => handleViewInvoice(item)}
                    >
                      <Eye size={15} />
                    </button>
                    {item.status !== 'Đã thanh toán' && (
                      <button
                        className="btn-tbl pay"
                        title="Thu tiền ngay"
                        onClick={() => {
                          if (onNavigateToPayment) {
                            onNavigateToPayment(item);
                          } else {
                            alert(`Chuyển đến màn hình Thu tiền cho phiếu ${item.id}`);
                          }
                        }}
                      >
                        <CreditCard size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Lập Phiếu Thu Mới */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Lập Phiếu Thu Học Phí Mới"
        maxWidth="600px"
        footer={
          <div className="modal-buttons">
            <button className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Hủy
            </button>
            <button className="btn-primary" onClick={handleAddSubmit}>
              <CheckCircle2 size={16} /> Phát hành phiếu thu
            </button>
          </div>
        }
      >
        <form onSubmit={handleAddSubmit} className="modal-form-grid">
          <div className="form-group col-2">
            <label>Chọn Học Sinh *</label>
            <select
              value={newInvoice.childId}
              onChange={(e) => setNewInvoice({ ...newInvoice, childId: e.target.value })}
            >
              {initialChildren.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.className}) - Mã: {c.id}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Kỳ thu học phí</label>
            <input
              type="text"
              value={newInvoice.month}
              onChange={(e) => setNewInvoice({ ...newInvoice, month: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Hạn nộp học phí</label>
            <input
              type="date"
              value={newInvoice.dueDate}
              onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
            />
          </div>

          <div className="form-divider col-full">
            <span>Chi tiết các khoản thu cấu thành</span>
          </div>

          <div className="form-group">
            <label>Học phí chương trình chuẩn (VNĐ)</label>
            <input
              type="number"
              value={newInvoice.tuitionFee}
              onChange={(e) => setNewInvoice({ ...newInvoice, tuitionFee: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Tiền ăn bán trú (VNĐ)</label>
            <input
              type="number"
              value={newInvoice.mealFee}
              onChange={(e) => setNewInvoice({ ...newInvoice, mealFee: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Cơ sở vật chất & Học phẩm (VNĐ)</label>
            <input
              type="number"
              value={newInvoice.facilitiesFee}
              onChange={(e) => setNewInvoice({ ...newInvoice, facilitiesFee: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Môn năng khiếu (Tiếng Anh, Vẽ...) (VNĐ)</label>
            <input
              type="number"
              value={newInvoice.talentFee}
              onChange={(e) => setNewInvoice({ ...newInvoice, talentFee: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Modal Chi Tiết Hóa Đơn Phiếu Thu */}
      {selectedInvoice && (
        <Modal
          isOpen={isInvoiceDetailOpen}
          onClose={() => setIsInvoiceDetailOpen(false)}
          title={`Hóa Đơn Thu Phí: ${selectedInvoice.id}`}
          maxWidth="550px"
          footer={
            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => window.print()}>
                <Printer size={15} /> In phiếu thu
              </button>
              <button className="btn-primary" onClick={() => setIsInvoiceDetailOpen(false)}>
                Đóng
              </button>
            </div>
          }
        >
          <div className="invoice-receipt-box">
            <div className="receipt-header">
              <h3>TRƯỜNG MẦM NON BABYSHARK</h3>
              <p>Địa chỉ: 124 Đường 3/2, Quận 10, TP. Hồ Chí Minh</p>
              <h4>PHIẾU THU HỌC PHÍ & BÁN TRÚ</h4>
              <span>{selectedInvoice.month}</span>
            </div>

            <div className="receipt-meta">
              <div><span>Học sinh:</span> <strong>{selectedInvoice.childName}</strong></div>
              <div><span>Lớp học:</span> <strong>{selectedInvoice.className}</strong></div>
              <div><span>Mã số:</span> <strong>{selectedInvoice.id}</strong></div>
              <div><span>Hạn nộp:</span> <strong>{selectedInvoice.dueDate}</strong></div>
            </div>

            <div className="receipt-breakdown">
              <div className="receipt-line">
                <span>1. Học phí chương trình giáo dục</span>
                <strong>{formatVND(selectedInvoice.tuitionFee)}</strong>
              </div>
              <div className="receipt-line">
                <span>2. Tiền ăn bán trú (Sáng, Trưa, Xế)</span>
                <strong>{formatVND(selectedInvoice.mealFee)}</strong>
              </div>
              <div className="receipt-line">
                <span>3. Quỹ cơ sở vật chất & học phẩm</span>
                <strong>{formatVND(selectedInvoice.facilitiesFee)}</strong>
              </div>
              <div className="receipt-line">
                <span>4. Môn năng khiếu ngoại khóa</span>
                <strong>{formatVND(selectedInvoice.talentFee)}</strong>
              </div>
              <div className="receipt-divider" />
              <div className="receipt-line total">
                <span>TỔNG CỘNG TIỀN PHẢI THU:</span>
                <span className="total-val">{formatVND(selectedInvoice.totalAmount)}</span>
              </div>
              <div className="receipt-line">
                <span>Đã thanh toán:</span>
                <span className="text-green font-bold">{formatVND(selectedInvoice.paidAmount)}</span>
              </div>
              <div className="receipt-line">
                <span>Còn lại:</span>
                <span className="text-orange font-bold">{formatVND(selectedInvoice.remainingAmount)}</span>
              </div>
            </div>

            <div className="receipt-footer-notes">
              <p>Trạng thái: <strong>{selectedInvoice.status}</strong></p>
              {selectedInvoice.paymentDate && (
                <p>Ngày thanh toán: {selectedInvoice.paymentDate} ({selectedInvoice.paymentMethod})</p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
