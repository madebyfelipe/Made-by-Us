'use client'

import { useMemo } from 'react'
import DOMPurify from 'dompurify'

type Props = {
  html: string
}

const baseStyles = `
  body {
    margin: 0;
    padding: 20px;
    background: #ffffff;
    color: #0a0a0a;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    line-height: 1.6;
  }
`

function wrapInDocument(body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${baseStyles}</style></head><body>${body}</body></html>`
}

export default function ClientHtmlPreview({ html }: Props) {
  const srcDoc = useMemo(() => {
    const sanitized = DOMPurify.sanitize(html)
    return wrapInDocument(sanitized)
  }, [html])

  if (!html.trim()) {
    return <p className="text-xs text-[#525252]">Sem conteúdo HTML customizado.</p>
  }

  return (
    <iframe
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      title="Perfil do cliente"
      className="w-full rounded-xl border border-[#2A2A2A]"
      style={{ height: '480px' }}
    />
  )
}
