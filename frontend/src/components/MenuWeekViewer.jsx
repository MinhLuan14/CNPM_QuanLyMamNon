import { useState } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Soup,
  Utensils,
} from 'lucide-react'
import { API_BASE_URL } from '../config'
import './MenuWeekViewer.css'

const MEAL_ICONS = {
  'bữa sáng': Coffee,
  'bữa phụ sáng': Coffee,
  'bữa trưa': Soup,
  'bữa phụ chiều': Utensils,
}

function localDate(value) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
}

function dateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function startOfWeek(date) {
  const monday = new Date(date)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  return monday
}

function addDays(date, count) {
  const result = new Date(date)
  result.setDate(result.getDate() + count)
  return result
}

function formatDate(value, options = {}) {
  const date = localDate(value)
  return Number.isNaN(date.getTime())
    ? 'Ngày chưa xác định'
    : date.toLocaleDateString('vi-VN', options)
}

function isoWeek(date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  target.setUTCDate(target.getUTCDate() + 4 - (target.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1))
  return {
    week: Math.ceil(((target - yearStart) / 86400000 + 1) / 7),
    year: target.getUTCFullYear(),
  }
}

function mealsForDay(items) {
  const groups = new Map()
  items.forEach((item) => {
    const name = item.meal?.trim() || 'Bữa ăn chưa phân loại'
    const key = name.toLocaleLowerCase('vi')
    if (!groups.has(key)) groups.set(key, { name, items: [] })
    groups.get(key).items.push(item)
  })
  return [...groups.values()]
}

function daysForWeek(start, menu) {
  const itemsByDate = new Map()
  ;(menu?.items || []).forEach((item) => {
    const date = item.date?.slice(0, 10)
    if (!date) return
    itemsByDate.set(date, [...(itemsByDate.get(date) || []), item])
  })

  return Array.from({ length: 7 }, (_, index) => {
    const date = dateKey(addDays(start, index))
    return { date, items: itemsByDate.get(date) || [] }
  })
}

function initials(name) {
  return name?.trim().split(/\s+/).slice(-1)[0]?.[0]?.toLocaleUpperCase('vi') || '?'
}

