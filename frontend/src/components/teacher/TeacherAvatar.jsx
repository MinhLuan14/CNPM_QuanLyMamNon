import { useState } from 'react'
import { API_BASE_URL } from '../../config'

export default function TeacherAvatar({ imageUrl, name, className }) {
  const [failedSrc, setFailedSrc] = useState('')
  const initial = name?.trim().charAt(0).toLocaleUpperCase('vi-VN') || '?'
  const src = imageUrl
    ? (/^https?:\/\//i.test(imageUrl) ? imageUrl : `${API_BASE_URL}${imageUrl}`)
    : ''

  if (!src || failedSrc === src) {
    return <span className={className}>{initial}</span>
  }

  return (
    <img
      className={className}
      src={src}
      alt={`Ảnh đại diện ${name || 'giáo viên'}`}
      onError={() => setFailedSrc(src)}
    />
  )
}
