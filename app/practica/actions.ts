
'use server'

import { cookies } from 'next/headers'
import { assignVariant, COOKIE } from '@/lib/experiment'
import { recordVisitorConversion } from '@/lib/events'

export async function recordConversion(
  isPreview: boolean = false
): Promise<{
  status: 'recorded' | 'already-recorded' | 'invalid'
}> {
  if (isPreview) {
    return { status: 'invalid' }
  }

  const cookieStore = await cookies()

  const visitorId = cookieStore.get(COOKIE.visitor)?.value
  const variant = cookieStore.get(COOKIE.variant)?.value

  if (!visitorId || variant !== assignVariant(visitorId)) {
    return { status: 'invalid' }
  }

  const inserted = recordVisitorConversion(visitorId, variant)

  return {
    status: inserted ? 'recorded' : 'already-recorded',
  }
}
