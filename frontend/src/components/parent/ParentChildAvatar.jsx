import { useState } from 'react'
import { API_BASE_URL } from '../../config'

export default function ParentChildAvatar({ child, className }) {
  const [failedUrl, setFailedUrl] = useState('')
  const imageUrl = child?.imageUrl || ''
  const src = imageUrl
    ? (/^https?:\/\//i.test(imageUrl) ? imageUrl : `${API_BASE_URL}${imageUrl}`)
    : ''
  const initial = child?.firstName?.trim().slice(0, 1)
    || child?.fullName?.trim().slice(0, 1)
    || '—'

  return (
    <span className={className}>
      {src && failedUrl !== src ? (
        <img
          src={src}
          alt={`Ảnh đại diện của ${child?.fullName || 'bé'}`}
          onError={() => setFailedUrl(src)}
        />
      ) : (
        <span aria-hidden="true">{initial}</span>
      )}
    </span>
  )
}
