import { getSeedOfficialsByFips } from '../data/mockOfficials'
import type { CountiesIndex } from '../types/geo'
import type {
  ContributionInput,
  Official,
  PendingContribution,
} from '../types/officials'
import type { IDataRepository } from './repository'
import { supabase } from './supabaseClient'

let countiesCache: CountiesIndex | null = null

export class SupabaseRepository implements IDataRepository {
  async loadCounties(): Promise<CountiesIndex> {
    if (countiesCache) return countiesCache
    const res = await fetch('/data/counties-index.json')
    if (!res.ok) throw new Error('Failed to load counties index')
    countiesCache = (await res.json()) as CountiesIndex
    return countiesCache
  }

  async getOfficialsByFips(fips: string): Promise<Official[]> {
    const seed = getSeedOfficialsByFips(fips)
    if (!supabase) return seed

    const { data, error } = await supabase
      .from('officials')
      .select('*')
      .eq('county_fips', fips)
      .eq('status', 'approved')

    if (error) {
      console.warn('Supabase officials fetch failed, using seed only', error)
      return seed
    }

    const fromDb: Official[] = (data ?? []).map((row) => ({
      id: row.id as string,
      countyFips: row.county_fips as string,
      name: row.name as string,
      position: row.position as string,
      phone: (row.phone as string) || undefined,
      email: (row.email as string) || undefined,
      website: (row.website as string) || undefined,
      source: 'community' as const,
      status: 'approved' as const,
      updatedAt: (row.updated_at as string) ?? new Date().toISOString(),
    }))

    return [...seed, ...fromDb]
  }

  async getPendingContributions(): Promise<PendingContribution[]> {
    if (!supabase) return []
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('officials')
      .select('*')
      .eq('submitted_by', user.id)
      .eq('status', 'pending')

    if (error) return []

    return (data ?? []).map((row) => ({
      id: row.id as string,
      countyFips: row.county_fips as string,
      name: row.name as string,
      position: row.position as string,
      phone: (row.phone as string) || undefined,
      email: (row.email as string) || undefined,
      website: (row.website as string) || undefined,
      submittedAt: (row.created_at as string) ?? new Date().toISOString(),
      submittedBy: row.submitted_by as string,
      status: 'pending' as const,
    }))
  }

  async submitContribution(
    input: ContributionInput,
    submittedBy: string,
  ): Promise<PendingContribution> {
    if (!supabase) {
      throw new Error('Supabase is not configured')
    }

    const { data, error } = await supabase
      .from('officials')
      .insert({
        county_fips: input.countyFips,
        name: input.name,
        position: input.position,
        phone: input.phone ?? null,
        email: input.email ?? null,
        website: input.website ?? null,
        submitted_by: submittedBy,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id as string,
      countyFips: data.county_fips as string,
      name: data.name as string,
      position: data.position as string,
      phone: (data.phone as string) || undefined,
      email: (data.email as string) || undefined,
      website: (data.website as string) || undefined,
      submittedAt: (data.created_at as string) ?? new Date().toISOString(),
      submittedBy: data.submitted_by as string,
      status: 'pending',
    }
  }
}
