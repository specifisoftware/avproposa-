interface SideBannerProps {
  imageUrl: string
  linkUrl?: string | null
}

export function SideBanner({ imageUrl, linkUrl }: SideBannerProps) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt="Sponsored"
      className="w-full rounded-xl border border-gray-200 shadow-sm object-cover"
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
