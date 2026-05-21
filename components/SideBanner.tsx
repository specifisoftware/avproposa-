'use client'

import { useState } from 'react'

interface SideBannerProps {
  imageUrl: string
  linkUrl?: string | null
}

export function SideBanner({ imageUrl, linkUrl }: SideBannerProps) {
  const [failed, setFailed] = useState(false)

  if (failed) return null

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt="Sponsored"
      onError={() => setFailed(true)}
      className="w-full rounded-xl border border-gray-200 shadow-sm object-cover"
      style={{ minHeight: '300px', maxHeight: '600px' }}
    />
  )

  if (linkUrl) {
    return (
      <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
        {img}
      </a>
    )
  }
  return <div className="w-full">{img}</div>
}
