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
        return {
            id: child.maTre,
            fullName: fullName(child.hoTenDemTre, child.tenTre),
            dateOfBirth: child.ngayThangNamSinh,
            className: child.tenLopHoc || '',
            classId: child.maLopHoc,
            status: child.trangThaiHocTap,
            relationship: link.quanHe || '',
            teacherName: '',
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
    const [children, invoicesResult] = await Promise.all([
        Promise.all((profile.treEm || []).map(readLinkedChild)),
        readJson('/api/phu-huynh/hoc-phi', 'Không thể tải danh sách học phí.')
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
    return {
        parent: {
            fullName: profile.hoTen || '',
            phone: profile.soDienThoai || '',
            email: profile.email || '',
            address: profile.diaChiLH || '',
        },
        children,
        menu: [],
        invoices,
        invoiceError: invoicesAvailable ? '' : invoicesResult.error.message,
        payments: [],
        notifications: [],
        availability: {
            menu: false,
            invoices: invoicesAvailable,
            payments: false,
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
