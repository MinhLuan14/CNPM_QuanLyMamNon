
import { useCallback, useEffect, useState } from 'react'
import './App.css'
import AdminLayout from './layouts/AdminLayout'
import Login from './pages/login/Login'
import Overview from './pages/admin/Overview'
import ChildrenManagement from './pages/admin/ChildrenManagement'
import TeachersManagement from './pages/admin/TeachersManagement'
import ParentsManagement from './pages/admin/ParentsManagement'
import ClassesManagement from './pages/admin/ClassesManagement'
import NutritionManagement from './pages/admin/NutritionManagement'
import TuitionManagement from './pages/admin/TuitionManagement'
import PaymentManagement from './pages/admin/PaymentManagement'
import AccountsManagement from './pages/admin/AccountsManagement'
import ParentLayout from './layouts/ParentLayout'
import ParentDashboard from './pages/parent/ParentDashboard'
import ParentChildProfile from './pages/parent/ParentChildProfile'
import ParentMenu from './pages/parent/ParentMenu'
import ParentTuition from './pages/parent/ParentTuition'
import ParentPaymentHistory from './pages/parent/ParentPaymentHistory'
import ParentNotifications from './pages/parent/ParentNotifications'
import TeacherLayout from './layouts/TeacherLayout'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import TeacherClass from './pages/teacher/TeacherClass'
import TeacherChildren from './pages/teacher/TeacherChildren'
import TeacherMenu from './pages/teacher/TeacherMenu'
import TeacherTasks from './pages/teacher/TeacherTasks'
import TeacherNotifications from './pages/teacher/TeacherNotifications'
import TeacherProfile from './pages/teacher/TeacherProfile'
import Toast from './components/Toast'
import { authRequest, fetchCsrfToken, responseError } from './api/auth'
import { getParentPortalData, getTeacherPortalData } from './data/portalMockData'

const parentPages = ['Tổng quan', 'Hồ sơ của bé', 'Thực đơn', 'Học phí & tiền ăn', 'Lịch sử thanh toán', 'Thông báo']
const teacherPages = [
  'Tổng quan',
  'Lớp học của tôi',
  'Danh sách trẻ',
  'Thực đơn',
  'Công việc & báo cáo',
  'Thông báo',
  'Thông tin cá nhân',
]

function ParentPortal({ user, onLogout }) {
  const [active, setActive] = useState(parentPages[0])
  const portal = getParentPortalData(user?.tenDangNhap)
  const [logoutError, setLogoutError] = useState('')

  const handleLogout = async () => {
    try {
      const csrfToken = await fetchCsrfToken()
      const response = await authRequest('/api/auth/logout', {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': csrfToken },
      })
      if (!response.ok) {
        throw new Error(await responseError(response, 'Không thể đăng xuất. Vui lòng thử lại.'))
      }
      onLogout()
    } catch (error) {
      setLogoutError(error.message)
    }
  }

  let page
  switch (active) {
    case 'Hồ sơ của bé':
      page = <ParentChildProfile portal={portal} />
      break
    case 'Thực đơn':
      page = <ParentMenu menu={portal.menu} />
      break
    case 'Học phí & tiền ăn':
      page = <ParentTuition invoices={portal.invoices} />
      break
    case 'Lịch sử thanh toán':
      page = <ParentPaymentHistory payments={portal.payments} />
      break
    case 'Thông báo':
      page = <ParentNotifications notifications={portal.notifications} />
      break
    default:
      page = <ParentDashboard portal={portal} onNavigate={setActive} />
  }

  return (
    <ParentLayout active={active} setActive={setActive} user={user} onLogout={handleLogout}>
      {logoutError && <div className="parent-error-banner" role="alert">{logoutError}</div>}
      {page}
    </ParentLayout>
  )
}

function TeacherPortal({ user, onLogout }) {
  const [active, setActive] = useState(teacherPages[0])
  const data = getTeacherPortalData(user?.tenDangNhap, user)

  const handleLogout = async () => {
    try {
      const csrfToken = await fetchCsrfToken()
      const response = await authRequest('/api/auth/logout', {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': csrfToken },
      })
      if (!response.ok) {
        throw new Error(await responseError(response, 'Không thể đăng xuất. Vui lòng thử lại.'))
      }
      onLogout()
    } catch (error) {
      window.alert(error.message)
    }
  }

  let page
  switch (active) {
    case 'Lớp học của tôi':
      page = <TeacherClass data={data} />
      break
    case 'Danh sách trẻ':
      page = <TeacherChildren data={data} />
      break
    case 'Thực đơn':
      page = <TeacherMenu menu={data.menu} />
      break
    case 'Công việc & báo cáo':
      page = <TeacherTasks tasks={data.tasks} />
      break
    case 'Thông báo':
      page = <TeacherNotifications notifications={data.notifications} />
      break
    case 'Thông tin cá nhân':
      page = <TeacherProfile data={data} />
      break
    default:
      page = <TeacherDashboard data={data} onNavigate={setActive} />
  }

  return (
    <TeacherLayout
      active={active}
      setActive={setActive}
      user={user}
      teacher={data.teacher}
      onLogout={handleLogout}
    >
      {page}
    </TeacherLayout>
  )
}

