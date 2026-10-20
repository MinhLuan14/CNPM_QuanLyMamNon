import {
  Bell,
  Baby,
  CreditCard,
  LayoutDashboard,
  Wallet,
  Utensils,
  X,
} from 'lucide-react'
import logoImg from '../../assets/Logo.png'

const menuItems = [
  { title: 'Tổng quan', icon: LayoutDashboard },
  { title: 'Hồ sơ của bé', icon: Baby },
  { title: 'Thực đơn', icon: Utensils },
  { title: 'Học phí & tiền ăn', icon: Wallet },
  { title: 'Lịch sử thanh toán', icon: CreditCard },
  { title: 'Thông báo', icon: Bell },
]

export default function ParentSidebar({ active, setActive, isOpen, setIsOpen }) {
  return (
    <>
      {isOpen && (
        <button
          className="parent-overlay"
          aria-label="Đóng menu"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside className={`parent-sidebar ${isOpen ? 'parent-sidebar-open' : ''}`}>
        <div className="parent-brand">
          <img src={logoImg} alt="BabyShark" />
          <div>
            <strong>BabyShark</strong>
            <span>Cổng phụ huynh</span>
          </div>
          <button
            className="parent-close-menu"
            aria-label="Đóng menu"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <p className="parent-menu-label">DÀNH CHO GIA ĐÌNH</p>
        <nav className="parent-menu">
          {menuItems.map(({ title, icon: Icon }) => (
            <button
              key={title}
              className={`parent-menu-item ${active === title ? 'active' : ''}`}
              onClick={() => {
                setActive(title)
                setIsOpen(false)
              }}
            >
              <Icon size={19} />
              <span>{title}</span>
            </button>
          ))}
        </nav>

        <div className="parent-sidebar-footer">
          <span className="parent-status-dot" />
          BabyShark Preschool
        </div>
      </aside>
    </>
  )
}
