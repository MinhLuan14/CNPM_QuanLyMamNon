
import { useState } from 'react'
import {
  LayoutDashboard, Baby, Users, GraduationCap, School,
  Utensils, Wallet, CreditCard, ShieldCheck, Menu,
  Bell, Search, ChevronDown, CalendarDays, ArrowUpRight,
  Clock, CheckCircle2, X
} from 'lucide-react'
import './App.css'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Login from './pages/login/Login'
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

function Dashboard() {
  const [active, setActive] = useState('Tổng quan')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        setActive={setActive}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="main-area">
        <Header
          active={active}
          setSidebarOpen={setSidebarOpen}
        />
      </main>
    </div>
  )
}

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  return path === '/' || path === '/login' ? <Login /> : <Dashboard />
}

function StatCard({ icon: Icon, color, label, value, note, change }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}><Icon size={22} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-footer">
        <span>{note}</span>
        <span className={`stat-change ${color}`}>{change}</span>
      </div>
    </div>
  )
}

function Activity({ icon: Icon, color, title, detail, time }) {
  return (
    <div className="activity-item">
      <div className={`activity-icon ${color}`}><Icon size={18} /></div>
      <div className="activity-copy">
        <strong>{title}</strong>
        <span>{detail}</span>
        <small><Clock size={12} /> {time}</small>
      </div>
    </div>
  )
}

export default App