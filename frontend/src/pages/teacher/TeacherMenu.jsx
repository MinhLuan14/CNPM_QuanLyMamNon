import { useEffect, useState } from 'react'
import MenuWeekViewer from '../../components/MenuWeekViewer'

export default function TeacherMenu({
  loadMenus,
  classes = [],
}) {
  const [selectedClassId, setSelectedClassId] = useState(String(classes[0]?.id || ''))
  const [menuState, setMenuState] = useState({
    menus: [],
    loading: classes.length > 0,
    available: classes.length === 0,
    error: '',
  })
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const assignedClass = classes.find((item) => String(item.id) === selectedClassId)
    if (!assignedClass) return undefined

    let isCurrent = true
    loadMenus(assignedClass.id)
      .then((menus) => {
        if (isCurrent) setMenuState({ menus, loading: false, available: true, error: '' })
      })
      .catch((error) => {
        if (isCurrent) {
          setMenuState({ menus: [], loading: false, available: false, error: error.message })
        }
      })
    return () => { isCurrent = false }
  }, [classes, loadMenus, retryCount, selectedClassId])

  const handleClassChange = (classId) => {
    setSelectedClassId(classId)
    setMenuState({ menus: [], loading: true, available: false, error: '' })
  }

  const handleRetry = () => {
    setMenuState({ menus: [], loading: true, available: false, error: '' })
    setRetryCount((current) => current + 1)
  }

  return (
    <div className="teacher-page">
      <MenuWeekViewer
        menus={menuState.menus}
        classes={classes}
        selectedClassId={selectedClassId}
        onClassChange={handleClassChange}
        isAvailable={menuState.available}
        loading={menuState.loading}
        error={menuState.error}
        onRetry={handleRetry}
        noAccessMessage={classes.length === 0 ? 'Bạn hiện chưa được phân công phụ trách lớp nào.' : ''}
      />
    </div>
  )
}
