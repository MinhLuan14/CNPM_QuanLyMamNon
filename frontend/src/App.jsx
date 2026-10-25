
import { useCallback, useEffect, useState } from 'react'
import './App.css'
import AdminLayout from './layouts/AdminLayout'
import Login from './pages/login/Login'
import ForcePasswordChange from './pages/login/ForcePasswordChange'
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
import ProfilePage from './pages/ProfilePage'
import Toast from './components/Toast'
import { authRequest, fetchCsrfToken, responseError } from './api/auth'
import { loadParentPortalData, loadTeacherPortalData } from './api/portal'

const roleRoutes = {
  ADMIN: {
    'Tổng quan': '/dashboard',
    'Quản lý trẻ': '/dashboard/children',
    'Quản lý giáo viên': '/dashboard/teachers',
    'Quản lý phụ huynh': '/dashboard/parents',
    'Quản lý lớp học': '/dashboard/classes',
    'Thực đơn': '/dashboard/nutrition',
    'Học phí & tiền ăn': '/dashboard/tuition',
    'Thanh toán': '/dashboard/payments',
    'Tài khoản & phân quyền': '/dashboard/accounts',
  },
  PHUHUYNH: {
    'Tổng quan': '/dashboard',
    'Hồ sơ của bé': '/dashboard/parent/child-profile',
    'Thực đơn': '/dashboard/parent/menu',
    'Học phí & tiền ăn': '/dashboard/parent/tuition',
    'Lịch sử thanh toán': '/dashboard/parent/payments',
    'Thông báo': '/dashboard/parent/notifications',
    'Thông tin cá nhân': '/dashboard/parent/profile',
  },
  GIAOVIEN: {
    'Tổng quan': '/dashboard',
    'Lớp học của tôi': '/dashboard/teacher/classes',
    'Danh sách trẻ': '/dashboard/teacher/children',
    'Thực đơn': '/dashboard/teacher/menu',
    'Công việc & báo cáo': '/dashboard/teacher/tasks',
    'Thông báo': '/dashboard/teacher/notifications',
    'Thông tin cá nhân': '/dashboard/teacher/profile',
  },
}

function roleKey(role) {
  return role === 'PHUHUYNH' || role === 'GIAOVIEN' ? role : 'ADMIN'
}

function pageForPath(role, path) {
  const routes = roleRoutes[roleKey(role)]
  return Object.keys(routes).find((page) => routes[page] === path) || 'Tổng quan'
}

function pathForPage(role, page) {
  return roleRoutes[roleKey(role)][page] || roleRoutes[roleKey(role)]['Tổng quan']
}

function normalizePath(path) {
  return path.replace(/\/+$/, '') || '/'
}

