
import 'server-only'
import db from './db'
import {
  emptyLog,
  type ExperimentLog,
  type Variant,
} from './experiment'

export function recordImpression(
  visitorId: string,
  variant: Variant,
  sessionId: string
): boolean {
  const result = db.prepare(`
    INSERT OR IGNORE INTO events
      (visitor_id, variant, event_type, session_id)
    VALUES (?, ?, 'impression', ?)
  `).run(visitorId, variant, sessionId)

  return result.changes > 0
}


export function recordVisitorConversion(
  visitorId: string,
  variant: Variant
): boolean {
  const result = db.prepare(`
    INSERT OR IGNORE INTO events
      (visitor_id, variant, event_type)
    SELECT ?, ?, 'conversion'
    WHERE EXISTS (
      SELECT 1
      FROM events
      WHERE visitor_id = ?
        AND variant = ?
        AND event_type = 'impression'
    )
  `).run(visitorId, variant, visitorId, variant)

  return result.changes > 0
}

export function getExperimentLog(): ExperimentLog {
  const log = emptyLog()

  const rows = db.prepare(`
    SELECT
      variant,
      event_type,
      COUNT(*) AS total
    FROM events
    GROUP BY variant, event_type
  `).all() as Array<{
    variant: Variant
    event_type: 'impression' | 'conversion'
    total: number
  }>

  for (const row of rows) {
    if (row.variant !== 'a' && row.variant !== 'b') continue

    if (row.event_type === 'impression') {
      log[row.variant].impressions = row.total
    }

    if (row.event_type === 'conversion') {
      log[row.variant].conversions = row.total
    }
  }

  return log
}
