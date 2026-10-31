
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomUUID } from 'node:crypto'

import {
    assignVariant,
    COOKIE,
    SESSION_WINDOW,
} from '@/lib/experiment'

import { recordImpression } from '@/lib/events'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
    const userAgent = request.headers.get('user-agent') ?? ''

    const isCrawler = /Googlebot|Bingbot|DuckDuckBot|Slurp/i.test(userAgent)

    if (isCrawler) {
        return NextResponse.json({
            recorded: false,
            reason: 'crawler',
        })
    }

    const originPage = request.headers.get('referer')

    if (originPage) {
        const url = new URL(originPage)

        if (['a', 'b'].includes(url.searchParams.get('preview') ?? '')) {
            return NextResponse.json({
                recorded: false,
                reason: 'preview',
            })
        }
    }
    const cookieStore = await cookies()

    const visitorId = cookieStore.get(COOKIE.visitor)?.value
    const variantCookie = cookieStore.get(COOKIE.variant)?.value

    if (!visitorId || variantCookie !== assignVariant(visitorId)) {
        return NextResponse.json(
            { error: 'Visitante sin asignación válida' },
            { status: 400 }
        )
    }

    const existingSession = cookieStore.get(COOKIE.impressed)?.value
    const sessionId = existingSession || randomUUID()

    const inserted = recordImpression(
        visitorId,
        assignVariant(visitorId),
        sessionId
    )

    const response = NextResponse.json({
        recorded: inserted,
    })

    if (!existingSession) {
        response.cookies.set(COOKIE.impressed, sessionId, {
            path: '/',
            httpOnly: true,
            secure: request.nextUrl.protocol === 'https:',
            sameSite: 'lax',
            maxAge: SESSION_WINDOW,
        })
    }

    return response
}
