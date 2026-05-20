'use client'

interface BlogIframeProps {
  html: string
  css: string
}

export function BlogIframe({ html, css }: BlogIframeProps) {
  const srcDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; }
    ${css}
  </style>
</head>
<body>${html}</body>
</html>`

  return (
    <iframe
      srcDoc={srcDoc}
      className="w-full border-0"
      style={{ minHeight: '60vh' }}
      onLoad={(e) => {
        const el = e.target as HTMLIFrameElement
        try {
          const h = el.contentDocument?.body?.scrollHeight
          if (h) el.style.height = h + 32 + 'px'
        } catch {}
      }}
      title="Blog content"
      sandbox="allow-scripts allow-same-origin"
    />
  )
}
