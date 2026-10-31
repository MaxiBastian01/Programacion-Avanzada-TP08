
'use client'

import { useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { recordConversion } from '@/app/practica/actions'

export function Cta({ label }: { label: string }) {
  const [message, setMessage] = useState('')
  const [pending, startTransition] = useTransition()
  const searchParams = useSearchParams()

  const preview = ['a', 'b'].includes(
    searchParams.get('preview') ?? ''
  )

  function handleClick() {
    if (preview) {
      setMessage('Vista previa: no se registra ninguna conversión.')
      return
    }

    startTransition(async () => {
      try {
        const result = await recordConversion(preview)

        if (result.status === 'recorded') {
          setMessage('¡Tu interés quedó registrado!')
        } else if (result.status === 'already-recorded') {
          setMessage('Ya habíamos registrado tu interés.')
        } else {
          setMessage('No se pudo registrar la conversión.')
        }
      } catch {
        setMessage('Ocurrió un error al registrar la conversión.')
      }
    })
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={handleClick}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {pending ? 'Registrando...' : label}
      </button>

      <p className="max-w-md text-sm text-muted-foreground">
        {message ||
          'La conversión se registra únicamente al presionar este botón.'}
      </p>
    </div>
  )
}
