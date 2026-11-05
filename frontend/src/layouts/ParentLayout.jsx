import { useState } from 'react'
import ParentHeader from '../components/parent/ParentHeader'
import ParentSidebar from '../components/parent/ParentSidebar'
import './ParentLayout.css'

export default function ParentLayout({ active, setActive, user, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="parent-app-shell">
      <ParentSidebar
        active={active}
        setActive={setActive}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <main className="parent-main">
        <ParentHeader
          active={active}
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={onLogout}
        />
        <div className="parent-content">
          {children}
        </div>
      </main>
    </div>
  )
}
