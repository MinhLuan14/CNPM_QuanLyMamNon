import { Baby, Search, Users } from 'lucide-react'

export default function TeacherChildren({ data }) {
  const { classroom, children } = data

  return (
    <div className="teacher-page">
      <div className="teacher-page-heading">
        <div>
          <span className="teacher-eyebrow">HỒ SƠ LỚP PHỤ TRÁCH</span>
          <h2>Danh sách trẻ</h2>
          <p>{classroom ? `Lớp ${classroom.name} · ` : ''}Chỉ hiển thị hồ sơ thuộc lớp được gắn với tài khoản mẫu này.</p>
        </div>
      </div>
      <section className="teacher-panel">
        <div className="teacher-panel-heading">
          <div><Users size={19} /><h3>Hồ sơ trẻ ({children.length})</h3></div>
          <Search size={17} color="#91a3ad" />
        </div>
        {children.length ? (
          <div className="teacher-child-table-wrap">
            <table className="teacher-child-table">
              <thead><tr><th>HỌ TÊN</th><th>NGÀY SINH</th><th>PHỤ HUYNH</th><th>LIÊN HỆ</th><th>TÌNH TRẠNG</th></tr></thead>
              <tbody>
                {children.map((child) => (
                  <tr key={child.id}>
                    <td><strong><Baby size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />{child.name}</strong><br />{child.nickname}</td>
                    <td>{new Date(`${child.dob}T00:00:00`).toLocaleDateString('vi-VN')}</td>
                    <td>{child.parentName} ({child.parentRelationship})</td>
                    <td>{child.parentPhone}</td>
                    <td><span className="teacher-status-pill">{child.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="teacher-empty">Chưa có hồ sơ trẻ minh họa cho lớp này. Đây là giao diện tĩnh, chưa đọc dữ liệu thật.</div>
        )}
      </section>
      <p style={{ margin: 0, color: '#82949e', fontSize: 10 }}>
        Danh sách này là dữ liệu mẫu có sẵn trong frontend, không phải danh sách đầy đủ của lớp.
      </p>
    </div>
  )
}
