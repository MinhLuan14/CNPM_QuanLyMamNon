import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import './AdminLayout.css'

function AdminLayout({
  active,
  setActive,
  sidebarOpen,
  setSidebarOpen,
  user,
  onLogout,
  children,
}) {
  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        setActive={setActive}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        role={user.vaiTro}
      />

      <main className="main-area">
        <Header
          active={active}
          setSidebarOpen={setSidebarOpen}
          user={user}
          onLogout={onLogout}
        />
        <div className="admin-page-content">{children}</div>
      </main>
    </div>
  )
}

export default AdminLayout