function Dashboard({ user, onLogout }) {
  const [active, setActive] = useState('Tổng quan')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [preselectedInvoice, setPreselectedInvoice] = useState(null)

  const showToast = (toastData) => setToast(toastData)
  const navigateToPage = (page) => {
    if (page !== 'Thanh toán') setPreselectedInvoice(null)
    setActive(page)
  }

  let page
  switch (active) {
    case 'Quản lý trẻ':
      page = <ChildrenManagement onShowToast={showToast} />
      break
    case 'Quản lý giáo viên':
      page = <TeachersManagement onShowToast={showToast} />
      break
    case 'Quản lý phụ huynh':
      page = <ParentsManagement onShowToast={showToast} />
      break
    case 'Quản lý lớp học':
      page = <ClassesManagement onShowToast={showToast} />
      break
    case 'Thực đơn':
      page = <NutritionManagement onShowToast={showToast} />
      break
    case 'Học phí & tiền ăn':
      page = (
        <TuitionManagement
          onShowToast={showToast}
          onNavigateToPayment={(invoice) => {
            setPreselectedInvoice(invoice)
            setActive('Thanh toán')
          }}
        />
      )
      break
    case 'Thanh toán':
      page = (
        <PaymentManagement
          onShowToast={showToast}
          preselectedInvoice={preselectedInvoice}
        />
      )
      break
    case 'Tài khoản & phân quyền':
      page = <AccountsManagement onShowToast={showToast} />
      break
    default:
      page = <Overview onNavigate={navigateToPage} />
  }

  return (
    <>
      <AdminLayout
        active={active}
        setActive={navigateToPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        onLogout={onLogout}
      >
        {page}
      </AdminLayout>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  )
}

function App() {
  const [path, setPath] = useState(
    window.location.pathname.replace(/\/+$/, '') || '/',
  )
  const isLoginPage = path === '/' || path === '/login'
  const [user, setUser] = useState(null)
  const [isCheckingSession, setIsCheckingSession] = useState(!isLoginPage)
  const [sessionError, setSessionError] = useState('')

  const navigate = useCallback((nextPath, replace = false) => {
    if (replace) {
      window.history.replaceState(null, '', nextPath)
    } else {
      window.history.pushState(null, '', nextPath)
    }
    setPath(nextPath)
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname.replace(/\/+$/, '') || '/')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (isLoginPage || user) return undefined

    let isMounted = true
    authRequest('/api/auth/me')
      .then(async (response) => {
        if (response.status === 401 || response.status === 403) {
          if (isMounted) {
            setUser(null)
            navigate('/login', true)
          }
          return
        }
        if (!response.ok) throw new Error('Không thể kiểm tra phiên đăng nhập.')
        const sessionUser = await response.json()
        if (isMounted) setUser(sessionUser)
      })
      .catch((error) => {
        if (isMounted) setSessionError(error.message)
      })
      .finally(() => {
        if (isMounted) setIsCheckingSession(false)
      })

    return () => {
      isMounted = false
    }
  }, [isLoginPage, navigate, user])

  if (isLoginPage) {
    return (
      <Login
        onLogin={(authenticatedUser) => {
          setUser(authenticatedUser)
          navigate('/dashboard')
        }}
      />
    )
  }
  if (isCheckingSession) {
    return <div className="session-message">Đang kiểm tra đăng nhập...</div>
  }
  if (sessionError) {
    return <div className="session-message" role="alert">{sessionError}</div>
  }
  if (user?.vaiTro === 'PHUHUYNH') {
    return (
      <ParentPortal
        user={user}
        onLogout={() => {
          setUser(null)
          navigate('/login')
        }}
      />
    )
  }
  if (user?.vaiTro === 'GIAOVIEN') {
    return (
      <TeacherPortal
        user={user}
        onLogout={() => {
          setUser(null)
          navigate('/login')
        }}
      />
    )
  }
  return user ? (
    <Dashboard
      user={user}
      onLogout={() => {
        setUser(null)
        navigate('/login')
      }}
    />
  ) : null
}

export default App