import { CalendarDays, Utensils } from 'lucide-react'

const dateLabel = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Ngày chưa xác định'
    : date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function ParentMenu({ menu }) {
  const grouped = menu.reduce((groups, item) => {
    const key = item.date?.slice(0, 10) || 'unknown'
    groups[key] ||= []
    groups[key].push(item)
    return groups
  }, {})
  const days = Object.entries(grouped)

  return (
    <div className="parent-page">
      <div className="parent-page-intro">
        <span className="parent-eyebrow">DINH DƯỠNG CỦA BÉ</span>
        <h2>Thực đơn trong tuần</h2>
        <p>Thực đơn do nhà trường công bố trong 7 ngày tới.</p>
      </div>
      {days.length ? (
        <div className="parent-week-menu">
          {days.map(([day, items]) => (
            <section className="parent-panel parent-day-card" key={day}>
              <div className="parent-day-heading">
                <CalendarDays size={19} />
                <h3>{day === 'unknown' ? 'Ngày chưa xác định' : dateLabel(items[0].date)}</h3>
              </div>
              <div className="parent-meal-list">
                {items.map((item) => (
                  <article className="parent-meal-item" key={item.id}>
                    <span className="parent-meal-icon"><Utensils size={18} /></span>
                    <div><small>{item.meal || 'Bữa ăn'}</small><strong>{item.dish || 'Chưa có tên món'}</strong>
                      {item.ingredients && <p>Thành phần: {item.ingredients}</p>}
                      {item.note && <p>Ghi chú: {item.note}</p>}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className="parent-panel parent-empty-large">
          <Utensils size={28} />
          <h3>Chưa có thực đơn được công bố</h3>
          <p>Thực đơn sẽ hiển thị tại đây sau khi nhà trường cập nhật.</p>
        </section>
      )}
    </div>
  )
}
