import { authRequest, fetchCsrfToken, responseError } from './auth';

async function readJson(response, fallback) {
    if (!response.ok) {
        const error = new Error(await responseError(response, fallback));
        error.status = response.status;
        throw error;
    }
    return response.status === 204 ? null : response.json();
}

export async function getInvoices() {
    return readJson(await authRequest('/api/hoc-phi'), 'Không thể tải danh sách khoản thu.');
}

export async function createInvoice(invoice) {
    const token = await fetchCsrfToken();
    return readJson(await authRequest('/api/hoc-phi', {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': token },
        body: JSON.stringify(invoice),
    }), 'Không thể lập phiếu thu.');
}

export async function recordInvoicePayment(invoiceId, payment) {
    const token = await fetchCsrfToken();
    return readJson(await authRequest(`/api/hoc-phi/${invoiceId}/thanh-toan`, {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': token },
        body: JSON.stringify(payment),
    }), 'Không thể ghi nhận thanh toán.');
}

export async function createInvoiceQr(invoiceId) {
    const token = await fetchCsrfToken();
    return readJson(await authRequest(`/api/phu-huynh/hoc-phi/${invoiceId}/vietqr`, {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': token },
    }), 'Không thể tạo mã QR thanh toán.');
}
