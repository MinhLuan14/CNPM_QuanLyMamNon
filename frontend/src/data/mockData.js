// Mock data for BabyShark Kindergarten Management System
// Aligned with SQLQLMamNon.sql schema and business requirements

export const initialClasses = [
  { id: 'LOP01', name: 'Nhà trẻ Hoa Sen', grade: 'Nhà trẻ', ageGroup: '18 - 24 tháng', room: 'P.101', capacity: 20, current: 18, mainTeacher: 'Nguyễn Thị Mai', assistantTeacher: 'Lê Thu Hương', schoolYear: '2025-2026', color: '#ff7875' },
  { id: 'LOP02', name: 'Nhà trẻ Vàng Anh', grade: 'Nhà trẻ', ageGroup: '24 - 36 tháng', room: 'P.102', capacity: 22, current: 20, mainTeacher: 'Trần Mỹ Dung', assistantTeacher: 'Hoàng Yến', schoolYear: '2025-2026', color: '#ff9c6e' },
  { id: 'LOP03', name: 'Mầm 1 (Mặt Trời Nhỏ)', grade: 'Mầm', ageGroup: '3 - 4 tuổi', room: 'P.201', capacity: 25, current: 24, mainTeacher: 'Phạm Quỳnh Nga', assistantTeacher: 'Đỗ Thảo Vy', schoolYear: '2025-2026', color: '#ffc069' },
  { id: 'LOP04', name: 'Mầm 2 (Họa Mi)', grade: 'Mầm', ageGroup: '3 - 4 tuổi', room: 'P.202', capacity: 25, current: 22, mainTeacher: 'Vũ Lan Anh', assistantTeacher: 'Nguyễn Bích Ngọc', schoolYear: '2025-2026', color: '#95de64' },
  { id: 'LOP05', name: 'Chồi 1 (Thỏ Trắng)', grade: 'Chồi', ageGroup: '4 - 5 tuổi', room: 'P.301', capacity: 28, current: 27, mainTeacher: 'Đặng Thùy Trang', assistantTeacher: 'Bùi Kim Oanh', schoolYear: '2025-2026', color: '#5cdbd3' },
  { id: 'LOP06', name: 'Chồi 2 (Gấu Trúc)', grade: 'Chồi', ageGroup: '4 - 5 tuổi', room: 'P.302', capacity: 28, current: 26, mainTeacher: 'Nguyễn Thị Duyên', assistantTeacher: 'Phan Tuyết Mai', schoolYear: '2025-2026', color: '#69c0ff' },
  { id: 'LOP07', name: 'Lá 1 (Ngôi Sao Xanh)', grade: 'Lá', ageGroup: '5 - 6 tuổi', room: 'P.401', capacity: 30, current: 29, mainTeacher: 'Lê Hồng Hạnh', assistantTeacher: 'Trương Ngọc Trâm', schoolYear: '2025-2026', color: '#85a5ff' },
  { id: 'LOP08', name: 'Lá 2 (Búp Sen Non)', grade: 'Lá', ageGroup: '5 - 6 tuổi', room: 'P.402', capacity: 30, current: 28, mainTeacher: 'Trịnh Cẩm Tú', assistantTeacher: 'Lý Kim Phượng', schoolYear: '2025-2026', color: '#b37feb' },
];