function ParentPortal({ user, onLogout, path, navigate }) {
  const active = pageForPath(user?.vaiTro, path)
  const [portal, setPortal] = useState(null)
  const [portalError, setPortalError] = useState('')
  const [logoutError, setLogoutError] = useState('')
  const [toast, setToast] = useState(null)
  const navigateToPage = (page) => navigate(pathForPage('PHUHUYNH', page))

  const loadPortal = useCallback(async () => {
    setPortalError('')
    try {
      setPortal(await loadParentPortalData())
    } catch (error) {
      setPortalError(error.message || 'Không thể tải dữ liệu cổng phụ huynh.')
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(loadPortal, 0)
    return () => window.clearTimeout(timeoutId)
  }, [loadPortal])

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

  if (!portal) {
    return <div className="session-message" role={portalError ? 'alert' : 'status'}>
      {portalError || 'Đang tải hồ sơ phụ huynh...'}
      {portalError && <button type="button" onClick={loadPortal}>Thử lại</button>}
    </div>
  }

  let page
  switch (active) {
    case 'Hồ sơ của bé':
      page = <ParentChildProfile portal={portal} />
      break
    case 'Thực đơn':
      page = <ParentMenu menu={portal.menu} isAvailable={portal.availability.menu} />
      break
    case 'Học phí & tiền ăn':
      page = <ParentTuition
        invoices={portal.invoices}
        isAvailable={portal.availability.invoices}
        error={portal.invoiceError}
        onRetry={loadPortal}
      />
      break
    case 'Lịch sử thanh toán':
      page = <ParentPaymentHistory payments={portal.payments} isAvailable={portal.availability.payments} />
      break
    case 'Thông báo':
      page = <ParentNotifications notifications={portal.notifications} isAvailable={portal.availability.notifications} />
      break
    case 'Thông tin cá nhân':
      page = <ProfilePage onShowToast={setToast} />
      break
    default:
      page = <ParentDashboard portal={portal} onNavigate={navigateToPage} />
  }

  return (
    <>
      <ParentLayout active={active} setActive={navigateToPage} user={user} onLogout={handleLogout}>
        {logoutError && <div className="parent-error-banner" role="alert">{logoutError}</div>}
        {page}
      </ParentLayout>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  )
}

function TeacherPortal({ user, onLogout, path, navigate }) {
  const active = pageForPath(user?.vaiTro, path)
  const [toast, setToast] = useState(null)
  const [data, setData] = useState(null)
  const [portalError, setPortalError] = useState('')
  const navigateToPage = (page) => navigate(pathForPage('GIAOVIEN', page))

  const loadPortal = useCallback(async () => {
    setPortalError('')
    try {
      setData(await loadTeacherPortalData())
    } catch (error) {
      setPortalError(error.message || 'Không thể tải dữ liệu cổng giáo viên.')
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(loadPortal, 0)
    return () => window.clearTimeout(timeoutId)
  }, [loadPortal])

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

  if (!data) {
    return <div className="session-message" role={portalError ? 'alert' : 'status'}>
      {portalError || 'Đang tải hồ sơ giáo viên...'}
      {portalError && <button type="button" onClick={loadPortal}>Thử lại</button>}
    </div>
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
      page = <TeacherMenu menu={data.menu} isAvailable={data.availability.menu} />
      break
    case 'Công việc & báo cáo':
      page = <TeacherTasks tasks={data.tasks} isAvailable={data.availability.tasks} />
      break
    case 'Thông báo':
      page = <TeacherNotifications notifications={data.notifications} isAvailable={data.availability.notifications} />
      break
    case 'Thông tin cá nhân':
      page = <ProfilePage onShowToast={setToast} />
      break
    default:
      page = <TeacherDashboard data={data} onNavigate={navigateToPage} />
  }

  return (
    <>
      <TeacherLayout
        active={active}
        setActive={navigateToPage}
        user={user}
        teacher={data.teacher}
        onLogout={handleLogout}
      >
        {page}
      </TeacherLayout>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  )
}

function Dashboard({ user, onLogout, path, navigate }) {
  const active = pageForPath(user?.vaiTro, path)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [preselectedInvoice, setPreselectedInvoice] = useState(null)

  const showToast = (toastData) => setToast(toastData)
  const navigateToPage = (page) => {
    if (page !== 'Thanh toán') setPreselectedInvoice(null)
    navigate(pathForPage('ADMIN', page))
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
      page = <ParentsManagement onShowToast={showToast} canManageLinks={user?.vaiTro === 'ADMIN'} />
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
            navigateToPage('Thanh toán')
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
      page = <AccountsManagement onShowToast={showToast} onNavigate={navigateToPage} />
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
    const normalizedNextPath = normalizePath(nextPath)
    if (normalizedNextPath === path) return
    if (replace) {
      window.history.replaceState(null, '', normalizedNextPath)
    } else {
      window.history.pushState(null, '', normalizedNextPath)
    }
    setPath(normalizedNextPath)
  }, [path])

  useEffect(() => {
    const handlePopState = () => {
      setPath(normalizePath(window.location.pathname))
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

  useEffect(() => {
    if (!user || isCheckingSession || isLoginPage) return
    const routes = roleRoutes[roleKey(user.vaiTro)]
    if (Object.values(routes).includes(path)) return undefined
    const timeoutId = window.setTimeout(() => navigate('/dashboard', true), 0)
    return () => window.clearTimeout(timeoutId)
  }, [isCheckingSession, isLoginPage, navigate, path, user])

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
  if (user?.mustChangePassword) {
    return (
      <ForcePasswordChange
        user={user}
        onPasswordChanged={() => setUser((current) => ({ ...current, mustChangePassword: false }))}
        onLogout={() => {
          setUser(null)
          navigate('/login')
        }}
      />
    )
  }
  if (user?.vaiTro === 'PHUHUYNH') {
    return (
      <ParentPortal
        user={user}
        path={path}
        navigate={navigate}
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
        path={path}
        navigate={navigate}
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
      path={path}
      navigate={navigate}
      onLogout={() => {
        setUser(null)
        navigate('/login')
      }}
    />
  ) : null
}

export default App