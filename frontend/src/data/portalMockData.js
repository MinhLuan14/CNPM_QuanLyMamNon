import {
  initialChildren,
  initialClasses,
  initialParents,
  initialTeachers,
  weeklyMenu,
} from './mockData'

const parentAccounts = {
  ph_vanhung: 'PH001',
  ph_thuhang: 'PH002',
}

const teacherAccounts = {
  gv_quynhnga: 'GV002',
  gv_honghanh: 'GV004',
  gv_trang: 'GV003',
}

const menuDates = ['2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17']

const createMenuItems = () => weeklyMenu.flatMap((day, index) => {
  const date = menuDates[index]
  return [
    {
      id: `${date}-breakfast`,
      date,
      meal: 'Bữa sáng',
      dish: day.breakfast.dish,
      ingredients: day.breakfast.beverage,
    },
    {
      id: `${date}-lunch`,
      date,
      meal: 'Bữa trưa',
      dish: `${day.lunch.main}; ${day.lunch.soup}`,
      ingredients: day.lunch.side,
    },
    {
      id: `${date}-snack`,
      date,
      meal: 'Bữa xế',
      dish: day.afternoonSnack.dish,
      ingredients: day.afternoonSnack.drink,
    },
  ]
})

const parentFinanceByChild = {
  TE001: {
    invoices: [{
      id: 'HD-DEMO-001',
      month: '10/2026',
      childName: 'Nguyễn Gia Bảo',
      totalAmount: 2350000,
      paidAmount: 1000000,
      remainingAmount: 1350000,
      dueDate: '2026-10-25',
      status: 'Còn phải thanh toán',
      items: [
        { type: 'Học phí tháng 10', amount: 1800000 },
        { type: 'Tiền ăn tháng 10', amount: 550000 },
      ],
    }],
    payments: [{
      id: 'GD-DEMO-001',
      paidAt: '2026-10-05T09:30:00',
      childName: 'Nguyễn Gia Bảo',
      month: '10/2026',
      method: 'Chuyển khoản (dữ liệu mẫu)',
      transactionCode: 'DEMO-001',
      amount: 1000000,
      status: 'Dữ liệu minh họa',
    }],
  },
  TE002: {
    invoices: [{
      id: 'HD-DEMO-002',
      month: '10/2026',
      childName: 'Trần Bảo Ngọc',
      totalAmount: 2200000,
      paidAmount: 2200000,
      remainingAmount: 0,
      dueDate: '2026-10-25',
      status: 'Đã thanh toán',
      items: [
        { type: 'Học phí tháng 10', amount: 1700000 },
        { type: 'Tiền ăn tháng 10', amount: 500000 },
      ],
    }],
    payments: [{
      id: 'GD-DEMO-002',
      paidAt: '2026-10-04T14:10:00',
      childName: 'Trần Bảo Ngọc',
      month: '10/2026',
      method: 'Tiền mặt (dữ liệu mẫu)',
      transactionCode: 'DEMO-002',
      amount: 2200000,
      status: 'Dữ liệu minh họa',
    }],
  },
}

const parentNotifications = [
  {
    id: 'PH-NOTICE-001',
    title: 'Thực đơn tuần mới',
    content: 'Nhà trường đã cập nhật thực đơn mẫu cho tuần này.',
    time: 'Hôm nay · 08:00',
    type: 'Dinh dưỡng',
  },
  {
    id: 'PH-NOTICE-002',
    title: 'Nhắc lịch họp phụ huynh',
    content: 'Lịch họp phụ huynh dự kiến vào sáng thứ Bảy tại lớp của bé.',
    time: 'Hôm qua · 16:30',
    type: 'Nhà trường',
  },
]

export function getParentPortalData(username) {
  const parentId = parentAccounts[username]
  const parent = initialParents.find((item) => item.id === parentId)

  if (!parent) {
    return {
      demo: true,
      parent: { fullName: '', phone: '', email: '', address: '' },
      children: [],
      menu: createMenuItems(),
      invoices: [],
      payments: [],
      notifications: [],
    }
  }

  const children = parent.children
    .map(({ id, relationship }) => {
      const child = initialChildren.find((item) => item.id === id)
      if (!child) return null
      const classroom = initialClasses.find((item) => item.id === child.classId)
      return {
        id: child.id,
        fullName: child.name,
        dateOfBirth: child.dob,
        className: child.className,
        teacherName: classroom?.mainTeacher || '',
        relationship,
      }
    })
    .filter(Boolean)
  const finance = parentFinanceByChild[children[0]?.id] || { invoices: [], payments: [] }

  return {
    demo: true,
    parent: {
      fullName: parent.name,
      phone: parent.phone,
      email: parent.email,
      address: parent.address,
    },
    children,
    menu: createMenuItems(),
    invoices: finance.invoices,
    payments: finance.payments,
    notifications: parentNotifications,
  }
}