export const initialChildren = [
  {
    id: 'TE001',
    name: 'Nguyễn Gia Bảo',
    nickname: 'Bim Bim',
    dob: '2021-03-15',
    gender: 'Nam',
    classId: 'LOP05',
    className: 'Chồi 1 (Thỏ Trắng)',
    enrollDate: '2023-09-05',
    parentName: 'Nguyễn Văn Hùng',
    parentPhone: '0912345678',
    parentRelationship: 'Bố',
    address: '124 Đường 3/2, Quận 10, TP.HCM',
    healthStatus: 'Bình thường',
    allergy: 'Không có',
    height: '104 cm',
    weight: '16.5 kg',
    status: 'Đang học',
    avatarBg: '#ff7875',
    attendanceToday: 'Có mặt',
    tempToday: '36.6°C',
    eatingToday: 'Ăn hết suất',
    sleepingToday: 'Ngủ ngon 2h'
  },
  {
    id: 'TE002',
    name: 'Trần Bảo Ngọc',
    nickname: 'Búp Bê',
    dob: '2022-07-20',
    gender: 'Nữ',
    classId: 'LOP03',
    className: 'Mầm 1 (Mặt Trời Nhỏ)',
    enrollDate: '2024-08-15',
    parentName: 'Lê Thị Thu Hằng',
    parentPhone: '0988776655',
    parentRelationship: 'Mẹ',
    address: '45 Lê Hồng Phong, Quận 5, TP.HCM',
    healthStatus: 'Dị ứng hải sản nhẹ',
    allergy: 'Tôm, cua',
    height: '96 cm',
    weight: '14.2 kg',
    status: 'Đang học',
    avatarBg: '#ff85c0',
    attendanceToday: 'Có mặt',
    tempToday: '36.8°C',
    eatingToday: 'Ăn hết suất',
    sleepingToday: 'Ngủ ngoan 1.5h'
  },
  {
    id: 'TE003',
    name: 'Lê Minh Khang',
    nickname: 'Cún Con',
    dob: '2020-11-10',
    gender: 'Nam',
    classId: 'LOP07',
    className: 'Lá 1 (Ngôi Sao Xanh)',
    enrollDate: '2022-09-01',
    parentName: 'Lê Văn Cường',
    parentPhone: '0933221100',
    parentRelationship: 'Bố',
    address: '89 Nguyễn Trãi, Quận 1, TP.HCM',
    healthStatus: 'Tốt, nhanh nhẹn',
    allergy: 'Không có',
    height: '115 cm',
    weight: '20.0 kg',
    status: 'Đang học',
    avatarBg: '#69c0ff',
    attendanceToday: 'Có mặt',
    tempToday: '36.5°C',
    eatingToday: 'Ăn thêm tráng miệng',
    sleepingToday: 'Ngủ ngoan 2h'
  },
  {
    id: 'TE004',
    name: 'Phạm Phương Linh',
    nickname: 'Bông Lan',
    dob: '2023-01-08',
    gender: 'Nữ',
    classId: 'LOP01',
    className: 'Nhà trẻ Hoa Sen',
    enrollDate: '2024-10-01',
    parentName: 'Phạm Hoàng Nam',
    parentPhone: '0977112233',
    parentRelationship: 'Bố',
    address: '56 Trần Phú, Quận 5, TP.HCM',
    healthStatus: 'Dễ sổ mũi khi trở trời',
    allergy: 'Không dung nạp đường lactose',
    height: '84 cm',
    weight: '11.8 kg',
    status: 'Đang học',
    avatarBg: '#ffd666',
    attendanceToday: 'Có phép',
    tempToday: 'Nghỉ ốm',
    eatingToday: '--',
    sleepingToday: '--'
  },
  {
    id: 'TE005',
    name: 'Hoàng Tuấn Kiệt',
    nickname: 'Suboi',
    dob: '2021-05-18',
    gender: 'Nam',
    classId: 'LOP05',
    className: 'Chồi 1 (Thỏ Trắng)',
    enrollDate: '2023-09-05',
    parentName: 'Hoàng Anh Tuấn',
    parentPhone: '0909554433',
    parentRelationship: 'Bố',
    address: '22 Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
    healthStatus: 'Bình thường',
    allergy: 'Không có',
    height: '106 cm',
    weight: '17.2 kg',
    status: 'Đang học',
    avatarBg: '#95de64',
    attendanceToday: 'Có mặt',
    tempToday: '36.6°C',
    eatingToday: 'Ăn hết suất',
    sleepingToday: 'Ngủ ngon 2h'
  },
  {
    id: 'TE006',
    name: 'Đặng Ngọc Ánh',
    nickname: 'Miu Miu',
    dob: '2020-09-24',
    gender: 'Nữ',
    classId: 'LOP08',
    className: 'Lá 2 (Búp Sen Non)',
    enrollDate: '2022-09-01',
    parentName: 'Đặng Quốc Bảo',
    parentPhone: '0938123987',
    parentRelationship: 'Bố',
    address: '101 Cách Mạng Tháng 8, Quận 3, TP.HCM',
    healthStatus: 'Thể lực tốt',
    allergy: 'Không có',
    height: '113 cm',
    weight: '19.5 kg',
    status: 'Đang học',
    avatarBg: '#ff85c0',
    attendanceToday: 'Có mặt',
    tempToday: '36.7°C',
    eatingToday: 'Ăn hết suất',
    sleepingToday: 'Ngủ sâu 2h'
  },
  {
    id: 'TE007',
    name: 'Vũ Đức Trí',
    nickname: 'Bắp Cải',
    dob: '2022-12-05',
    gender: 'Nam',
    classId: 'LOP04',
    className: 'Mầm 2 (Họa Mi)',
    enrollDate: '2024-09-03',
    parentName: 'Vũ Quang Huy',
    parentPhone: '0944332211',
    parentRelationship: 'Bố',
    address: '15 Lý Thường Kiệt, Quận 10, TP.HCM',
    healthStatus: 'Bình thường',
    allergy: 'Không có',
    height: '95 cm',
    weight: '13.9 kg',
    status: 'Đang học',
    avatarBg: '#69c0ff',
    attendanceToday: 'Có mặt',
    tempToday: '36.5°C',
    eatingToday: 'Ăn hết phần cơm',
    sleepingToday: 'Ngủ ngon 1.5h'
  },
  {
    id: 'TE008',
    name: 'Bùi Khánh Linh',
    nickname: 'Dâu Tây',
    dob: '2023-04-12',
    gender: 'Nữ',
    classId: 'LOP02',
    className: 'Nhà trẻ Vàng Anh',
    enrollDate: '2024-11-01',
    parentName: 'Bùi Thị Thanh',
    parentPhone: '0918776644',
    parentRelationship: 'Mẹ',
    address: '78 Sư Vạn Hạnh, Quận 10, TP.HCM',
    healthStatus: 'Bình thường',
    allergy: 'Không có',
    height: '86 cm',
    weight: '12.2 kg',
    status: 'Đang học',
    avatarBg: '#ff7875',
    attendanceToday: 'Có mặt',
    tempToday: '36.7°C',
    eatingToday: 'Uống hết sữa và ăn cháo',
    sleepingToday: 'Ngủ trưa 2h'
  }
];

