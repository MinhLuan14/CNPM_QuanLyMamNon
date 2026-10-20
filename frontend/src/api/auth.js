import { API_BASE_URL } from '../config'

export async function fetchCsrfToken() {
    const response = await fetch(`${API_BASE_URL}/api/auth/csrf`, {
        credentials: 'include',
    })

    if (!response.ok) {
        throw new Error('Không thể khởi tạo phiên bảo mật. Vui lòng thử lại.')
    }

    const { token } = await response.json()
    return token
}

export async function authRequest(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...options.headers,
        },
    })

    return response
}

export async function responseError(response, fallback) {
    const contentType = response.headers.get('content-type') || ''

    try {
        if (contentType.includes('application/json')) {
            const body = await response.json()
            return body.detail || body.message || body.error || fallback
        }

        const body = await response.text()
        const message = body
            .match(/Request method ['"]?([A-Z]+)['"]? is not supported/i)

        if (message) {
            return `Phương thức ${message[1]} không được hỗ trợ tại địa chỉ này. Vui lòng quay lại màn hình đăng nhập và thử lại.`
        }

        return fallback
    } catch {
        return fallback
    }
}
