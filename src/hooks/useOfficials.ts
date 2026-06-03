import { useCallback, useEffect, useState } from 'react'
import type { Official, PendingContribution } from '../types/officials'
import { getRepository } from '../services/getRepository'

export function useOfficials(countyFips: string | null) {
  const [officials, setOfficials] = useState<Official[]>([])
  const [pending, setPending] = useState<PendingContribution[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!countyFips) {
      setOfficials([])
      setPending([])
      return
    }
    setLoading(true)
    const repo = getRepository()
    const [officialsList, allPending] = await Promise.all([
      repo.getOfficialsByFips(countyFips),
      repo.getPendingContributions(),
    ])
    setOfficials(officialsList)
    setPending(allPending.filter((p) => p.countyFips === countyFips))
    setLoading(false)
  }, [countyFips])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { officials, pending, loading, refresh }
}