const tasksByTeacher = {
  GV002: [
    { id: 'TASK-201', title: 'Chuẩn bị hoạt động nhận biết màu sắc', due: '2026-10-14', status: 'Đang thực hiện', category: 'Kế hoạch giảng dạy' },
    { id: 'TASK-202', title: 'Hoàn thiện nhận xét cuối tuần cho lớp', due: '2026-10-16', status: 'Chưa bắt đầu', category: 'Báo cáo' },
    { id: 'TASK-203', title: 'Trao đổi với phụ huynh bé Bảo Ngọc', due: '2026-10-15', status: 'Đã hoàn thành', category: 'Phối hợp phụ huynh' },
  ],
  GV003: [
    { id: 'TASK-301', title: 'Chuẩn bị góc tạo hình chủ đề mùa thu', due: '2026-10-14', status: 'Đang thực hiện', category: 'Kế hoạch giảng dạy' },
    { id: 'TASK-302', title: 'Gửi nhận xét tuần cho phụ huynh', due: '2026-10-16', status: 'Chưa bắt đầu', category: 'Báo cáo' },
  ],
  GV004: [
    { id: 'TASK-401', title: 'Hoàn thiện kế hoạch hoạt động tuần', due: '2026-10-14', status: 'Đang thực hiện', category: 'Kế hoạch giảng dạy' },
    { id: 'TASK-402', title: 'Chuẩn bị học liệu làm quen chữ cái', due: '2026-10-15', status: 'Chưa bắt đầu', category: 'Học liệu' },
    { id: 'TASK-403', title: 'Tổng hợp nhận xét phát triển của trẻ', due: '2026-10-16', status: 'Đã hoàn thành', category: 'Báo cáo' },
  ],
}

const notificationsByTeacher = {
  GV002: [
    { id: 'NT-201', title: 'Lịch sinh hoạt chuyên môn', content: 'Tổ Mầm họp tại phòng hội đồng vào 15:30 thứ Sáu.', time: 'Hôm nay · 08:15', type: 'Lịch họp' },
    { id: 'NT-202', title: 'Cập nhật thực đơn tuần', content: 'Thực đơn tuần mới đã được nhà trường công bố.', time: 'Hôm qua · 16:20', type: 'Nhà trường' },
  ],
  GV003: [
    { id: 'NT-301', title: 'Lịch sinh hoạt chuyên môn', content: 'Tổ Chồi họp tại phòng hội đồng vào 15:30 thứ Sáu.', time: 'Hôm nay · 08:15', type: 'Lịch họp' },
    { id: 'NT-302', title: 'Nhắc hạn báo cáo tuần', content: 'Vui lòng hoàn tất nhận xét cuối tuần trước 17:00 thứ Sáu.', time: 'Hôm qua · 16:20', type: 'Nhắc việc' },
  ],
  GV004: [
    { id: 'NT-401', title: 'Lịch sinh hoạt chuyên môn', content: 'Tổ Lá họp tại phòng hội đồng vào 15:30 thứ Sáu.', time: 'Hôm nay · 08:15', type: 'Lịch họp' },
    { id: 'NT-402', title: 'Cập nhật thực đơn tuần', content: 'Thực đơn tuần mới đã được nhà trường công bố.', time: 'Hôm qua · 16:20', type: 'Nhà trường' },
  ],
}

export function getTeacherPortalData(username, user) {
  const teacherId = teacherAccounts[username]
  const teacher = initialTeachers.find((item) => item.id === teacherId)
  const classroom = teacher && initialClasses.find((item) => item.name === teacher.assignedClass)
  const children = classroom
    ? initialChildren.filter((child) => child.classId === classroom.id)
    : []

  return {
    demo: true,
    teacher: teacher || {
      name: user?.hoTen || user?.tenDangNhap || 'Giáo viên',
      email: '',
      phone: '',
      qualification: '',
      experience: '',
      role: 'Giáo viên',
    },
    classroom: classroom || null,
    children,
    menu: weeklyMenu,
    tasks: tasksByTeacher[teacherId] || [],
    notifications: notificationsByTeacher[teacherId] || [],
  }
}