export const initialTeachers = [
  {
    id: 'GV001',
    name: 'Nguyễn Thị Mai',
    dob: '1992-06-14',
    phone: '0903123456',
    email: 'mai.nguyen@babyshark.edu.vn',
    qualification: 'Cử nhân Sư phạm Mầm non (ĐH Sư Phạm TP.HCM)',
    experience: '8 năm kinh nghiệm',
    assignedClass: 'Nhà trẻ Hoa Sen',
    role: 'Giáo viên chủ nhiệm',
    salary: '11,500,000 đ',
    status: 'Đang giảng dạy',
    avatarBg: '#ff7875'
  },
  {
    id: 'GV002',
    name: 'Phạm Quỳnh Nga',
    dob: '1994-08-22',
    phone: '0918987654',
    email: 'nga.pham@babyshark.edu.vn',
    qualification: 'Thạc sĩ Giáo dục Mầm non',
    experience: '6 năm kinh nghiệm',
    assignedClass: 'Mầm 1 (Mặt Trời Nhỏ)',
    role: 'Giáo viên chủ nhiệm - Tổ trưởng chuyên môn',
    salary: '13,200,000 đ',
    status: 'Đang giảng dạy',
    avatarBg: '#ff85c0'
  },
  {
    id: 'GV003',
    name: 'Đặng Thùy Trang',
    dob: '1995-12-05',
    phone: '0987654321',
    email: 'trang.dang@babyshark.edu.vn',
    qualification: 'Cử nhân Sư phạm Mầm non',
    experience: '5 năm kinh nghiệm',
    assignedClass: 'Chồi 1 (Thỏ Trắng)',
    role: 'Giáo viên chủ nhiệm',
    salary: '10,800,000 đ',
    status: 'Đang giảng dạy',
    avatarBg: '#5cdbd3'
  },
  {
    id: 'GV004',
    name: 'Lê Hồng Hạnh',
    dob: '1990-03-30',
    phone: '0977223344',
    email: 'hanh.le@babyshark.edu.vn',
    qualification: 'Cử nhân Sư phạm Mầm non - Chứng chỉ Montessori',
    experience: '10 năm kinh nghiệm',
    assignedClass: 'Lá 1 (Ngôi Sao Xanh)',
    role: 'Giáo viên chủ nhiệm - Khối trưởng Khối Lá',
    salary: '14,000,000 đ',
    status: 'Đang giảng dạy',
    avatarBg: '#69c0ff'
  },
  {
    id: 'GV005',
    name: 'Trần Mỹ Dung',
    dob: '1996-09-17',
    phone: '0933445566',
    email: 'dung.tran@babyshark.edu.vn',
    qualification: 'Cao đẳng Sư phạm Mầm non Trung ương',
    experience: '4 năm kinh nghiệm',
    assignedClass: 'Nhà trẻ Vàng Anh',
    role: 'Giáo viên chủ nhiệm',
    salary: '9,800,000 đ',
    status: 'Đang giảng dạy',
    avatarBg: '#ffc069'
  },
  {
    id: 'GV006',
    name: 'Vũ Lan Anh',
    dob: '1993-11-20',
    phone: '0912445588',
    email: 'lananh.vu@babyshark.edu.vn',
    qualification: 'Cử nhân Sư phạm Mầm non',
    experience: '7 năm kinh nghiệm',
    assignedClass: 'Mầm 2 (Họa Mi)',
    role: 'Giáo viên chủ nhiệm',
    salary: '11,000,000 đ',
    status: 'Đang giảng dạy',
    avatarBg: '#95de64'
  }
];

