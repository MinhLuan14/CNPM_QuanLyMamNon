import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    CreditCard,
    Eye,
    FilePlus2,
    Printer,
    RefreshCw,
    Search,
    Utensils,
    Wallet,
    X,
} from 'lucide-react';
import { authRequest, responseError } from '../../api/auth';
import { createInvoice, getInvoices, recordInvoicePayment } from '../../api/hocPhi';
import Modal from '../../components/Modal';
import './BillingManagement.css';

const FEE_TYPES = ['Học phí', 'Tiền ăn', 'Cơ sở vật chất', 'Môn năng khiếu', 'Khác'];
const PAYMENT_SUCCESS = 'Thành công';
const MONEY_FORMAT = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });

function money(value) {
    if (value === null || value === undefined || value === '') return '—';
    const amount = Number(value);
    return Number.isFinite(amount) ? `${MONEY_FORMAT.format(amount)} đ` : '—';
}

function childName(child) {
    return [child?.hoTenDemTre, child?.tenTre].filter(Boolean).join(' ') || 'Chưa có tên';
}

function normalizeText(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('vi').trim();
}

function isMealLine(line) {
    return normalizeText(line.loaiPhi).includes('tien an');
}

function feeLineAmount(line) {
    if (line.thanhTien !== null && line.thanhTien !== undefined) return Number(line.thanhTien);
    if (line.soLuong !== null && line.soLuong !== undefined && line.donGia !== null && line.donGia !== undefined) {
        return Number(line.soLuong) * Number(line.donGia);
    }
    return null;
}

function successfulPayment(invoice) {
    const payment = invoice.thanhToan;
    return payment?.trangThai === PAYMENT_SUCCESS && Number(payment.soTienThanhToan) > 0
        ? Number(payment.soTienThanhToan)
        : 0;
}

function remainingAmount(invoice) {
    return Math.max(0, Number(invoice.tongTien || 0) - successfulPayment(invoice));
}

function invoiceStatus(invoice) {
    const total = Number(invoice.tongTien || 0);
    const paid = successfulPayment(invoice);
    if (total > 0 && paid >= total) return 'Đã thanh toán';
    if (paid > 0) return 'Đã thanh toán một phần';
    const dueDate = invoice.hanThanhToan ? new Date(invoice.hanThanhToan) : null;
    if (dueDate && dueDate.getTime() < new Date(new Date().toDateString()).getTime()) return 'Quá hạn';
    return invoice.trangThai || 'Chưa thanh toán';
}

function statusClass(status) {
    if (status === 'Đã thanh toán' || status === PAYMENT_SUCCESS) return 'is-paid';
    if (status === 'Quá hạn') return 'is-overdue';
    if (status === 'Đã thanh toán một phần') return 'is-partial';
    return 'is-pending';
}

function term(invoice) {
    return `Tháng ${invoice.thangApDung}/${invoice.namApDung}`;
}

function dateOnly(value) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('vi-VN');
}

function emptyLine() {
    return { loaiPhi: '', soLuong: '1', donGia: '', noiDung: '' };
}

async function readResponse(response, fallback) {
    if (!response.ok) throw new Error(await responseError(response, fallback));
    return response.status === 204 ? null : response.json();
}

