import { useEffect, useState } from 'react'
import type { CountyRecord } from '../types/geo'
import { getRepository } from '../services/getRepository'

export function useCounties() {
  const [counties, setCounties] = useState<CountyRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getRepository()
      .loadCounties()
      .then((index) => {
        const sorted = [...index.counties].sort(
          (a, b) => b.facility_count - a.facility_count,
        )
        setCounties(sorted)
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Failed to load counties')
      })
      .finally(() => setLoading(false))
  }, [])

  return { counties, loading, error }
}