export const initialParents = [
  {
    id: 'PH001',
    name: 'Nguyễn Văn Hùng',
    gender: 'Nam',
    phone: '0912345678',
    email: 'hung.nguyen@gmail.com',
    job: 'Kỹ sư CNTT',
    address: '124 Đường 3/2, Quận 10, TP.HCM',
    children: [
      { id: 'TE001', name: 'Nguyễn Gia Bảo', relationship: 'Bố', class: 'Chồi 1' }
    ],
    status: 'Đã kích hoạt tài khoản'
  },
  {
    id: 'PH002',
    name: 'Lê Thị Thu Hằng',
    gender: 'Nữ',
    phone: '0988776655',
    email: 'thuhang.le@fpt.com.vn',
    job: 'Kế toán trưởng',
    address: '45 Lê Hồng Phong, Quận 5, TP.HCM',
    children: [
      { id: 'TE002', name: 'Trần Bảo Ngọc', relationship: 'Mẹ', class: 'Mầm 1' }
    ],
    status: 'Đã kích hoạt tài khoản'
  },
  {
    id: 'PH003',
    name: 'Lê Văn Cường',
    gender: 'Nam',
    phone: '0933221100',
    email: 'cuong.le@vietcombank.com.vn',
    job: 'Ngân hàng',
    address: '89 Nguyễn Trãi, Quận 1, TP.HCM',
    children: [
      { id: 'TE003', name: 'Lê Minh Khang', relationship: 'Bố', class: 'Lá 1' }
    ],
    status: 'Đã kích hoạt tài khoản'
  },
  {
    id: 'PH004',
    name: 'Phạm Hoàng Nam',
    gender: 'Nam',
    phone: '0977112233',
    email: 'nam.pham@vinfast.vn',
    job: 'Kinh doanh',
    address: '56 Trần Phú, Quận 5, TP.HCM',
    children: [
      { id: 'TE004', name: 'Phạm Phương Linh', relationship: 'Bố', class: 'Nhà trẻ Hoa Sen' }
    ],
    status: 'Chưa kích hoạt'
  },
  {
    id: 'PH005',
    name: 'Hoàng Anh Tuấn',
    gender: 'Nam',
    phone: '0909554433',
    email: 'anhtuan.hoang@gmail.com',
    job: 'Bác sĩ',
    address: '22 Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
    children: [
      { id: 'TE005', name: 'Hoàng Tuấn Kiệt', relationship: 'Bố', class: 'Chồi 1' }
    ],
    status: 'Đã kích hoạt tài khoản'
  }
];