export default function BillingManagement({
    view = 'tuition',
    onShowToast,
    onNavigateToPayment,
    preselectedInvoice,
}) {
    const [invoices, setInvoices] = useState([]);
    const [children, setChildren] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [childError, setChildError] = useState('');
    const [search, setSearch] = useState('');
    const [monthFilter, setMonthFilter] = useState('ALL');
    const [yearFilter, setYearFilter] = useState('ALL');
    const [classFilter, setClassFilter] = useState('ALL');
    const [childFilter, setChildFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('newest');
    const [page, setPage] = useState(1);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentParentId, setPaymentParentId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Tiền mặt');
    const [transactionRef, setTransactionRef] = useState('');
    const [paymentNote, setPaymentNote] = useState('');
    const [formError, setFormError] = useState('');
    const [feeView, setFeeView] = useState('tuition');
    const activeView = view === 'payments' ? 'payments' : feeView;
    const now = new Date();
    const [invoiceForm, setInvoiceForm] = useState({
        maTre: '',
        thangApDung: String(now.getMonth() + 1),
        namApDung: String(now.getFullYear()),
        hanThanhToan: '',
    });
    const [feeLines, setFeeLines] = useState([emptyLine()]);

    const notify = (type, title, message) => onShowToast?.({ type, title, message });

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setLoadError('');
        setChildError('');
        const [invoiceResult, childrenResult] = await Promise.allSettled([
            getInvoices(),
            authRequest('/api/tre-em'),
        ]);

        if (invoiceResult.status === 'fulfilled') setInvoices(invoiceResult.value);
        else {
            setInvoices([]);
            setLoadError(invoiceResult.reason?.message || 'Không thể tải danh sách khoản thu.');
        }

        if (childrenResult.status === 'fulfilled') {
            try {
                setChildren(await readResponse(childrenResult.value, 'Không thể tải danh sách trẻ.'));
            } catch (error) {
                setChildren([]);
                setChildError(error.message);
            }
        } else {
            setChildren([]);
            setChildError(childrenResult.reason?.message || 'Không thể tải danh sách trẻ.');
        }
        setIsLoading(false);
    }, []);

    const openPayment = (invoice) => {
        if (remainingAmount(invoice) <= 0) return;
        setSelectedInvoice(invoice);
        setPaymentAmount(String(remainingAmount(invoice)));
        setPaymentParentId(invoice.phuHuynhLienKet?.[0]?.maPhuHuynh
            ? String(invoice.phuHuynhLienKet[0].maPhuHuynh)
            : '');
        setPaymentMethod('Tiền mặt');
        setTransactionRef('');
        setPaymentNote('');
        setFormError('');
        setIsPaymentModalOpen(true);
    };

    useEffect(() => {
        const timeoutId = window.setTimeout(() => loadData(), 0);
        return () => window.clearTimeout(timeoutId);
    }, [loadData]);

    useEffect(() => {
        if (view !== 'payments' || !preselectedInvoice || !invoices.length) return;
        const targetId = Number(preselectedInvoice.maHocPhi ?? preselectedInvoice.id);
        const invoice = invoices.find((item) => item.maHocPhi === targetId);
        const timeoutId = window.setTimeout(() => {
            if (invoice && remainingAmount(invoice) > 0) openPayment(invoice);
        }, 0);
        return () => window.clearTimeout(timeoutId);
    }, [invoices, preselectedInvoice, view]);

    const classes = useMemo(() => [...new Set(invoices.map((item) => item.tenLopHoc).filter(Boolean))].sort(), [invoices]);
    const years = useMemo(() => [...new Set(invoices.map((item) => item.namApDung))].sort((a, b) => b - a), [invoices]);
    const months = useMemo(() => [...new Set(invoices.map((item) => item.thangApDung))].sort((a, b) => a - b), [invoices]);

    const matchingInvoices = useMemo(() => {
        const keyword = normalizeText(search);
        return invoices.filter((invoice) => {
            const lines = invoice.chiTiet || [];
            const queryValues = [
                invoice.maHocPhi,
                invoice.hoTenTre,
                invoice.tenLopHoc,
                term(invoice),
                ...lines.flatMap((line) => [line.loaiPhi, line.noiDung]),
                invoice.thanhToan?.maThanhToan,
                invoice.thanhToan?.maGiaoDich,
                invoice.thanhToan?.phuongThucThanhToan,
            ];
            return (!keyword || queryValues.some((value) => normalizeText(value).includes(keyword)))
                && (monthFilter === 'ALL' || String(invoice.thangApDung) === monthFilter)
                && (yearFilter === 'ALL' || String(invoice.namApDung) === yearFilter)
                && (classFilter === 'ALL' || invoice.tenLopHoc === classFilter)
                && (childFilter === 'ALL' || String(invoice.maTre) === childFilter)
                && (activeView === 'meals' || statusFilter === 'ALL' || invoiceStatus(invoice) === statusFilter)
                && (activeView !== 'meals' || lines.some(isMealLine));
        });
    }, [activeView, childFilter, classFilter, invoices, monthFilter, search, statusFilter, yearFilter]);

    const mealLines = useMemo(() => matchingInvoices.flatMap((invoice) => (invoice.chiTiet || [])
        .filter(isMealLine)
        .map((line) => ({ invoice, line }))), [matchingInvoices]);
    const mealAmountIncomplete = mealLines.some(({ line }) => feeLineAmount(line) === null || !Number.isFinite(feeLineAmount(line)));
    const totalAmount = activeView === 'meals'
        ? mealAmountIncomplete ? null : mealLines.reduce((sum, { line }) => sum + feeLineAmount(line), 0)
        : matchingInvoices.reduce((sum, invoice) => sum + Number(invoice.tongTien || 0), 0);
    const receivedAmount = matchingInvoices.reduce((sum, invoice) => sum + successfulPayment(invoice), 0);
    const outstandingAmount = matchingInvoices.reduce((sum, invoice) => sum + remainingAmount(invoice), 0);
    const childCount = new Set(matchingInvoices.map((invoice) => invoice.maTre)).size;
    const outstandingInvoiceCount = matchingInvoices.filter((invoice) => remainingAmount(invoice) > 0).length;
    const overdueInvoiceCount = matchingInvoices.filter((invoice) => invoiceStatus(invoice) === 'Quá hạn').length;
    const sortedInvoices = [...matchingInvoices].sort((first, second) => {
        if (sortOrder === 'amount-asc') return Number(first.tongTien) - Number(second.tongTien);
        if (sortOrder === 'amount-desc') return Number(second.tongTien) - Number(first.tongTien);
        const firstPeriod = first.namApDung * 100 + first.thangApDung;
        const secondPeriod = second.namApDung * 100 + second.thangApDung;
        return sortOrder === 'oldest'
            ? firstPeriod - secondPeriod || first.maHocPhi - second.maHocPhi
            : secondPeriod - firstPeriod || second.maHocPhi - first.maHocPhi;
    });
    const paymentInvoices = sortedInvoices.filter((invoice) => invoice.thanhToan);
    const rowCount = activeView === 'payments'
        ? paymentInvoices.length
        : activeView === 'meals' ? mealLines.length : sortedInvoices.length;
    const pageCount = Math.max(1, Math.ceil(rowCount / 10));
    const currentPage = Math.min(page, pageCount);
    const startIndex = (currentPage - 1) * 10;
    const visibleInvoices = sortedInvoices.slice(startIndex, startIndex + 10);
    const visiblePaymentInvoices = paymentInvoices.slice(startIndex, startIndex + 10);
    const visibleMealLines = mealLines.slice(startIndex, startIndex + 10);

    const handleCreateInvoice = async (event) => {
        event.preventDefault();
        setFormError('');
        const validLines = feeLines.map((line) => ({
            loaiPhi: line.loaiPhi.trim(),
            soLuong: Number(line.soLuong),
            donGia: Number(line.donGia),
            noiDung: line.noiDung.trim() || null,
        }));
        if (!invoiceForm.maTre || !invoiceForm.hanThanhToan || !validLines.length
            || feeLines.some((line) => line.donGia === '')
            || validLines.some((line) => !line.loaiPhi || !Number.isInteger(line.soLuong) || line.soLuong < 1
                || !Number.isFinite(line.donGia) || line.donGia <= 0 || line.donGia > 9999999999.99)) {
            setFormError('Vui lòng chọn trẻ, hạn thu và nhập hợp lệ tất cả các dòng phí.');
            return;
        }

        setIsSaving(true);
        try {
            await createInvoice({
                maTre: Number(invoiceForm.maTre),
                thangApDung: Number(invoiceForm.thangApDung),
                namApDung: Number(invoiceForm.namApDung),
                hanThanhToan: invoiceForm.hanThanhToan,
                chiTiet: validLines,
            });
            setIsInvoiceModalOpen(false);
            setFeeLines([emptyLine()]);
            await loadData();
            notify('success', 'Đã lập phiếu thu', 'Phiếu thu đã được lưu thành công.');
        } catch (error) {
            setFormError(error.message || 'Không thể lập phiếu thu.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRecordPayment = async (event) => {
        event.preventDefault();
        setFormError('');
        if (!selectedInvoice || !paymentParentId) {
            setFormError('Chọn phụ huynh được liên kết với trẻ để ghi nhận thanh toán.');
            return;
        }
        if (Number(paymentAmount) !== remainingAmount(selectedInvoice)) {
            setFormError('Với cấu trúc dữ liệu hiện tại, số tiền phải bằng toàn bộ số dư còn lại.');
            return;
        }

        setIsSaving(true);
        try {
            await recordInvoicePayment(selectedInvoice.maHocPhi, {
                soTienThanhToan: Number(paymentAmount),
                phuongThucThanhToan: paymentMethod,
                maPhuHuynh: Number(paymentParentId),
                maGiaoDich: transactionRef.trim() || null,
                noiDung: paymentNote.trim() || null,
            });
            setIsPaymentModalOpen(false);
            await loadData();
            notify('success', 'Đã ghi nhận thanh toán', 'Backend đã xác nhận giao dịch cho phiếu thu.');
        } catch (error) {
            setFormError(error.message || 'Không thể ghi nhận thanh toán.');
        } finally {
            setIsSaving(false);
        }
    };

    const openDetail = (invoice) => {
        setSelectedInvoice(invoice);
        setIsDetailOpen(true);
    };

    const clearFilters = () => {
        setSearch('');
        setMonthFilter('ALL');
        setYearFilter('ALL');
        setClassFilter('ALL');
        setChildFilter('ALL');
        setStatusFilter('ALL');
    };

    const renderInvoiceRows = () => visibleInvoices.map((invoice) => {
        const paid = successfulPayment(invoice);
        const due = remainingAmount(invoice);
        const status = invoiceStatus(invoice);
        return (
            <tr key={invoice.maHocPhi}>
                <td><strong>HP-{invoice.maHocPhi}</strong></td>
                <td><strong>{invoice.hoTenTre}</strong><span className="billing-secondary">{invoice.tenLopHoc || 'Chưa phân lớp'}</span></td>
                <td>{term(invoice)}</td>
                <td className="billing-money">{money(invoice.tongTien)}</td>
                <td className="billing-money">{money(paid)}</td>
                <td className="billing-money">{money(due)}</td>
                <td>{dateOnly(invoice.hanThanhToan)}</td>
                <td><span className={`billing-status ${statusClass(status)}`}>{status}</span></td>
                <td>
                    <div className="billing-row-actions">
                        <button type="button" className="btn-tbl view" title="Xem chi tiết phiếu thu" aria-label="Xem chi tiết phiếu thu" onClick={() => openDetail(invoice)}><Eye size={15} /></button>
                        {due > 0 && activeView !== 'meals' && (
                            <button
                                type="button"
                                className="btn-tbl pay"
                                title="Ghi nhận thanh toán"
                                aria-label="Ghi nhận thanh toán"
                                onClick={() => onNavigateToPayment ? onNavigateToPayment(invoice) : openPayment(invoice)}
                            ><CreditCard size={15} /></button>
                        )}
                    </div>
                </td>
            </tr>
        );
    });

    const renderPaymentRows = () => visiblePaymentInvoices.map((invoice) => {
        const payment = invoice.thanhToan;
        return (
            <tr key={payment.maThanhToan}>
                <td><strong>{payment.maThanhToan}</strong></td>
                <td>HP-{invoice.maHocPhi}</td>
                <td><strong>{invoice.hoTenTre}</strong><span className="billing-secondary">{invoice.tenLopHoc || 'Chưa phân lớp'}</span></td>
                <td>{payment.hoTenPhuHuynh || '—'}</td>
                <td className="billing-money">{money(payment.soTienThanhToan)}</td>
                <td>{payment.phuongThucThanhToan || '—'}</td>
                <td>{payment.maGiaoDich || '—'}</td>
                <td>{payment.thoiGianThanhToan ? new Date(payment.thoiGianThanhToan).toLocaleString('vi-VN') : '—'}</td>
                <td><span className={`billing-status ${statusClass(payment.trangThai)}`}>{payment.trangThai || 'Chưa xác định'}</span></td>
            </tr>
        );
    });

    return (
        <div className="page-container fade-in billing-page">
            <div className="page-header">
                <div>
                    <div className="page-badge"><Wallet size={14} /> TÀI CHÍNH NHÀ TRƯỜNG</div>
                    <h2>{activeView === 'payments' ? 'Lịch sử thanh toán' : activeView === 'meals' ? 'Quản lý tiền ăn' : 'Quản lý học phí'}</h2>
                    <p>{activeView === 'meals'
                        ? 'Theo dõi các khoản phí được ghi rõ là tiền ăn trong phiếu thu.'
                        : activeView === 'payments'
                            ? 'Các giao dịch đã được ghi nhận trong hệ thống.'
                            : 'Quản lý phiếu thu và công nợ theo dữ liệu hiện có.'}</p>
                </div>
                <div className="billing-header-actions">
                    <button className="btn-secondary" type="button" onClick={loadData} disabled={isLoading}><RefreshCw size={16} /> Làm mới</button>
                    {activeView === 'tuition' && <button className="btn-primary" type="button" onClick={() => { setFormError(''); setIsInvoiceModalOpen(true); }}><FilePlus2 size={17} /> Lập phiếu thu</button>}
                </div>
            </div>

            {activeView !== 'payments' && (
                <div className="billing-tabs" role="tablist" aria-label="Loại khoản thu">
                    <button type="button" role="tab" aria-selected={activeView === 'tuition'} className={activeView === 'tuition' ? 'active' : ''} onClick={() => { setFeeView('tuition'); setPage(1); }}>Học phí và khoản thu</button>
                    <button type="button" role="tab" aria-selected={activeView === 'meals'} className={activeView === 'meals' ? 'active' : ''} onClick={() => { setFeeView('meals'); setPage(1); }}><Utensils size={15} /> Tiền ăn</button>
                </div>
            )}

            {activeView !== 'payments' && (
                <div className="billing-stats">
                    <article><span>Trẻ có phiếu trong bộ lọc</span><strong>{childCount}</strong></article>
                    <article><span>{activeView === 'meals' ? 'Tiền ăn phải thu' : 'Tổng phải thu'}</span><strong>{money(totalAmount)}</strong></article>
                    {activeView === 'tuition' && <>
                        <article><span>Đã thu thành công</span><strong className="billing-good">{money(receivedAmount)}</strong></article>
                        <article><span>Còn phải thu</span><strong className="billing-warn">{money(outstandingAmount)}</strong></article>
                        <article><span>Phiếu còn số dư</span><strong>{outstandingInvoiceCount}</strong></article>
                        <article><span>Phiếu quá hạn</span><strong className="billing-warn">{overdueInvoiceCount}</strong></article>
                    </>}
                    {activeView === 'meals' && <article><span>Dòng tiền ăn</span><strong>{mealLines.length}</strong></article>}
                </div>
            )}

            {activeView === 'meals' && <div className="billing-notice"><AlertCircle size={16} /> Thanh toán hiện được lưu ở cấp phiếu thu, chưa có dữ liệu phân bổ số tiền đã thu riêng cho từng loại phí.</div>}
            {loadError && <div className="billing-error" role="alert"><AlertCircle size={17} /> {loadError}<button type="button" className="btn-secondary" onClick={loadData}>Thử lại</button></div>}
            {childError && activeView === 'tuition' && <div className="billing-error" role="alert"><AlertCircle size={17} /> {childError} Danh sách phiếu vẫn có thể xem, nhưng chưa thể lập phiếu mới.</div>}

            <div className="billing-filter-bar">
                <label className="billing-search"><Search size={17} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Tìm trẻ, lớp, mã phiếu hoặc nội dung..." /></label>
                <select aria-label="Lọc tháng" value={monthFilter} onChange={(event) => { setMonthFilter(event.target.value); setPage(1); }}><option value="ALL">Tất cả tháng</option>{months.map((month) => <option key={month} value={month}>Tháng {month}</option>)}</select>
                <select aria-label="Lọc năm" value={yearFilter} onChange={(event) => { setYearFilter(event.target.value); setPage(1); }}><option value="ALL">Tất cả năm</option>{years.map((year) => <option key={year} value={year}>{year}</option>)}</select>
                <select aria-label="Lọc lớp" value={classFilter} onChange={(event) => { setClassFilter(event.target.value); setPage(1); }}><option value="ALL">Tất cả lớp</option>{classes.map((className) => <option key={className} value={className}>{className}</option>)}</select>
                <select aria-label="Lọc trẻ" value={childFilter} onChange={(event) => { setChildFilter(event.target.value); setPage(1); }}><option value="ALL">Tất cả trẻ</option>{[...new Map(invoices.map((invoice) => [invoice.maTre, invoice])).values()].map((invoice) => <option key={invoice.maTre} value={invoice.maTre}>{invoice.hoTenTre}</option>)}</select>
                {activeView !== 'meals' && <select aria-label="Lọc trạng thái" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}><option value="ALL">Tất cả trạng thái</option>{['Chưa thanh toán', 'Đã thanh toán một phần', 'Đã thanh toán', 'Quá hạn'].map((status) => <option key={status} value={status}>{status}</option>)}</select>}
                <select aria-label="Sắp xếp" value={sortOrder} onChange={(event) => { setSortOrder(event.target.value); setPage(1); }}><option value="newest">Mới nhất</option><option value="oldest">Cũ nhất</option><option value="amount-desc">Số tiền cao nhất</option><option value="amount-asc">Số tiền thấp nhất</option></select>
                <button className="btn-secondary" type="button" onClick={clearFilters}><X size={15} /> Xóa lọc</button>
            </div>

            {isLoading ? <div className="empty-state-hint" role="status">Đang tải dữ liệu khoản thu...</div> : !loadError && (
                activeView === 'payments' ? (
                    paymentInvoices.length ? (
                        <div className="table-responsive"><table className="custom-table billing-table"><thead><tr><th>Mã giao dịch</th><th>Mã phiếu</th><th>Trẻ / lớp</th><th>Phụ huynh</th><th>Số tiền</th><th>Phương thức</th><th>Mã tham chiếu</th><th>Thời gian</th><th>Trạng thái</th></tr></thead><tbody>{renderPaymentRows()}</tbody></table></div>
                    ) : <div className="billing-empty"><CreditCard size={25} /><strong>Chưa có giao dịch thanh toán</strong><span>Giao dịch sẽ xuất hiện sau khi được ghi nhận thành công.</span></div>
                ) : activeView === 'meals' ? (
                    mealLines.length ? <div className="table-responsive"><table className="custom-table billing-table"><thead><tr><th>Mã phiếu</th><th>Trẻ / lớp</th><th>Kỳ thu</th><th>Nội dung</th><th>Số lượng</th><th>Đơn giá</th><th>Tiền ăn</th><th>Hạn thu</th><th>Chi tiết</th></tr></thead><tbody>{visibleMealLines.map(({ invoice, line }) => <tr key={line.maChiTietHocPhi}><td>HP-{invoice.maHocPhi}</td><td><strong>{invoice.hoTenTre}</strong><span className="billing-secondary">{invoice.tenLopHoc || 'Chưa phân lớp'}</span></td><td>{term(invoice)}</td><td>{line.noiDung || line.loaiPhi}</td><td>{line.soLuong ?? '—'}</td><td className="billing-money">{money(line.donGia)}</td><td className="billing-money"><strong>{money(feeLineAmount(line))}</strong></td><td>{dateOnly(invoice.hanThanhToan)}</td><td><button type="button" className="btn-tbl view" title="Xem chi tiết phiếu thu" aria-label="Xem chi tiết phiếu thu" onClick={() => openDetail(invoice)}><Eye size={15} /></button></td></tr>)}</tbody></table></div>
                        : <div className="billing-empty"><Utensils size={25} /><strong>Chưa có dòng phí tiền ăn</strong><span>Chỉ hiển thị khoản phí có loại được ghi là “Tiền ăn”.</span></div>
                ) : matchingInvoices.length ? (
                    <div className="table-responsive"><table className="custom-table billing-table"><thead><tr><th>Mã phiếu</th><th>Trẻ / lớp</th><th>Kỳ thu</th><th>Phải thu</th><th>Đã thu</th><th>Còn lại</th><th>Hạn thu</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{renderInvoiceRows()}</tbody></table></div>
                ) : <div className="billing-empty"><Wallet size={25} /><strong>{invoices.length ? 'Không tìm thấy phiếu thu phù hợp' : 'Chưa có phiếu thu'}</strong><span>{invoices.length ? 'Thử thay đổi bộ lọc hoặc từ khóa.' : 'Lập phiếu thu từ dữ liệu thực tế để bắt đầu theo dõi.'}</span></div>
            )}
            {!isLoading && !loadError && pageCount > 1 && <div className="billing-pagination"><button className="btn-secondary" type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Trước</button><span>Trang {currentPage} / {pageCount} · {rowCount} dòng</span><button className="btn-secondary" type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Sau</button></div>}

            <Modal
                isOpen={isInvoiceModalOpen}
                onClose={() => { if (!isSaving) setIsInvoiceModalOpen(false); }}
                title="Lập phiếu thu"
                maxWidth="760px"
                footer={<div className="modal-buttons"><button className="btn-secondary" type="button" onClick={() => setIsInvoiceModalOpen(false)} disabled={isSaving}>Hủy</button><button className="btn-primary" type="submit" form="billing-invoice-form" disabled={isSaving || !children.length}><CheckCircle2 size={16} /> {isSaving ? 'Đang lưu...' : 'Lưu phiếu thu'}</button></div>}
            >
                <form id="billing-invoice-form" className="modal-form-grid billing-form" onSubmit={handleCreateInvoice}>
                    <div className="form-group col-2"><label htmlFor="billing-child">Trẻ *</label><select id="billing-child" required value={invoiceForm.maTre} onChange={(event) => setInvoiceForm({ ...invoiceForm, maTre: event.target.value })}><option value="">Chọn trẻ</option>{children.map((child) => <option key={child.maTre} value={child.maTre}>{childName(child)}{child.tenLopHoc ? ` · ${child.tenLopHoc}` : ''}</option>)}</select></div>
                    <div className="form-group"><label htmlFor="billing-month">Tháng *</label><select id="billing-month" value={invoiceForm.thangApDung} onChange={(event) => setInvoiceForm({ ...invoiceForm, thangApDung: event.target.value })}>{Array.from({ length: 12 }, (_, index) => index + 1).map((month) => <option key={month} value={month}>Tháng {month}</option>)}</select></div>
                    <div className="form-group"><label htmlFor="billing-year">Năm *</label><input id="billing-year" type="number" min="2000" max="2100" value={invoiceForm.namApDung} onChange={(event) => setInvoiceForm({ ...invoiceForm, namApDung: event.target.value })} required /></div>
                    <div className="form-group"><label htmlFor="billing-due">Hạn thu *</label><input id="billing-due" type="date" value={invoiceForm.hanThanhToan} onChange={(event) => setInvoiceForm({ ...invoiceForm, hanThanhToan: event.target.value })} required /></div>
                    <div className="billing-line-list col-full">
                        <div className="billing-line-heading"><strong>Chi tiết khoản thu</strong><button className="btn-secondary" type="button" onClick={() => setFeeLines([...feeLines, emptyLine()])}><FilePlus2 size={15} /> Thêm dòng</button></div>
                        {feeLines.map((line, index) => <div className="billing-line-row" key={`fee-${index}`}>
                            <label>Loại phí<select value={line.loaiPhi} onChange={(event) => setFeeLines(feeLines.map((item, lineIndex) => lineIndex === index ? { ...item, loaiPhi: event.target.value } : item))}><option value="">Chọn loại phí</option>{FEE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
                            <label>Số lượng<input type="number" min="1" step="1" value={line.soLuong} onChange={(event) => setFeeLines(feeLines.map((item, lineIndex) => lineIndex === index ? { ...item, soLuong: event.target.value } : item))} /></label>
                            <label>Đơn giá (VNĐ)<input type="number" min="0.01" step="0.01" value={line.donGia} onChange={(event) => setFeeLines(feeLines.map((item, lineIndex) => lineIndex === index ? { ...item, donGia: event.target.value } : item))} /></label>
                            <label>Nội dung<input value={line.noiDung} maxLength="255" onChange={(event) => setFeeLines(feeLines.map((item, lineIndex) => lineIndex === index ? { ...item, noiDung: event.target.value } : item))} /></label>
                            <button type="button" className="btn-tbl delete" title="Xóa dòng phí" aria-label="Xóa dòng phí" disabled={feeLines.length === 1} onClick={() => setFeeLines(feeLines.filter((_, lineIndex) => lineIndex !== index))}><X size={15} /></button>
                        </div>)}
                    </div>
                    {formError && <div className="billing-error col-full" role="alert">{formError}</div>}
                </form>
            </Modal>

            <Modal isOpen={isDetailOpen && Boolean(selectedInvoice)} onClose={() => setIsDetailOpen(false)} title={`Chi tiết phiếu HP-${selectedInvoice?.maHocPhi ?? ''}`} maxWidth="650px" footer={<div className="modal-buttons"><button className="btn-secondary" type="button" onClick={() => window.print()}><Printer size={15} /> In phiếu</button><button className="btn-primary" type="button" onClick={() => setIsDetailOpen(false)}>Đóng</button></div>}>
                {selectedInvoice && <div className="billing-detail">
                    <div className="billing-detail-meta"><div><span>Trẻ</span><strong>{selectedInvoice.hoTenTre}</strong></div><div><span>Lớp</span><strong>{selectedInvoice.tenLopHoc || 'Chưa phân lớp'}</strong></div><div><span>Kỳ thu</span><strong>{term(selectedInvoice)}</strong></div><div><span>Hạn thu</span><strong>{dateOnly(selectedInvoice.hanThanhToan)}</strong></div></div>
                    <h3>Các khoản phí</h3>
                    <div className="billing-detail-lines">{(selectedInvoice.chiTiet || []).map((line) => <div key={line.maChiTietHocPhi}><div><strong>{line.loaiPhi || 'Khoản thu'}</strong><span>{line.noiDung || `${line.soLuong ?? '—'} × ${money(line.donGia)}`}</span></div><strong>{money(line.thanhTien)}</strong></div>)}</div>
                    <div className="billing-detail-total"><span>Tổng phải thu</span><strong>{money(selectedInvoice.tongTien)}</strong></div>
                    <div className="billing-detail-total"><span>Đã thu thành công</span><strong className="billing-good">{money(successfulPayment(selectedInvoice))}</strong></div>
                    <div className="billing-detail-total"><span>Còn phải thu</span><strong className="billing-warn">{money(remainingAmount(selectedInvoice))}</strong></div>
                    {selectedInvoice.thanhToan && <div className="billing-payment-note"><CalendarDays size={15} /> Giao dịch {selectedInvoice.thanhToan.maThanhToan}: {selectedInvoice.thanhToan.trangThai || 'Chưa xác định'} · {selectedInvoice.thanhToan.phuongThucThanhToan || 'Chưa có phương thức'} · {selectedInvoice.thanhToan.thoiGianThanhToan ? new Date(selectedInvoice.thanhToan.thoiGianThanhToan).toLocaleString('vi-VN') : 'Chưa có thời gian'}</div>}
                </div>}
            </Modal>

            <Modal isOpen={isPaymentModalOpen && Boolean(selectedInvoice)} onClose={() => { if (!isSaving) setIsPaymentModalOpen(false); }} title={`Ghi nhận thanh toán HP-${selectedInvoice?.maHocPhi ?? ''}`} maxWidth="560px" footer={<div className="modal-buttons"><button className="btn-secondary" type="button" onClick={() => setIsPaymentModalOpen(false)} disabled={isSaving}>Hủy</button><button className="btn-primary" type="submit" form="billing-payment-form" disabled={isSaving || !selectedInvoice?.phuHuynhLienKet?.length}><CheckCircle2 size={16} /> {isSaving ? 'Đang xác nhận...' : 'Xác nhận đã nhận tiền'}</button></div>}>
                <form id="billing-payment-form" className="modal-form-grid billing-form" onSubmit={handleRecordPayment}>
                    <div className="billing-notice col-full"><AlertCircle size={16} /> Chỉ xác nhận sau khi nhà trường thực tế nhận được khoản tiền. Không tạo thanh toán QR hoặc ví điện tử tự động.</div>
                    <div className="form-group col-2"><label htmlFor="billing-parent">Phụ huynh liên kết *</label><select id="billing-parent" required value={paymentParentId} onChange={(event) => setPaymentParentId(event.target.value)}><option value="">Chọn phụ huynh</option>{(selectedInvoice?.phuHuynhLienKet || []).map((parent) => <option key={parent.maPhuHuynh} value={parent.maPhuHuynh}>{parent.hoTen}{parent.quanHe ? ` · ${parent.quanHe}` : ''}</option>)}</select>{!selectedInvoice?.phuHuynhLienKet?.length && <small>Trẻ chưa có phụ huynh liên kết trong dữ liệu.</small>}</div>
                    <div className="form-group"><label htmlFor="billing-pay-amount">Số tiền còn lại</label><input id="billing-pay-amount" type="number" min="0.01" step="0.01" required value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} /></div>
                    <div className="form-group"><label htmlFor="billing-pay-method">Phương thức *</label><select id="billing-pay-method" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}><option>Tiền mặt</option><option>Chuyển khoản</option></select></div>
                    <div className="form-group col-2"><label htmlFor="billing-reference">Mã giao dịch (nếu có)</label><input id="billing-reference" maxLength="100" value={transactionRef} onChange={(event) => setTransactionRef(event.target.value)} /></div>
                    <div className="form-group col-2"><label htmlFor="billing-payment-note">Ghi chú</label><input id="billing-payment-note" maxLength="255" value={paymentNote} onChange={(event) => setPaymentNote(event.target.value)} /></div>
                    {formError && <div className="billing-error col-full" role="alert">{formError}</div>}
                </form>
            </Modal>
        </div>
    );
}
