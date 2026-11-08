import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Baby,
  CalendarDays,
  ChevronDown,
  MapPin,
  Search,
  School,
  Users,
  X,
} from 'lucide-react'
import { API_BASE_URL } from '../../config'
import { getTeacherChildDetails } from '../../api/portal'

const EMPTY_CLASSES = Object.freeze([])

function normalizeSearch(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('vi-VN')
    .trim()
}

function formatDate(value) {
  if (!value) return 'Chưa có dữ liệu'
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? 'Chưa có dữ liệu' : date.toLocaleDateString('vi-VN')
}

function ChildAvatar({ child }) {
  const [failedImageUrl, setFailedImageUrl] = useState('')
  const initials = child.name?.trim().charAt(0)?.toLocaleUpperCase('vi-VN') || '?'
  const imageUrl = child.imageUrl
    ? `${API_BASE_URL}${child.imageUrl}`
    : ''
  const imageFailed = imageUrl && failedImageUrl === imageUrl

  if (imageUrl && !imageFailed) {
    return (
      <img
        className="teacher-children-avatar"
        src={imageUrl}
        alt=""
        onError={() => setFailedImageUrl(imageUrl)}
      />
    )
  }

  return <span className="teacher-children-avatar teacher-children-avatar-fallback" aria-hidden="true">{initials}</span>
}

function ChildDetailsDialog({ child, onClose }) {
  const [request, setRequest] = useState(null)

  useEffect(() => {
    let active = true

    getTeacherChildDetails(child.id)
      .then((result) => {
        if (active) setRequest({ id: child.id, details: result, error: '' })
      })
      .catch((requestError) => {
        if (active) {
          setRequest({
            id: child.id,
            details: null,
            error: requestError.message || 'Không thể tải hồ sơ trẻ.',
          })
        }
      })

    return () => {
      active = false
    }
  }, [child.id])

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  const loading = request?.id !== child.id
  const details = loading ? null : request.details
  const error = loading ? '' : request.error
  const detailChild = details ? {
    ...child,
    name: [details.hoTenDemTre, details.tenTre].filter(Boolean).join(' ').trim(),
    dob: details.ngayThangNamSinh || '',
    birthPlace: details.noiSinh || '',
    status: details.trangThaiHocTap || 'Chưa có dữ liệu',
    className: details.tenLopHoc || child.className,
    imageUrl: details.anhDaiDien || child.imageUrl,
  } : child

  return (
    <div
      className="teacher-child-detail-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="teacher-child-detail-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="teacher-child-detail-title"
      >
        <header className="teacher-child-detail-header">
          <div>
            <span className="teacher-child-detail-eyebrow">Hồ sơ học sinh</span>
            <h3 id="teacher-child-detail-title">Thông tin của bé</h3>
          </div>
          <button type="button" className="teacher-child-detail-close" onClick={onClose} aria-label="Đóng hồ sơ">
            <X size={20} />
          </button>
        </header>

        {loading ? (
          <div className="teacher-child-detail-state" role="status">Đang tải hồ sơ trẻ...</div>
        ) : error ? (
          <div className="teacher-child-detail-error" role="alert">
            <AlertCircle size={19} />
            <span>{error}</span>
          </div>
        ) : (
          <div className="teacher-child-detail-content">
            <div className="teacher-child-detail-identity">
              <ChildAvatar child={detailChild} />
              <div>
                <h4>{detailChild.name || 'Chưa cập nhật'}</h4>
                <span>Mã trẻ: {details.maTre}</span>
              </div>
            </div>
            <dl className="teacher-child-detail-fields">
              <div>
                <dt><CalendarDays size={16} /> Ngày sinh</dt>
                <dd>{formatDate(detailChild.dob)}</dd>
              </div>
              <div>
                <dt><School size={16} /> Lớp học</dt>
                <dd>{detailChild.className || 'Chưa phân lớp'}</dd>
              </div>
              <div>
                <dt><MapPin size={16} /> Nơi sinh</dt>
                <dd>{detailChild.birthPlace || 'Chưa có dữ liệu'}</dd>
              </div>
              <div>
                <dt><Baby size={16} /> Trạng thái học</dt>
                <dd><span className="teacher-children-status">{detailChild.status}</span></dd>
              </div>
            </dl>
          </div>
        )}
      </section>
    </div>
  )
}

