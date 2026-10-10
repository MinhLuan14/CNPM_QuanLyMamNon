
import {
    LayoutDashboard,
    Baby,
    Users,
    GraduationCap,
    School,
    Utensils,
    Wallet,
    CreditCard,
    ShieldCheck,
    X,
} from 'lucide-react'

const menuItems = [
    { title: 'Tổng quan', icon: LayoutDashboard },
    { title: 'Quản lý trẻ', icon: Baby },
    { title: 'Quản lý giáo viên', icon: GraduationCap },
    { title: 'Quản lý phụ huynh', icon: Users },
    { title: 'Quản lý lớp học', icon: School },
    { title: 'Thực đơn', icon: Utensils },
    { title: 'Học phí & tiền ăn', icon: Wallet },
    { title: 'Thanh toán', icon: CreditCard },
    { title: 'Tài khoản & phân quyền', icon: ShieldCheck },
]

function Sidebar({
    active,
    setActive,
    sidebarOpen,
    setSidebarOpen,
}) {
    return (
        <>
            {sidebarOpen && (
                <button
                    className="mobile-overlay"
                    aria-label="Đóng menu"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}
            >
                <div className="brand">
                    <div className="brand-logo">🦈</div>

                    <div>
                        <h2>babyShark</h2>
                        <span>Preschool Management</span>
                    </div>

                    <button
                        className="close-sidebar"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Đóng menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="menu-label">MENU CHÍNH</div>

                <nav className="sidebar-menu">
                    {menuItems.map((item) => {
                        const Icon = item.icon

                        return (
                            <button
                                key={item.title}
                                className={`menu-item ${active === item.title ? 'active' : ''
                                    }`}
                                onClick={() => {
                                    setActive(item.title)
                                    setSidebarOpen(false)
                                }}
                            >
                                <Icon size={19} />
                                <span>{item.title}</span>
                            </button>
                        )
                    })}
                </nav>

                <div className="sidebar-bottom">
                    <div className="sidebar-version">
                        babyShark v1.0.0
                    </div>
                </div>
            </aside>
        </>
    )
}

export default Sidebar