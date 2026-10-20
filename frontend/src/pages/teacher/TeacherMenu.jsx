import { CalendarDays, Utensils } from 'lucide-react'

export default function TeacherMenu({ menu }) {
  return (
    <div className="teacher-page">
      <div className="teacher-page-heading">
        <div>
          <span className="teacher-eyebrow">DỊNH DƯỠNG & CHĂM SÓC</span>
          <h2>Thực đơn trong tuần</h2>
          <p>Tham khảo các bữa ăn và nội dung dinh dưỡng trong dữ liệu minh họa.</p>
        </div>
      </div>
      <div className="teacher-week-menu">
        {menu.map((day) => (
          <section className="teacher-panel teacher-menu-day" key={day.day}>
            <div className="teacher-panel-heading" style={{ marginBottom: 3 }}>
              <div><CalendarDays size={18} /><h3>{day.day}</h3></div>
              <small>{day.date}</small>
            </div>
            <div className="teacher-meal-list">
              <div className="teacher-meal-row"><span className="teacher-meal-marker" /><div><strong><Utensils size={12} /> Bữa sáng</strong><span>{day.breakfast.dish} · {day.breakfast.beverage}</span></div></div>
              <div className="teacher-meal-row"><span className="teacher-meal-marker" /><div><strong><Utensils size={12} /> Bữa trưa</strong><span>{day.lunch.main}; {day.lunch.soup}; {day.lunch.side}; {day.lunch.dessert}</span></div></div>
              <div className="teacher-meal-row"><span className="teacher-meal-marker" /><div><strong><Utensils size={12} /> Bữa xế</strong><span>{day.afternoonSnack.dish} · {day.afternoonSnack.drink}</span></div></div>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
