'use client'

import { useEffect, useRef } from 'react'

interface BlogIframeProps {
  html: string
  css: string
}

export function BlogIframe({ html, css }: BlogIframeProps) {
  const ref = useRef<HTMLIFrameElement>(null)

  // Auto-resize: iframe sends its body.scrollHeight via postMessage
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'blog-resize' && ref.current) {
        ref.current.style.height = e.data.height + 'px'
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const srcDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    /* ── Reset ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 16px; -webkit-text-size-adjust: 100%; }

    /* ── Base ── */
    body {
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      line-height: 1.75;
      color: #1e293b;
      background: #ffffff;
      padding: 2.5rem clamp(1rem, 5vw, 4rem);
      max-width: 100%;
      overflow-x: hidden;
      word-break: break-word;
    }

    /* ── Typography ── */
    h1, h2, h3, h4, h5, h6 {
      font-weight: 700;
      line-height: 1.2;
      color: #0f172a;
      margin-top: 2em;
      margin-bottom: 0.6em;
      letter-spacing: -0.01em;
    }
    h1 { font-size: clamp(1.6rem, 4vw, 2.25rem); }
    h2 { font-size: clamp(1.3rem, 3vw, 1.625rem); }
    h3 { font-size: clamp(1.1rem, 2.5vw, 1.3rem); }
    h4 { font-size: 1.1rem; }
    h5, h6 { font-size: 1rem; }

    p { margin-bottom: 1.25em; }
    p:last-child { margin-bottom: 0; }

    a { color: #2563eb; text-decoration: underline; text-underline-offset: 3px; }
    a:hover { color: #1d4ed8; }

    strong, b { font-weight: 600; color: #0f172a; }
    em, i { font-style: italic; }
    small { font-size: 0.875em; color: #64748b; }
    mark { background: #fef9c3; color: #713f12; padding: 0.1em 0.3em; border-radius: 3px; }

    /* ── Lists ── */
    ul, ol { padding-left: 1.75em; margin-bottom: 1.25em; }
    ul { list-style-type: disc; }
    ol { list-style-type: decimal; }
    li { margin-bottom: 0.4em; line-height: 1.65; }
    li > ul, li > ol { margin-top: 0.4em; margin-bottom: 0.4em; }

    /* ── Images ── */
    img, video, iframe {
      max-width: 100%;
      height: auto;
      display: block;
      border-radius: 10px;
      margin: 1.5em auto;
    }
    figure { margin: 2em 0; text-align: center; }
    figcaption { font-size: 0.85em; color: #64748b; margin-top: 0.5em; }

    /* ── Code ── */
    code {
      font-family: 'Menlo', 'Consolas', 'Monaco', monospace;
      font-size: 0.85em;
      background: #f1f5f9;
      color: #0f172a;
      padding: 0.2em 0.45em;
      border-radius: 5px;
      border: 1px solid #e2e8f0;
    }
    pre {
      background: #0d1117;
      color: #e6edf3;
      padding: 1.25rem 1.5rem;
      border-radius: 12px;
      overflow-x: auto;
      margin: 1.75em 0;
      font-size: 0.875em;
      line-height: 1.65;
      border: 1px solid #30363d;
    }
    pre code {
      background: none; color: inherit; padding: 0;
      font-size: inherit; border: none; border-radius: 0;
    }

    /* ── Tables ── */
    .table-wrap { overflow-x: auto; margin: 1.75em 0; border-radius: 10px; border: 1px solid #e2e8f0; }
    table { width: 100%; border-collapse: collapse; font-size: 0.9em; }
    thead { background: #f8fafc; }
    th {
      font-weight: 600; text-align: left; color: #475569;
      padding: 0.75em 1em; border-bottom: 1px solid #e2e8f0;
      font-size: 0.8em; text-transform: uppercase; letter-spacing: 0.05em;
    }
    td { padding: 0.75em 1em; border-bottom: 1px solid #f1f5f9; color: #334155; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover { background: #f8fafc; }

    /* ── Blockquote ── */
    blockquote {
      border-left: 4px solid #2563eb;
      padding: 1em 1.5em;
      margin: 2em 0;
      background: #eff6ff;
      border-radius: 0 12px 12px 0;
      color: #1e40af;
    }
    blockquote p { margin-bottom: 0; font-style: italic; }
    blockquote cite { font-size: 0.85em; color: #64748b; display: block; margin-top: 0.5em; font-style: normal; }

    /* ── Dividers ── */
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 2.5em 0; }

    /* ── Utility classes admins can use ── */
    .container { max-width: 720px; margin: 0 auto; }
    .text-center { text-align: center; }
    .text-right  { text-align: right; }
    .lead { font-size: 1.2em; color: #475569; line-height: 1.6; }
    .muted { color: #94a3b8; }
    .badge {
      display: inline-block; font-size: 0.75em; font-weight: 600;
      padding: 0.25em 0.7em; border-radius: 999px;
      background: #eff6ff; color: #2563eb; letter-spacing: 0.03em;
    }
    .card {
      background: #fff; border: 1px solid #e2e8f0;
      border-radius: 14px; padding: 1.5em; margin: 1.5em 0;
      box-shadow: 0 1px 3px rgba(0,0,0,.06);
    }
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25em; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.25em; }

    /* ── Remove top margin from first element ── */
    body > *:first-child, .container > *:first-child { margin-top: 0; }

    /* ── Admin custom CSS ── */
    ${css}
  </style>
</head>
<body>
${html}
<script>
  function notifyHeight() {
    var h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    window.parent.postMessage({ type: 'blog-resize', height: h }, '*');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', notifyHeight);
  } else {
    notifyHeight();
  }
  window.addEventListener('load', notifyHeight);
  try { new ResizeObserver(notifyHeight).observe(document.body); } catch(e) {}
</script>
</body>
</html>`

  return (
    <iframe
      ref={ref}
      srcDoc={srcDoc}
      className="w-full border-0 block"
      style={{ minHeight: '300px', transition: 'height 0.15s ease' }}
      title="Blog content"
      sandbox="allow-scripts allow-same-origin"
    />
  )
}