export const weeklyMenu = [
  {
    day: 'Thứ 2',
    date: '13/10',
    breakfast: {
      dish: 'Phở bò Hà Nội thanh ngọt',
      beverage: 'Sữa tươi tiệt trùng Vinamilk 180ml',
      calories: '280 kcal'
    },
    lunch: {
      main: 'Thịt heo rim nước dừa tươi',
      soup: 'Canh rau ngót nấu thịt băm',
      side: 'Cơm gạo tám thơm + Đậu que xào tỏi',
      dessert: 'Chuối tiêu chín cây',
      calories: '450 kcal'
    },
    afternoonSnack: {
      dish: 'Bánh flan caramen béo ngậy',
      drink: 'Nước ép dưa hấu mát lành',
      calories: '180 kcal'
    },
    nutritionRatio: { protein: '25%', carbs: '55%', lipid: '20%' }
  },
  {
    day: 'Thứ 3',
    date: '14/10',
    breakfast: {
      dish: 'Cháo sườn non hạt sen thơm bùi',
      beverage: 'Sữa hạt sen mè đen',
      calories: '260 kcal'
    },
    lunch: {
      main: 'Cá hồi sốt cam tươi giàu Omega-3',
      soup: 'Canh bí đỏ hầm xương heo',
      side: 'Cơm dẻo + Cà rốt luộc chấm sốt trứng',
      dessert: 'Dưa lưới ruột xanh',
      calories: '480 kcal'
    },
    afternoonSnack: {
      dish: 'Súp gà nấm tuyết ngô ngọt',
      drink: 'Sữa chua men sống Yakult',
      calories: '190 kcal'
    },
    nutritionRatio: { protein: '27%', carbs: '53%', lipid: '20%' }
  },
  {
    day: 'Thứ 4',
    date: '15/10',
    breakfast: {
      dish: 'Bánh cuốn nóng thịt mộc nhĩ chả lụa',
      beverage: 'Sữa đậu nành nguyên chất',
      calories: '290 kcal'
    },
    lunch: {
      main: 'Gà kho gừng nhẹ mềm ngọt',
      soup: 'Canh mồng tơi cua đồng thanh mát',
      side: 'Cơm dẻo + Bắp cải xào nấm',
      dessert: 'Quýt đường ngọt dịu',
      calories: '460 kcal'
    },
    afternoonSnack: {
      dish: 'Bánh bao nhân thịt trứng cút mini',
      drink: 'Sữa chua dâu tây',
      calories: '210 kcal'
    },
    nutritionRatio: { protein: '26%', carbs: '54%', lipid: '20%' }
  },
  {
    day: 'Thứ 5',
    date: '16/10',
    breakfast: {
      dish: 'Búp bê mì xào bò rau củ rực rỡ',
      beverage: 'Sữa tươi ngũ cốc',
      calories: '310 kcal'
    },
    lunch: {
      main: 'Trứng cuộn phô mai ngũ sắc',
      soup: 'Canh rong biển đậu hũ non thịt nạc',
      side: 'Cơm trắng dẻo + Su su xào thịt băm',
      dessert: 'Đu đủ chín đỏ',
      calories: '440 kcal'
    },
    afternoonSnack: {
      dish: 'Chè đậu xanh nước cốt dừa thanh mát',
      drink: 'Sữa tươi thanh trùng',
      calories: '195 kcal'
    },
    nutritionRatio: { protein: '24%', carbs: '56%', lipid: '20%' }
  },
  {
    day: 'Thứ 6',
    date: '17/10',
    breakfast: {
      dish: 'Súp tôm thịt cua bắp vàng',
      beverage: 'Sữa bắp non ngọt thơm',
      calories: '270 kcal'
    },
    lunch: {
      main: 'Bò lúc lắc khoai tây nghiền',
      soup: 'Canh cải thảo tôm đồng tươi',
      side: 'Cơm hạt sen + Salad dưa leo cà chua bi',
      dessert: 'Táo Envy ngọt giòn',
      calories: '490 kcal'
    },
    afternoonSnack: {
      dish: 'Pizza mini rau củ phô mai',
      drink: 'Nước cam tươi mật ong ấm',
      calories: '220 kcal'
    },
    nutritionRatio: { protein: '28%', carbs: '52%', lipid: '20%' }
  }
];

