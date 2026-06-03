import { getSeedOfficialsByFips } from '../data/mockOfficials'
import type { CountiesIndex } from '../types/geo'
import type {
  ContributionInput,
  Official,
  PendingContribution,
} from '../types/officials'
import type { IDataRepository } from './repository'

const STORAGE_KEY = 'dc-map-pending-contributions'

function loadPending(): PendingContribution[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as PendingContribution[]
  } catch {
    return []
  }
}

function savePending(items: PendingContribution[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

let countiesCache: CountiesIndex | null = null
let officialsCache: Record<string, Official[]> | null = null

async function loadOfficials(): Promise<Record<string, Official[]>> {
  if (officialsCache) return officialsCache

  try {
    const res = await fetch('/data/county-officials.json')
    if (!res.ok) throw new Error('Officials data not available')
    const data = (await res.json()) as {
      officials: Record<
        string,
        { officials: Official[]; officesByLevel: Record<string, Official[]> }
      >
    }

    // Flatten the structure to just get officials by FIPS
    officialsCache = {}
    for (const [fips, countyData] of Object.entries(data.officials)) {
      officialsCache[fips] = countyData.officials
    }
    return officialsCache
  } catch {
    // Fall back to empty cache if file not found
    return {}
  }
}

export class MockRepository implements IDataRepository {
  async loadCounties(): Promise<CountiesIndex> {
    if (countiesCache) return countiesCache
    const res = await fetch('/data/counties-index.json')
    if (!res.ok) throw new Error('Failed to load counties index')
    countiesCache = (await res.json()) as CountiesIndex
    return countiesCache
  }

  async getOfficialsByFips(fips: string): Promise<Official[]> {
    // Try to fetch from local proxy API (server must be running via `npm run start-api`)
    try {
      const res = await fetch(`/api/officials?fips=${encodeURIComponent(fips)}`)
      if (res.ok) {
        const data = await res.json()
        if (data && Array.isArray(data.officials)) {
          return data.officials as Official[]
        }
      }
    } catch {
      // ignore and fall back
    }

    // Next try to load pre-fetched officials cache if present
    const officials = await loadOfficials()
    if (officials[fips]) return officials[fips]

    // Fall back to seed/mock data
    return getSeedOfficialsByFips(fips)
  }

  async getPendingContributions(): Promise<PendingContribution[]> {
    return loadPending()
  }

  async submitContribution(
    input: ContributionInput,
    submittedBy: string,
  ): Promise<PendingContribution> {
    const item: PendingContribution = {
      ...input,
      id: `pending-${crypto.randomUUID()}`,
      submittedAt: new Date().toISOString(),
      submittedBy,
      status: 'pending',
    }
    const all = loadPending()
    all.push(item)
    savePending(all)
    return item
  }
}

export const mockRepository = new MockRepository()
