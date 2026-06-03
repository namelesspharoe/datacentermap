import { mockRepository } from './mockRepository'
import type { IDataRepository } from './repository'
import { SupabaseRepository } from './supabaseRepository'
import { useSupabase } from './supabaseClient'

let instance: IDataRepository | null = null

export function getRepository(): IDataRepository {
  if (!instance) {
    instance = useSupabase ? new SupabaseRepository() : mockRepository
  }
  return instance
}