export default function TeacherChildren({ data }) {
  const classes = data.classes || EMPTY_CLASSES
  const [search, setSearch] = useState('')
  const [expandedClasses, setExpandedClasses] = useState(() => new Set())
  const [selectedChild, setSelectedChild] = useState(null)
  const normalizedSearch = normalizeSearch(search)

  const classRows = useMemo(() => classes.map((classroom) => {
    const matchingChildren = classroom.children.filter((child) => {
      if (!normalizedSearch) return true
      return normalizeSearch(`${child.name} ${child.id}`).includes(normalizedSearch)
    })
    return { ...classroom, matchingChildren }
  }), [classes, normalizedSearch])

  const totalChildren = classes.reduce((total, classroom) => total + classroom.children.length, 0)
  const matchingCount = classRows.reduce((total, classroom) => total + classroom.matchingChildren.length, 0)
  const hasClassLoadErrors = classes.some((classroom) => classroom.loadError)
  const toggleClass = (classId) => {
    setExpandedClasses((current) => {
      const next = new Set(current)
      if (next.has(classId)) next.delete(classId)
      else next.add(classId)
      return next
    })
  }

  return (
    <div className="teacher-page teacher-children-page">

      <section className="teacher-panel teacher-children-panel">
        <div className="teacher-children-toolbar">
          <div className="teacher-panel-heading">
            <div><Users size={20} /><h3>Lớp học được phân công</h3></div>
            <p>{normalizedSearch ? `${matchingCount} kết quả phù hợp` : 'Chọn một hoặc nhiều lớp để xem danh sách trẻ.'}</p>
          </div>
          <label className="teacher-children-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên hoặc mã trẻ"
              aria-label="Tìm trẻ theo tên hoặc mã trẻ"
            />
          </label>
        </div>

        {classes.length === 0 ? (
          <div className="teacher-children-empty">
            <School size={28} />
            <strong>Chưa có lớp được phân công hiện hành</strong>
            <span>Danh sách sẽ hiển thị khi nhà trường phân công lớp cho bạn.</span>
          </div>
        ) : normalizedSearch && matchingCount === 0 && !hasClassLoadErrors ? (
          <div className="teacher-children-empty" role="status">
            <Search size={26} />
            <strong>Không tìm thấy trẻ phù hợp</strong>
            <span>Thử tìm theo tên hoặc mã trẻ khác.</span>
          </div>
        ) : (
          <>
            {hasClassLoadErrors && (
              <div className="teacher-children-load-error teacher-children-page-error" role="alert">
                <AlertCircle size={18} />
                <span>Một số lớp chưa tải được dữ liệu. Mở từng lớp để xem chi tiết lỗi.</span>
              </div>
            )}
            <div className="teacher-class-accordion">
              {classRows.map((classroom) => {
                const isExpanded = expandedClasses.has(classroom.id)
                const panelId = `teacher-class-children-${classroom.id}`

                return (
                  <article className="teacher-class-card" key={classroom.id}>
                    <button
                      type="button"
                      className="teacher-class-card-trigger"
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      onClick={() => toggleClass(classroom.id)}
                    >
                      <span className="teacher-class-card-icon"><School size={22} /></span>
                      <span className="teacher-class-card-title">
                        <strong>{classroom.name}</strong>
                        <span>
                          {classroom.loadError
                            ? 'Chưa tải được số lượng trẻ'
                            : `${classroom.children.length} trẻ${normalizedSearch ? ` · ${classroom.matchingChildren.length} phù hợp` : ''}`}
                        </span>
                      </span>
                      <span className={`teacher-assignment-badge ${classroom.roleCategory === 'Phụ trách chính'
                        ? 'is-primary'
                        : classroom.roleCategory === 'Hỗ trợ' ? 'is-support' : ''
                        }`}>
                        {classroom.roleCategory}
                      </span>
                      <span className="teacher-assignment-role">{classroom.role}</span>
                      <ChevronDown className={isExpanded ? 'is-expanded' : ''} size={20} />
                    </button>

                    <div className="teacher-class-card-content" id={panelId} hidden={!isExpanded}>
                      {classroom.loadError ? (
                        <div className="teacher-children-load-error" role="alert">
                          <AlertCircle size={18} />
                          <span>{classroom.loadError}</span>
                        </div>
                      ) : classroom.matchingChildren.length ? (
                        <div className="teacher-class-child-list">
                          {classroom.matchingChildren.map((child) => (
                            <button
                              className="teacher-class-child"
                              key={child.id}
                              type="button"
                              onClick={() => setSelectedChild(child)}
                            >
                              <ChildAvatar child={child} />
                              <span className="teacher-class-child-info">
                                <strong>{child.name || 'Chưa cập nhật'}</strong>
                                <span>Mã trẻ: {child.id}</span>
                              </span>
                              <span className="teacher-children-status">{child.status}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="teacher-children-class-empty">
                          {normalizedSearch
                            ? 'Không có trẻ trong lớp khớp với từ khóa.'
                            : 'Lớp hiện chưa có trẻ được ghi danh.'}
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </section>

      <p className="teacher-children-footnote">
        Dữ liệu được lấy từ các phân công hiện hành và danh sách trẻ của từng lớp.
      </p>

      {selectedChild && (
        <ChildDetailsDialog child={selectedChild} onClose={() => setSelectedChild(null)} />
      )}
    </div>
  )
}
