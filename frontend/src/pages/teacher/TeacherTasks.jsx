import { useState } from 'react'
import { CheckCircle2, ClipboardList } from 'lucide-react'

export default function TeacherTasks({ tasks: initialTasks, isAvailable = true }) {
  const [tasks, setTasks] = useState(initialTasks)
  const toggleTask = (taskId) => {
    setTasks((current) => current.map((task) => (
      task.id === taskId
        ? { ...task, status: task.status === 'Đã hoàn thành' ? 'Đang thực hiện' : 'Đã hoàn thành' }
        : task
    )))
  }

  return (
    <div className="teacher-page">
      <div className="teacher-page-heading">
        <div>
          <span className="teacher-eyebrow">KẾ HOẠCH CỦA GIÁO VIÊN</span>
          <h2>Công việc & báo cáo</h2>
          <p>Đánh dấu tiến độ để xem thử trải nghiệm cập nhật công việc (chỉ lưu trong phiên).</p>
        </div>
      </div>
      <section className="teacher-panel">
        <div className="teacher-panel-heading">
          <div><ClipboardList size={19} /><h3>Công việc được giao</h3></div>
          <span className="teacher-status-pill">{tasks.filter((task) => task.status === 'Đã hoàn thành').length}/{tasks.length} hoàn thành</span>
        </div>
        {!isAvailable ? (
          <div className="teacher-empty">Hệ thống chưa có API công việc và báo cáo cho giáo viên.</div>
        ) : tasks.length ? (
          <div className="teacher-task-list">
            {tasks.map((task) => (
              <label className={`teacher-task-row ${task.status === 'Đã hoàn thành' ? 'completed' : ''}`} key={task.id}>
                <input
                  className="teacher-task-check"
                  type="checkbox"
                  checked={task.status === 'Đã hoàn thành'}
                  onChange={() => toggleTask(task.id)}
                  aria-label={`Cập nhật trạng thái: ${task.title}`}
                />
                <div>
                  <strong>{task.title}</strong>
                  <span>{task.category} · Hạn {new Date(`${task.due}T00:00:00`).toLocaleDateString('vi-VN')}</span>
                  <span className="teacher-task-tag">{task.status}</span>
                </div>
                {task.status === 'Đã hoàn thành' && <CheckCircle2 size={18} color="#24a984" />}
              </label>
            ))}
          </div>
        ) : (
          <div className="teacher-empty">Chưa có công việc mẫu cho tài khoản này.</div>
        )}
      </section>
      <section className="teacher-panel">
        <div className="teacher-panel-heading">
          <div><CheckCircle2 size={19} /><h3>Báo cáo lớp</h3></div>
        </div>
        <div className="teacher-empty">Mẫu báo cáo để xem trước giao diện. Chức năng gửi/lưu báo cáo chưa kết nối backend.</div>
      </section>
    </div>
  )
}
