import MenuWeekViewer from '../../components/MenuWeekViewer'

export default function ParentMenu({
  menus,
  children = [],
  selectedChildId,
  onChildChange,
  isAvailable = false,
  isLoading = false,
  error = '',
  onRetry,
}) {
  return (
    <div className="parent-page">
      <MenuWeekViewer
        menus={menus}
        children={children}
        selectedChildId={selectedChildId}
        onChildChange={onChildChange}
        isAvailable={isAvailable}
        loading={isLoading}
        error={error}
        onRetry={onRetry}
        noAccessMessage={children.length === 0 ? 'Tài khoản chưa có trẻ được liên kết.' : ''}
      />
    </div>
  )
}
