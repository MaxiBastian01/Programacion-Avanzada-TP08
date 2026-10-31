import type { Metadata } from 'next'
import Link from 'next/link'
import { getExperimentLog } from '@/lib/events'
import {
  HASH_EXAMPLE_ID,
  TEST_CASE,
  VARIANTS,
  assignVariant,
  conversionRate,
  formatCount,
  formatPoints,
  formatRate,
  rateGap,
  type Variant,
} from '@/lib/experiment'
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Bitácora',
  robots: { index: false, follow: false },
}

const ROWS: Variant[] = ['a', 'b']

export default function BitacoraPage() {
  const log = getExperimentLog()

  return (
    <main id="contenido" className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10 md:py-14">
      <p className="font-mono text-[0.7rem] tracking-[0.16em] text-muted-foreground uppercase">
        Experimento A/B · Taller Norte
      </p>
      <h1 className="max-w-2xl font-serif text-4xl tracking-tight text-balance md:text-5xl">
        Resultados del experimento
      </h1>
      <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
        Comparación de las variantes A y B mediante impresiones, conversiones y tasas de conversión. Los resultados no permiten declarar automáticamente un ganador estadístico.
      </p>
      <table className="w-full text-left text-sm">
        <caption className="mb-3 text-left text-muted-foreground">
          Cohorte fija. Cuando la fórmula esté, A tiene que dar 7,50%, B 13,14% y la diferencia 5,64 pp.
        </caption>
        <thead>
          <tr className="border-b border-border">
            <th className="py-2 font-medium">Variante</th>
            <th className="py-2 font-medium">Impresiones</th>
            <th className="py-2 font-medium">Conversiones</th>
            <th className="py-2 font-medium">Tasa</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((variant) => (
            <tr key={variant} className="border-b border-border">
              <td className="py-3">
                {variant.toUpperCase()} · {VARIANTS[variant].name}
              </td>
              <td className="py-3 font-mono">{formatCount(TEST_CASE[variant].impressions)}</td>
              <td className="py-3 font-mono">{formatCount(TEST_CASE[variant].conversions)}</td>
              <td className="py-3 font-mono">{formatRate(conversionRate(TEST_CASE[variant]))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="font-mono text-sm">B − A = {formatPoints(rateGap(TEST_CASE))}</p>
      <p className="font-mono text-sm">
        assignVariant({`'${HASH_EXAMPLE_ID}'`}) → {assignVariant(HASH_EXAMPLE_ID).toUpperCase()}
      </p>

      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-2xl">
          Resultados reales del experimento
        </h2>

        <p className="text-sm text-muted-foreground">
          Eventos registrados en SQLite.
        </p>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2">Variante</th>
              <th className="py-2">Impresiones</th>
              <th className="py-2">Conversiones</th>
              <th className="py-2">Tasa</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((variant) => (
              <tr key={variant} className="border-b border-border">
                <td className="py-3">
                  {variant.toUpperCase()}
                </td>
                <td className="py-3 font-mono">
                  {formatCount(log[variant].impressions)}
                </td>
                <td className="py-3 font-mono">
                  {formatCount(log[variant].conversions)}
                </td>
                <td className="py-3 font-mono">
                  {formatRate(conversionRate(log[variant]))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="font-mono text-sm">
          Diferencia B − A: {formatPoints(rateGap(log))}
        </p>
      </section>

      <Link href="/practica" className="text-sm text-muted-foreground underline">
        Volver a la landing
      </Link>
    </main>
  )
}
