
'use client'

import { useEffect } from 'react'

export function ImpressionTracker({
  preview,
}: {
  preview: boolean
}) {
  useEffect(() => {
    if (preview) return

    fetch('/api/impressions', {
      method: 'POST',
    }).catch(console.error)
  }, [preview])

  return null
}
