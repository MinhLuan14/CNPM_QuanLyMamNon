import { authRequest, responseError } from './auth';

async function readJson(path, fallback) {
    const response = await authRequest(path);
    if (!response.ok) throw new Error(await responseError(response, fallback));
    return response.json();
}

function fullName(first, last) {
    return [first, last].filter(Boolean).join(' ').trim();
}

async function readLinkedChild(link) {
    try {
        const child = await readJson(`/api/tre-em/${link.maTre}`, 'Không thể tải hồ sơ trẻ.');
        let teacherName = '';
        if (child.maLopHoc) {
            try {
                const teachers = await readJson(`/api/phu-huynh/lop-hoc/${child.maLopHoc}/giao-vien`, 'Không thể tải giáo viên phụ trách.');
                if (Array.isArray(teachers) && teachers.length > 0) {
                    teacherName = teachers.join(', ');
                }
            } catch {
                teacherName = '';
            }
        }
        return {
            id: child.maTre,
            fullName: fullName(child.hoTenDemTre, child.tenTre),
            dateOfBirth: child.ngayThangNamSinh,
            className: child.tenLopHoc || '',
            classId: child.maLopHoc,
            status: child.trangThaiHocTap,
            relationship: link.quanHe || '',
            teacherName,
        };
    } catch {
        return {
            id: link.maTre,
            fullName: fullName(link.hoTenDemTre, link.tenTre),
            dateOfBirth: null,
            className: '',
            classId: null,
            status: '',
            relationship: link.quanHe || '',
            teacherName: '',
        };
    }
}

export async function loadParentPortalData() {
    const profile = await readJson('/api/profile', 'Không thể tải hồ sơ phụ huynh.');
    const [children, invoicesResult, menuResult, paymentsResult] = await Promise.all([
        Promise.all((profile.treEm || []).map(readLinkedChild)),
        readJson('/api/phu-huynh/hoc-phi', 'Không thể tải danh sách học phí.')
            .then((data) => ({ status: 'fulfilled', data }))
            .catch((error) => ({ status: 'rejected', error })),
        readJson('/api/thuc-don', 'Không thể tải thực đơn.')
            .then((data) => ({ status: 'fulfilled', data }))
            .catch((error) => ({ status: 'rejected', error })),
        readJson('/api/phu-huynh/thanh-toan', 'Không thể tải lịch sử thanh toán.')
            .then((data) => ({ status: 'fulfilled', data }))
            .catch((error) => ({ status: 'rejected', error })),
    ]);
    const invoicesAvailable = invoicesResult.status === 'fulfilled';
    const invoices = invoicesAvailable
        ? invoicesResult.data.map((invoice) => ({
            id: invoice.maHocPhi,
            month: `${invoice.thangApDung}/${invoice.namApDung}`,
            childName: invoice.hoTenTre,
            className: invoice.tenLopHoc || '',
            totalAmount: Number(invoice.tongTien),
            paidAmount: Number(invoice.daThanhToan),
            remainingAmount: Number(invoice.conLai),
            status: invoice.trangThai || '',
            dueDate: invoice.hanThanhToan,
            hasRecordedPayment: invoice.daCoGiaoDich,
            items: (invoice.chiTiet || []).map((item) => ({
                type: item.loaiPhi,
                description: item.noiDung,
                amount: Number(item.thanhTien),
            })),
        }))
        : [];
    const menuAvailable = menuResult.status === 'fulfilled';
    const menu = menuAvailable
        ? menuResult.data
            .flatMap((td) => (td.chiTiet || []).map((ct) => ({
                id: ct.maChiTietThucDon,
                date: ct.ngayAn,
                meal: ct.buaAn,
                dish: ct.monAn?.tenMonAn || '',
                ingredients: ct.monAn?.thanhPhan || '',
                note: ct.ghiChu || '',
            })))
            .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
        : [];
    const paymentsAvailable = paymentsResult.status === 'fulfilled';
    const payments = paymentsAvailable
        ? paymentsResult.data.map((payment) => ({
            id: payment.maThanhToan,
            paidAt: payment.thoiGianThanhToan,
            childName: payment.hoTenTre,
            month: payment.thangNamHocPhi,
            method: payment.phuongThucThanhToan,
            transactionCode: payment.maGiaoDich,
            amount: Number(payment.soTienThanhToan),
            status: payment.trangThai || 'Đã ghi nhận',
        }))
        : [];
    return {
        parent: {
            fullName: profile.hoTen || '',
            phone: profile.soDienThoai || '',
            email: profile.email || '',
            address: profile.diaChiLH || '',
        },
        children,
        menu,
        invoices,
        invoiceError: invoicesAvailable ? '' : invoicesResult.error.message,
        payments,
        notifications: [],
        availability: {
            menu: menuAvailable,
            invoices: invoicesAvailable,
            payments: paymentsAvailable,
            notifications: false,
        },
    };
}

async function readTeacherClass(assignment) {
    const [classroom, children] = await Promise.all([
        readJson(`/api/lop-hoc/${assignment.maLopHoc}`, 'Không thể tải thông tin lớp.'),
        readJson(`/api/lop-hoc/${assignment.maLopHoc}/tre-em`, 'Không thể tải danh sách trẻ trong lớp.'),
    ]);
    return { assignment, classroom, children };
}

export async function loadTeacherPortalData() {
    const profile = await readJson('/api/profile', 'Không thể tải hồ sơ giáo viên.');
    const assignments = (profile.phanCong || []).filter((assignment) => assignment.dangPhuTrach);
    const classResults = await Promise.allSettled(assignments.map(readTeacherClass));
    const classes = classResults
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value);
    const primaryClass = classes[0] || null;
    const children = classes.flatMap(({ classroom, children: classChildren }) => classChildren.map((child) => ({
        id: child.maTre,
        name: fullName(child.hoTenDemTre, child.tenTre),
        nickname: child.tenTre || '',
        dob: child.ngayThangNamSinh || '',
        status: child.trangThaiHocTap || 'Chưa xác định',
        className: classroom.tenLopHoc,
        parentName: '',
        parentRelationship: '',
        parentPhone: '',
    })));

    return {
        teacher: { name: profile.hoTen || profile.tenDangNhap || '' },
        classroom: primaryClass ? {
            name: primaryClass.classroom.tenLopHoc,
            grade: primaryClass.classroom.doTuoi || 'Chưa cập nhật',
            ageGroup: primaryClass.classroom.doTuoi || 'Chưa cập nhật',
            room: primaryClass.classroom.phongHoc ?? 'Chưa cập nhật',
            schoolYear: 'Chưa có dữ liệu',
            assistantTeacher: 'Chưa có dữ liệu',
            current: primaryClass.children.length,
            capacity: primaryClass.classroom.soLuongToiDa ?? null,
        } : null,
        classCount: classes.length,
        children,
        tasks: [],
        notifications: [],
        menu: [],
        availability: {
            tasks: false,
            notifications: false,
            menu: false,
            parentContacts: false,
        },
    };
}