export const foodList = [
  { id: 'MA01', name: 'Phở bò Hà Nội', category: 'Món ăn sáng', calo: 280, allergen: 'Thịt bò', note: 'Bò mềm hầm ngọt nước' },
  { id: 'MA02', name: 'Thịt heo rim nước dừa', category: 'Món mặn trưa', calo: 210, allergen: 'Không', note: 'Thịt ba rọi nạc ướp vừa vặn' },
  { id: 'MA03', name: 'Canh rau ngót thịt băm', category: 'Món canh', calo: 85, allergen: 'Không', note: 'Rau ngót vò kỹ, thanh mát' },
  { id: 'MA04', name: 'Cá hồi sốt cam tươi', category: 'Món mặn trưa', calo: 240, allergen: 'Cá biển', note: 'Giàu DHA, lọc sạch xương' },
  { id: 'MA05', name: 'Bánh flan caramen', category: 'Món xế chiều', calo: 180, allergen: 'Trứng, sữa', note: 'Hấp mềm mịn, ít ngọt' },
  { id: 'MA06', name: 'Trứng cuộn phô mai ngũ sắc', category: 'Món mặn trưa', calo: 195, allergen: 'Trứng, phô mai', note: 'Trẻ rất thích ăn' },
  { id: 'MA07', name: 'Bò lúc lắc khoai tây nghiền', category: 'Món mặn trưa', calo: 250, allergen: 'Thịt bò', note: 'Bò thăn cắt hạt lựu mềm' }
];

export const initialTuitionList = [
  {
    id: 'HP202610-001',
    childId: 'TE001',
    childName: 'Nguyễn Gia Bảo',
    className: 'Chồi 1 (Thỏ Trắng)',
    month: 'Tháng 10/2026',
    tuitionFee: 2500000,
    mealFee: 770000, // 22 ngày x 35.000
    facilitiesFee: 300000,
    talentFee: 450000, // Tiếng Anh + Vẽ
    totalAmount: 4020000,
    paidAmount: 4020000,
    remainingAmount: 0,
    dueDate: '2026-10-15',
    status: 'Đã thanh toán',
    paymentDate: '2026-10-08',
    paymentMethod: 'Chuyển khoản VietQR'
  },
  {
    id: 'HP202610-002',
    childId: 'TE002',
    childName: 'Trần Bảo Ngọc',
    className: 'Mầm 1 (Mặt Trời Nhỏ)',
    month: 'Tháng 10/2026',
    tuitionFee: 2500000,
    mealFee: 770000,
    facilitiesFee: 300000,
    talentFee: 300000,
    totalAmount: 3870000,
    paidAmount: 3870000,
    remainingAmount: 0,
    dueDate: '2026-10-15',
    status: 'Đã thanh toán',
    paymentDate: '2026-10-10',
    paymentMethod: 'Ví Momo'
  },
  {
    id: 'HP202610-003',
    childId: 'TE003',
    childName: 'Lê Minh Khang',
    className: 'Lá 1 (Ngôi Sao Xanh)',
    month: 'Tháng 10/2026',
    tuitionFee: 2600000,
    mealFee: 770000,
    facilitiesFee: 300000,
    talentFee: 600000, // Tiếng Anh + Aerobic + Toán tư duy
    totalAmount: 4270000,
    paidAmount: 0,
    remainingAmount: 4270000,
    dueDate: '2026-10-15',
    status: 'Chưa thanh toán',
    paymentDate: null,
    paymentMethod: null
  },
  {
    id: 'HP202610-004',
    childId: 'TE004',
    childName: 'Phạm Phương Linh',
    className: 'Nhà trẻ Hoa Sen',
    month: 'Tháng 10/2026',
    tuitionFee: 2800000,
    mealFee: 700000,
    facilitiesFee: 300000,
    talentFee: 0,
    totalAmount: 3800000,
    paidAmount: 2000000,
    remainingAmount: 1800000,
    dueDate: '2026-10-15',
    status: 'Đã cọc một phần',
    paymentDate: '2026-10-05',
    paymentMethod: 'Tiền mặt'
  },
  {
    id: 'HP202610-005',
    childId: 'TE005',
    childName: 'Hoàng Tuấn Kiệt',
    className: 'Chồi 1 (Thỏ Trắng)',
    month: 'Tháng 10/2026',
    tuitionFee: 2500000,
    mealFee: 770000,
    facilitiesFee: 300000,
    talentFee: 450000,
    totalAmount: 4020000,
    paidAmount: 4020000,
    remainingAmount: 0,
    dueDate: '2026-10-15',
    status: 'Đã thanh toán',
    paymentDate: '2026-10-11',
    paymentMethod: 'Chuyển khoản VietQR'
  }
];

