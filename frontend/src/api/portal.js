import { authRequest, responseError } from './auth';

async function readJson(path, fallback) {
    const response = await authRequest(path);
    if (!response.ok) throw new Error(await responseError(response, fallback));
    return response.json();
}

function fullName(first, last) {
    return [first, last].filter(Boolean).join(' ').trim();
}

function mapPublishedMenus(data) {
    return data.map((menu) => ({
        id: menu.maThucDon,
        week: menu.tuanApDung,
        month: menu.thangApDung,
        year: menu.namApDung,
        startDate: menu.ngayBatDau,
        endDate: menu.ngayKetThuc,
        note: menu.ghiChu || '',
        items: (menu.chiTiet || []).map((item) => ({
            id: item.maChiTietThucDon,
            date: item.ngayAn,
            meal: item.buaAn || '',
            dish: item.monAn?.tenMonAn || '',
            ingredients: item.monAn?.thanhPhan || '',
            note: item.ghiChu || '',
        })),
    }));
}

export async function getParentMenus(childId) {
    const data = await readJson(
        `/api/phu-huynh/thuc-don?maTre=${encodeURIComponent(childId)}`,
        'Không thể tải thực đơn đã công bố.',
    );
    return mapPublishedMenus(data);
}

export async function getTeacherMenus(classId) {
    const data = await readJson(
        `/api/giao-vien/thuc-don?maLopHoc=${encodeURIComponent(classId)}`,
        'Không thể tải thực đơn của lớp.',
    );
    return mapPublishedMenus(data);
}

export async function loadParentPortalData() {
    const childProfiles = await readJson('/api/phu-huynh/ho-so-cac-be', 'Không thể tải hồ sơ học sinh.');
    const parentProfile = childProfiles.phuHuynh || {};
    const children = (childProfiles.treEm || []).map((child) => ({
        id: child.maTre,
        fullName: fullName(child.hoTenDemTre, child.tenTre),
        firstName: child.tenTre || '',
        imageUrl: child.avatarUrl || '',
        dateOfBirth: child.ngayThangNamSinh,
        className: child.tenLopHoc || '',
        relationship: child.quanHe || '',
        teacherName: (child.giaoVienPhuTrach || []).join(', '),
    }));
    const [invoicesResult, menusResult] = await Promise.all([
        readJson('/api/phu-huynh/hoc-phi', 'Không thể tải danh sách học phí.')
            .then((data) => ({ status: 'fulfilled', data }))
            .catch((error) => ({ status: 'rejected', error })),
        (children.length
            ? getParentMenus(children[0].id)
            : Promise.resolve([]))
            .then((data) => ({ status: 'fulfilled', data }))
            .catch((error) => ({ status: 'rejected', error })),
    ]);
    const invoicesAvailable = invoicesResult.status === 'fulfilled';
    const invoices = invoicesAvailable
        ? invoicesResult.data.map((invoice) => ({
            id: invoice.maHocPhi,
            childId: invoice.maTre,
            month: `${invoice.thangApDung}/${invoice.namApDung}`,
            monthNumber: invoice.thangApDung,
            year: invoice.namApDung,
            childName: invoice.hoTenTre,
            className: invoice.tenLopHoc || '',
            createdAt: invoice.ngayLap,
            totalAmount: invoice.tongTien == null ? 0 : Number(invoice.tongTien),
            paidAmount: invoice.daThanhToan == null ? 0 : Number(invoice.daThanhToan),
            remainingAmount: invoice.conLai == null ? 0 : Number(invoice.conLai),
            status: invoice.trangThai || '',
            dueDate: invoice.hanThanhToan,
            hasRecordedPayment: invoice.daCoGiaoDich,
            items: (invoice.chiTiet || []).map((item) => ({
                id: item.maChiTietHocPhi,
                type: item.loaiPhi,
                description: item.noiDung,
                quantity: item.soLuong,
                unitPrice: item.donGia == null ? null : Number(item.donGia),
                amount: item.thanhTien == null ? null : Number(item.thanhTien),
            })),
            payment: invoice.thanhToan ? {
                id: invoice.thanhToan.maThanhToan,
                amount: invoice.thanhToan.soTienThanhToan == null
                    ? null
                    : Number(invoice.thanhToan.soTienThanhToan),
                method: invoice.thanhToan.phuongThucThanhToan || '',
                transactionCode: invoice.thanhToan.maGiaoDich || '',
                paidAt: invoice.thanhToan.thoiGianThanhToan,
                status: invoice.thanhToan.trangThai || '',
                description: invoice.thanhToan.noiDung || '',
            } : null,
        }))
        : [];
    const payments = invoices
        .filter((invoice) => invoice.payment)
        .map((invoice) => ({
            ...invoice.payment,
            invoiceId: invoice.id,
            childName: invoice.childName,
            month: invoice.month,
        }));
    const menuAvailable = menusResult.status === 'fulfilled';
    const publishedMenus = menuAvailable ? menusResult.data : [];
    const menu = publishedMenus.flatMap((publishedMenu) => publishedMenu.items);
    return {
        parent: {
            fullName: fullName(parentProfile.hoTenDemPH, parentProfile.tenPH),
            phone: parentProfile.soDienThoai || '',
            email: parentProfile.email || '',
            address: parentProfile.diaChiLH || '',
        },
        children,
        menu,
        publishedMenus,
        menuError: menuAvailable ? '' : menusResult.error.message,
        invoices,
        invoiceError: invoicesAvailable ? '' : invoicesResult.error.message,
        payments,
        notifications: [],
        availability: {
            menu: menuAvailable,
            invoices: invoicesAvailable,
            payments: invoicesAvailable,
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
        menuClasses: assignments.map((assignment) => ({
            id: assignment.maLopHoc,
            name: assignment.tenLopHoc,
        })),
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
