import {
  Bell,
  Baby,
  CreditCard,
  LayoutDashboard,
  Wallet,
  Utensils,
  UserRound,
} from 'lucide-react'
import Sidebar from '../Sidebar'

const menuItems = [
  { title: 'Tổng quan', icon: LayoutDashboard },
  { title: 'Hồ sơ của bé', icon: Baby },
  { title: 'Thực đơn', icon: Utensils },
  { title: 'Học phí & tiền ăn', icon: Wallet },
  { title: 'Lịch sử thanh toán', icon: CreditCard },
  { title: 'Thông báo', icon: Bell },
  { title: 'Thông tin cá nhân', icon: UserRound },
]

export default function ParentSidebar({ active, setActive, isOpen, setIsOpen }) {
  return <Sidebar
    active={active}
    setActive={setActive}
    sidebarOpen={isOpen}
    setSidebarOpen={setIsOpen}
    items={menuItems}
    subtitle="Phụ huynh"
    menuLabel="DÀNH CHO GIA ĐÌNH"
    footerText="BabyShark Preschool"
  />
}
