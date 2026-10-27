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

const DEFAULT_TEACHER_TASKS = [
    {
        id: 1,
        title: '07:00 - 07:30: Đón trẻ và kiểm tra sức khỏe đầu ngày',
        category: 'Đón trẻ',
        due: new Date().toISOString().slice(0, 10),
        status: 'Đã hoàn thành',
    },
    {
        id: 2,
        title: '08:00 - 08:30: Điểm danh sĩ số lớp và báo suất ăn',
        category: 'Điểm danh',
        due: new Date().toISOString().slice(0, 10),
        status: 'Đang thực hiện',
    },
    {
        id: 3,
        title: '09:00 - 10:00: Hoạt động ngoài trời / Khám phá góc học tập',
        category: 'Giảng dạy',
        due: new Date().toISOString().slice(0, 10),
        status: 'Đang thực hiện',
    },
    {
        id: 4,
        title: '11:30 - 14:00: Cho trẻ ăn trưa và ngủ trưa',
        category: 'Chăm sóc',
        due: new Date().toISOString().slice(0, 10),
        status: 'Đang thực hiện',
    },
    {
        id: 5,
        title: '16:00 - 17:00: Trả trẻ cho phụ huynh',
        category: 'Trả trẻ',
        due: new Date().toISOString().slice(0, 10),
        status: 'Đang thực hiện',
    },
];

const DEFAULT_TEACHER_NOTIFICATIONS = [
    {
        id: 1,
        title: 'Lịch họp chuyên môn tổ Mầm non định kỳ',
        content: 'Kính mời giáo viên khối Mầm tham dự buổi họp chuyên môn vào lúc 14:00 Thứ Sáu tại phòng Hội đồng sư phạm.',
        type: 'Chuyên môn',
        time: 'Hôm nay, 08:30',
    },
    {
        id: 2,
        title: 'Thông báo lịch khám sức khỏe và tiêm chủng đợt 1',
        content: 'Bộ phận Y tế nhà trường sẽ tiến hành kiểm tra cân nặng, chiều cao và tiêm phòng uốn ván cho Lớp Mầm 1 vào sáng Thứ Tư.',
        type: 'Y tế',
        time: 'Hôm qua',
    },
    {
        id: 3,
        title: 'Nhắc nhở hoàn thiện giáo án chuyên đề tuần tới',
        content: 'Giáo viên phụ trách vui lòng gửi giáo án điện tử chủ đề Vận động và Tạo hình lên hệ thống trước 17:00 ngày Thứ Năm.',
        type: 'Nhà trường',
        time: '2 ngày trước',
    },
];

const DEFAULT_TEACHER_MENU = [
    {
        day: 'Thứ Hai',
        date: '26/10/2026',
        breakfast: { dish: 'Cháo sườn bắp non', beverage: 'Sữa tươi Nutifood' },
        lunch: { main: 'Thịt heo kho trứng cút', soup: 'Canh bí đỏ thịt bằm', side: 'Bắp cải xào cà rốt', dessert: 'Chuối cau' },
        afternoonSnack: { dish: 'Bánh flan caramen', drink: 'Nước cam vắt tươi' },
    },
    {
        day: 'Thứ Ba',
        date: '27/10/2026',
        breakfast: { dish: 'Phở gà xé rau mùi', beverage: 'Sữa đậu nành mè đen' },
        lunch: { main: 'Cá hồi sốt cà chua', soup: 'Canh rau ngót nấu tôm', side: 'Su su xào thịt bò', dessert: 'Dưa hấu' },
        afternoonSnack: { dish: 'Sữa chua trái cây dầm', drink: 'Nước lọc tiệt trùng' },
    },
    {
        day: 'Thứ Tư',
        date: '28/10/2026',
        breakfast: { dish: 'Nui xoắn nấu sườn heo', beverage: 'Sữa hạt óc chó yến mạch' },
        lunch: { main: 'Tôm rim thịt nạc', soup: 'Canh mồng tơi cua đồng', side: 'Đậu cô ve xào nấm', dessert: 'Đu đủ chín' },
        afternoonSnack: { dish: 'Bánh bông lan chuối', drink: 'Sữa tươi Nutifood' },
    },
    {
        day: 'Thứ Năm',
        date: '29/10/2026',
        breakfast: { dish: 'Súp cua bắp non gà xé', beverage: 'Sữa hạt hạnh nhân' },
        lunch: { main: 'Thịt bò xào nấm kim châm', soup: 'Canh cải ngọt nấu thịt bằm', side: 'Cà rốt luộc', dessert: 'Thanh long' },
        afternoonSnack: { dish: 'Chè đậu xanh hạt sen', drink: 'Nước ép táo' },
    },
    {
        day: 'Thứ Sáu',
        date: '30/10/2026',
        breakfast: { dish: 'Bánh canh tôm thịt nạc', beverage: 'Sữa tươi tiệt trùng' },
        lunch: { main: 'Gà rim mật ong mè rang', soup: 'Canh bí xanh hầm xương', side: 'Rau muống xào tỏi', dessert: 'Táo tươi' },
        afternoonSnack: { dish: 'Bánh su kem vani', drink: 'Sữa chua uống' },
    },
];

