
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import {
  assignVariant,
  COOKIE,
  THIRTY_DAYS,
  cookieOptions,
  isVariant,
} from './lib/experiment'

export function proxy(request: NextRequest) {
  const preview = request.nextUrl.searchParams.get('preview')

  // Las vistas previas no crean ni modifican cookies.
  if (isVariant(preview)) {
    return NextResponse.next()
  }

  const userAgent = request.headers.get('user-agent') ?? ''
  const isCrawler = /Googlebot|Bingbot|DuckDuckBot|Slurp/i.test(userAgent)

  // Los rastreadores conocidos reciben siempre la variante A.
  if (isCrawler) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-lab-variant', 'a')
    requestHeaders.set('x-lab-crawler', '1')

    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  }

  const visitorCookie = request.cookies.get(COOKIE.visitor)?.value
  const variantCookie = request.cookies.get(COOKIE.variant)?.value

  const visitorId = visitorCookie || crypto.randomUUID()
  const variant = assignVariant(visitorId)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-lab-variant', variant)
  requestHeaders.set('x-lab-visitor', visitorId)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  const options = cookieOptions(
    request.nextUrl.protocol === 'https:',
    THIRTY_DAYS
  )

  if (!visitorCookie) {
    response.cookies.set(COOKIE.visitor, visitorId, options)
  }

  if (!isVariant(variantCookie) || variantCookie !== variant) {
    response.cookies.set(COOKIE.variant, variant, options)
  }

  return response
}

export const config = {
  matcher: ['/practica'],
}