export default function MenuWeekViewer({
  menus = [],
  isAvailable = true,
  error = '',
  loading = false,
  onRetry,
  children = [],
  selectedChildId = '',
  onChildChange,
  classes = [],
  selectedClassId = '',
  onClassChange,
  noAccessMessage = '',
}) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [unavailableImages, setUnavailableImages] = useState(() => new Set())
  const publishedMenus = Array.isArray(menus) ? menus : []
  const selectedChild = children.find((child) => String(child.id) === String(selectedChildId))
  const selectedClass = classes.find((item) => String(item.id) === String(selectedClassId))
  const weekStartKey = dateKey(weekStart)
  const weekEndKey = dateKey(addDays(weekStart, 6))
  const menu = publishedMenus.find((item) => item.startDate === weekStartKey) || null
  const weekDays = daysForWeek(weekStart, menu)
  const weekMetadata = isoWeek(weekStart)

  const shiftWeek = (offset) => setWeekStart((current) => addDays(current, offset * 7))

  return (
    <div className="menu-week-viewer">
      {(children.length > 1 || classes.length > 1) && (
        <div className="menu-week-viewer-selectors">
          {children.length > 1 && (
            <label>
              <span>Bé đang theo dõi</span>
              <select value={selectedChildId} onChange={(event) => onChildChange?.(event.target.value)}>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>{child.fullName}</option>
                ))}
              </select>
            </label>
          )}
          {classes.length > 1 && (
            <label>
              <span>Lớp đang phụ trách</span>
              <select value={selectedClassId} onChange={(event) => onClassChange?.(event.target.value)}>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}

      {selectedChild && (
        <div className="menu-viewer-person">
          {selectedChild.imageUrl && !unavailableImages.has(selectedChild.id) ? (
            <img
              src={selectedChild.imageUrl.startsWith('http')
                ? selectedChild.imageUrl
                : `${API_BASE_URL}${selectedChild.imageUrl}`}
              alt=""
              onError={() => setUnavailableImages((current) => new Set(current).add(selectedChild.id))}
            />
          ) : <span aria-hidden="true">{initials(selectedChild.fullName)}</span>}
          <div>
            <strong>{selectedChild.fullName}</strong>
            <small>{selectedChild.className || 'Chưa phân lớp'}</small>
          </div>
        </div>
      )}
      {selectedClass && classes.length === 1 && (
        <div className="menu-viewer-class">Lớp đang phụ trách: <strong>{selectedClass.name}</strong></div>
      )}

      <section className="menu-week-toolbar" aria-label="Điều hướng tuần thực đơn">
        <button type="button" onClick={() => shiftWeek(-1)} aria-label="Xem tuần trước">
          <ChevronLeft size={20} />
          <span>Tuần trước</span>
        </button>
        <div className="menu-week-title">
          <span><CalendarDays size={19} /> TUẦN {menu?.week ?? weekMetadata.week}/{menu?.year ?? weekMetadata.year}</span>
          <strong>{formatDate(weekStartKey)} – {formatDate(weekEndKey)}</strong>
          <small>{menu ? `Tháng ${menu.month}/${menu.year}` : `Tháng ${weekStart.getMonth() + 1}/${weekStart.getFullYear()}`}</small>
        </div>
        <button type="button" onClick={() => shiftWeek(1)} aria-label="Xem tuần tiếp theo">
          <span>Tuần tiếp</span>
          <ChevronRight size={20} />
        </button>
      </section>

      {menu?.note && <p className="menu-week-note">{menu.note}</p>}
      {menu && (
        <div className="menu-week-status">
          <span className="menu-published-badge">Đã công khai</span>
        </div>
      )}

      {loading ? (
        <section className="menu-viewer-message" role="status">Đang tải thực đơn...</section>
      ) : noAccessMessage ? (
        <section className="menu-viewer-message" role="status">{noAccessMessage}</section>
      ) : !isAvailable ? (
        <section className="menu-viewer-message error" role="alert">
          <Utensils size={25} />
          <strong>Chưa thể tải thực đơn</strong>
          <span>{error || 'Không thể tải dữ liệu thực đơn. Vui lòng thử lại.'}</span>
          {onRetry && <button type="button" onClick={onRetry}>Thử lại</button>}
        </section>
      ) : !menu ? (
        <section className="menu-viewer-message" role="status">
          <Utensils size={25} />
          <strong>Chưa có thực đơn được công khai cho tuần này</strong>
          <span>Thực đơn sẽ hiển thị tại đây sau khi nhà trường cập nhật.</span>
        </section>
      ) : (
        <div className="menu-day-grid">
          {weekDays.map(({ date, items }) => {
            const isToday = date === dateKey(new Date())
            const mealGroups = mealsForDay(items)
            return (
              <article className={`menu-day-card${isToday ? ' is-today' : ''}`} key={date}>
                <header className="menu-day-header">
                  <CalendarDays size={19} />
                  <div>
                    <h3>{formatDate(date, { weekday: 'long' })}</h3>
                    <time dateTime={date}>{formatDate(date, { day: '2-digit', month: '2-digit', year: 'numeric' })}</time>
                  </div>
                  {isToday && <span className="menu-today-badge">Hôm nay</span>}
                </header>
                {mealGroups.length ? (
                  <div className="menu-day-meals">
                    {mealGroups.map(({ name, items: mealItems }) => {
                      const Icon = MEAL_ICONS[name.toLocaleLowerCase('vi')] || Utensils
                      return (
                        <section className="menu-meal-group" key={name}>
                          <h4><Icon size={17} />{name}</h4>
                          <ul>
                            {mealItems.map((item, index) => (
                              <li key={item.id ?? `${date}-${name}-${index}`}>
                                <strong>{item.dish || 'Tên món chưa cập nhật'}</strong>
                                {item.ingredients && <p>Thành phần: {item.ingredients}</p>}
                                {item.note && <p className="menu-item-note">Ghi chú: {item.note}</p>}
                              </li>
                            ))}
                          </ul>
                        </section>
                      )
                    })}
                  </div>
                ) : (
                  <p className="menu-day-empty">
                    Nhà trường chưa cập nhật món ăn cho ngày này.
                  </p>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