async function loadWeeklyMenu() {
    try {
        const menus = await readJson('/api/thuc-don', 'Không thể tải danh sách thực đơn.');
        if (Array.isArray(menus) && menus.length > 0) {
            const activeMenu = menus.find((m) => m.trangThai) || menus[0];
            const detail = await readJson(`/api/thuc-don/${activeMenu.maThucDon}`, 'Không thể tải chi tiết thực đơn.');
            if (detail && Array.isArray(detail.chiTiet) && detail.chiTiet.length > 0) {
                const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
                const grouped = {};
                detail.chiTiet.forEach((item) => {
                    if (!item.ngayAn) return;
                    const dateKey = item.ngayAn.slice(0, 10);
                    const d = new Date(item.ngayAn);
                    const dayName = weekdays[d.getDay()] || 'Thứ Hai';
                    if (!grouped[dateKey]) {
                        grouped[dateKey] = {
                            day: dayName,
                            date: d.toLocaleDateString('vi-VN'),
                            breakfast: { dish: 'Cháo sườn bắp non', beverage: 'Sữa tươi Nutifood' },
                            lunch: { main: 'Cơm dẻo', soup: 'Canh bí đỏ thịt bằm', side: 'Bắp cải xào', dessert: 'Chuối cau' },
                            afternoonSnack: { dish: 'Bánh flan caramen', drink: 'Nước cam vắt tươi' },
                        };
                    }
                    const dishName = item.monAn?.tenMonAn || item.ghiChu || '';
                    const meal = (item.buaAn || '').toLowerCase();
                    if (meal.includes('sáng') || meal.includes('phụ sáng')) {
                        if (item.monAn?.loaiMon === 'Đồ uống') grouped[dateKey].breakfast.beverage = dishName;
                        else grouped[dateKey].breakfast.dish = dishName;
                    } else if (meal.includes('trưa')) {
                        if (item.monAn?.loaiMon === 'Món canh') grouped[dateKey].lunch.soup = dishName;
                        else if (item.monAn?.loaiMon === 'Món rau') grouped[dateKey].lunch.side = dishName;
                        else if (item.monAn?.loaiMon === 'Tráng miệng') grouped[dateKey].lunch.dessert = dishName;
                        else grouped[dateKey].lunch.main = dishName;
                    } else if (meal.includes('chiều') || meal.includes('xế')) {
                        if (item.monAn?.loaiMon === 'Đồ uống') grouped[dateKey].afternoonSnack.drink = dishName;
                        else grouped[dateKey].afternoonSnack.dish = dishName;
                    }
                });
                const formatted = Object.keys(grouped)
                    .sort()
                    .map((k) => grouped[k]);
                if (formatted.length > 0) return formatted;
            }
        }
    } catch {
        // Fallback to DEFAULT_TEACHER_MENU
    }
    return DEFAULT_TEACHER_MENU;
}

export async function loadTeacherPortalData() {
    const profile = await readJson('/api/profile', 'Không thể tải hồ sơ giáo viên.');
    const assignments = (profile.phanCong || []).filter((assignment) => assignment.dangPhuTrach);
    const [classResults, menu] = await Promise.all([
        Promise.allSettled(assignments.map(readTeacherClass)),
        loadWeeklyMenu(),
    ]);
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
            schoolYear: '2026 - 2027',
            assistantTeacher: 'Cô Mai Lan (Bảo mẫu)',
            current: primaryClass.children.length,
            capacity: primaryClass.classroom.soLuongToiDa ?? 25,
        } : null,
        classCount: classes.length,
        children,
        tasks: DEFAULT_TEACHER_TASKS,
        notifications: DEFAULT_TEACHER_NOTIFICATIONS,
        menu,
        availability: {
            tasks: true,
            notifications: true,
            menu: true,
            parentContacts: false,
        },
    };
}