export const initialPayments = [
  {
    id: 'TT-202610-089',
    invoiceId: 'HP202610-001',
    childName: 'Nguyễn Gia Bảo',
    parentName: 'Nguyễn Văn Hùng',
    amount: 4020000,
    method: 'VietQR Chuyển khoản',
    transactionNo: 'MBB_882910245',
    time: '2026-10-08 09:25:14',
    collector: 'Thủ quỹ Nguyễn Thị Tâm',
    status: 'Thành công'
  },
  {
    id: 'TT-202610-090',
    invoiceId: 'HP202610-002',
    childName: 'Trần Bảo Ngọc',
    parentName: 'Lê Thị Thu Hằng',
    amount: 3870000,
    method: 'Ví điện tử MoMo',
    transactionNo: 'MM_99214710',
    time: '2026-10-10 14:10:33',
    collector: 'Cổng thanh toán tự động',
    status: 'Thành công'
  },
  {
    id: 'TT-202610-091',
    invoiceId: 'HP202610-004',
    childName: 'Phạm Phương Linh',
    parentName: 'Phạm Hoàng Nam',
    amount: 2000000,
    method: 'Tiền mặt tại phòng tài vụ',
    transactionNo: 'PTM-00412',
    time: '2026-10-05 10:45:00',
    collector: 'Thủ quỹ Nguyễn Thị Tâm',
    status: 'Thành công'
  },
  {
    id: 'TT-202610-092',
    invoiceId: 'HP202610-005',
    childName: 'Hoàng Tuấn Kiệt',
    parentName: 'Hoàng Anh Tuấn',
    amount: 4020000,
    method: 'VietQR Chuyển khoản',
    transactionNo: 'VCB_771892019',
    time: '2026-10-11 16:30:22',
    collector: 'Thủ quỹ Nguyễn Thị Tâm',
    status: 'Thành công'
  }
];

export const initialAccounts = [
  {
    id: 'TK001',
    username: 'admin',
    fullName: 'Ban Giám Hiệu - Quản trị viên',
    email: 'admin@babyshark.edu.vn',
    role: 'ADMIN',
    roleName: 'Quản trị viên cấp cao',
    status: 'Hoạt động',
    lastLogin: '2026-10-13 18:05:12'
  },
  {
    id: 'TK002',
    username: 'gv_quynhnga',
    fullName: 'Phạm Quỳnh Nga (GV Tổ trưởng)',
    email: 'nga.pham@babyshark.edu.vn',
    role: 'GIAO_VIEN',
    roleName: 'Giáo viên',
    status: 'Hoạt động',
    lastLogin: '2026-10-13 07:15:40'
  },
  {
    id: 'TK003',
    username: 'gv_honghanh',
    fullName: 'Lê Hồng Hạnh (GV Khối trưởng Lá)',
    email: 'hanh.le@babyshark.edu.vn',
    role: 'GIAO_VIEN',
    roleName: 'Giáo viên',
    status: 'Hoạt động',
    lastLogin: '2026-10-12 16:40:11'
  },
  {
    id: 'TK004',
    username: 'kt_thutam',
    fullName: 'Nguyễn Thị Tâm (Kế toán)',
    email: 'tam.nguyen@babyshark.edu.vn',
    role: 'KETOAN',
    roleName: 'Kế toán & Thu ngân',
    status: 'Hoạt động',
    lastLogin: '2026-10-13 11:20:00'
  },
  {
    id: 'TK005',
    username: 'ph_vanhung',
    fullName: 'Nguyễn Văn Hùng (Phụ huynh bé Gia Bảo)',
    email: 'hung.nguyen@gmail.com',
    role: 'PHU_HUYNH',
    roleName: 'Phụ huynh',
    status: 'Hoạt động',
    lastLogin: '2026-10-11 20:15:45'
  },
  {
    id: 'TK006',
    username: 'ph_thuhang',
    fullName: 'Lê Thị Thu Hằng (Phụ huynh bé Bảo Ngọc)',
    email: 'thuhang.le@fpt.com.vn',
    role: 'PHU_HUYNH',
    roleName: 'Phụ huynh',
    status: 'Hoạt động',
    lastLogin: '2026-10-10 14:08:12'
  }
];
